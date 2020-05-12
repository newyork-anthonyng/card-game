import "./styles.css";
import { createMachine, assign, interpret } from "xstate";

const machine = createMachine(
  {
    id: "rectangle-selection",
    context: {
      originalX: 0,
      originalY: 0,
      newX: 0,
      newY: 0,
    },
    initial: "idle",
    states: {
      idle: {
        on: {
          mousedown: {
            target: "dragging",
            actions: "cacheInitialMouseCoordinates",
          },
        },
      },
      dragging: {
        exit: "clearMouseCoordinates",
        on: {
          mousemove: {
            actions: "cacheMouseCoordinates",
          },
          mouseup: {
            target: "idle",
          },
        },
      },
    },
  },
  {
    actions: {
      cacheInitialMouseCoordinates: assign((_, event) => {
        return {
          originalX: event.clientX,
          originalY: event.clientY,
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
      })
    },
  }
);

const service = interpret(machine).onTransition(state => {
  if (state.changed) {
    renderDebug(state);
    renderSelectionRectangle(state.context);
  }
});
service.start();

document.addEventListener("mousedown", function(e) {
  const $rectangleSelection = getRectangleSelection();
  $rectangleSelection.hidden = 0;
  console.log("document.body#mousedown")
  service.send(e);
});
document.addEventListener("mousemove", function(e) {
  service.send(e);
});
document.addEventListener("mouseup", function(e) {
  const $rectangleSelection = getRectangleSelection();
  $rectangleSelection.hidden = 1;
  service.send(e);
});


// http://jsfiddle.net/jLqHv/
// Rectangle Selection inspired by JSFiddle
function renderSelectionRectangle(context) {
  const { originalX, originalY, newX, newY } = context;

  const left = Math.min(originalX, newX);
  const right = Math.max(originalX, newX);
  const top = Math.min(originalY, newY);
  const bottom = Math.max(originalY, newY);

  const $rectangleSelection = getRectangleSelection();
  $rectangleSelection.style.left = `${left}px`;
  $rectangleSelection.style.top = `${top}px`;
  $rectangleSelection.style.width = `${right - left}px`;
  $rectangleSelection.style.height = `${bottom - top}px`;
}

function getRectangleSelection() {
  if (window._selectionElement) {
    return window._selectionElement;
  } else {
    window._selectionElement = document.querySelector(".js-selection");
    return window._selectionElement;
  }
}


function renderDebug(state) {
  if (!window._debug) {
    window._debug = document.querySelector(".js-debug");
  }

  window._debug.innerHTML = `<pre>${JSON.stringify(state, null, 2)}</pre>`;
}
