import "./styles.css";
import generateMachine from "./machine";
import { interpret } from "xstate";

const machine = generateMachine({
  onMouseUp: (context) => {
    const $rectangleSelection = getRectangleSelection();
    $rectangleSelection.hidden = 1;

    const $cards = getCardsInSelection(context);
    console.log($cards);
  },
  onMouseDown: () => {
    const $rectangleSelection = getRectangleSelection();
    $rectangleSelection.hidden = 0;
  },
  cards: getAllCards()
})
const service = interpret(machine).onTransition(state => {
  if (state.changed) {
    renderDebug(state);
    renderSelectionRectangle(state.context);
  }
});
service.start();

document.addEventListener("mousedown", function(e) {
  service.send(e);
});
document.addEventListener("mousemove", function(e) {
  service.send(e);
});
document.addEventListener("mouseup", function(e) {
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

function getCardsInSelection(context) {
  const $allCards = getAllCards();

  const rectangle = {
    left: Math.min(context.originalX, context.newX),
    right: Math.max(context.originalX, context.newX),
    top: Math.min(context.originalY, context.newY),
    bottom: Math.max(context.originalY, context.newY)
  }
  console.group('getCardsInSelection');
  console.log(context);
  console.log(rectangle);
  console.groupEnd('getCardsInSelection');

  const selectedCards = [];
  for (let i = 0; i < $allCards.length; i++) {
    if (isCardInSelection($allCards[i], rectangle)) {
      selectedCards.push($allCards[i]);
    }
  }

  return selectedCards;
}

function getAllCards() {
  if (window._cards) {
    return window._cards;
  } else {
    window._cards = document.querySelectorAll('.js-card');
    return window._cards;
  }
}

function isCardInSelection($ele, rectangle) {
  const clientRect = $ele.getBoundingClientRect();
  const $eleRectangle = {
    left: clientRect.left,
    right: clientRect.right,
    top: clientRect.top,
    bottom: clientRect.bottom
  };

  console.log($eleRectangle);
  console.log(rectangle);

  const isXIntersecting = ($eleRectangle.left < rectangle.right && $eleRectangle.left > rectangle.left) || ($eleRectangle.right < rectangle.right && $eleRectangle.right > rectangle.left);
  const isYIntersecting = ($eleRectangle.top > rectangle.top && $eleRectangle.top < rectangle.bottom) || ($eleRectangle.bottom > rectangle.top && $eleRectangle.bottom < rectangle.bottom);

  return isXIntersecting && isYIntersecting;
}
