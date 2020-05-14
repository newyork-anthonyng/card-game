import { createMachine } from "xstate";

const machine = createMachine({
  id: "card",
  context: {
    x: 0,
    y: 0
  },
  initial: "idle",
  states: {
    idle: {
      on: {
        SELECTED: "selected"
      }
    },
    selected: {}
  }
});

export default machine;
