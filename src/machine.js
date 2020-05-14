import { createMachine, assign, spawn } from "xstate";
import cardMachine from "./cardMachine";

const machine = ({ cards, onMouseDown, onMouseUp }) => createMachine(
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
        on: {
          mousedown: {
            target: "dragging",
            actions: [
              "clearMouseCoordinates",
              "cacheInitialMouseCoordinates",
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
          mouseup: {
            actions: ["onMouseUp"],
            target: "idle",
          },
        },
      },
    },
  },
  {
    actions: {
      initializeCards: assign((context) => {
        console.log("initializeCards");
        console.log(context);
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
