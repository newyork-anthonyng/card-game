import { createMachine, assign, spawn } from "xstate";
import cardMachine from "./cardMachine";

const machine = ({ cards, onMouseDown, onMouseUp, areCardsSelected, selectCards, unselectCards }) => createMachine(
  {
    id: "rectangle-selection",
    context: {
      originalX: 0,
      originalY: 0,
      newX: 0,
      newY: 0,
      cards: cards || []
    },
    initial: "loading",
    states: {
      loading: {
        entry: "initializeCards",
        on: {
          "": "idle"
        }
      },
      idle: {
        entry: "unselectCards",
        on: {
          mousedown: {
            target: "dragging",
            actions: [
              "clearMouseCoordinates",
              "cacheInitialMouseCoordinates",
              "unselectCards",
              "onMouseDown"
            ],
          },
        },
      },
      dragging: {
        on: {
          mousemove: {
            actions: ["cacheMouseCoordinates"],
          },
          mouseup: [
            {
              cond: "areCardsSelected",
              target: "selected"
            },
            "idling"
          ]
        },
      },
      idling: {
        entry: ["onMouseUp"],
        on: {
          "": "idle"
        }
      },
      selected: {
        entry: ["onMouseUp", "selectCards"],
        on: {
          mousedown: {
            target: "idle",
            actions: "onMouseUp"
          }
        }
      }
    },
  },
  {
    guards: {
      areCardsSelected: areCardsSelected
    },
    actions: {
      initializeCards: assign((context) => {
        context.cards.forEach(card => {
          card._ref = spawn(cardMachine);
        })
        return {
          cards: context.cards
        }
      }),
      cacheInitialMouseCoordinates: assign((_, event) => {
        return {
          originalX: event.clientX,
          originalY: event.clientY,
          newX: event.clientX,
          newY: event.clientY
        };
      }),
      cacheMouseCoordinates: assign((_, event) => {
        return {
          newX: event.clientX,
          newY: event.clientY,
        };
      }),
      clearMouseCoordinates: assign(() => {
        return {
          originalX: 0,
          originalY: 0,
          newX: 0,
          newY: 0
        }
      }),
      selectCards: selectCards,
      unselectCards: unselectCards,
      onMouseDown: (context) => {
        onMouseDown && onMouseDown(context);
      },
      onMouseUp: (context) => {
        onMouseUp && onMouseUp(context);
      }
    },
  }
);

export default machine;
