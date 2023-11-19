import { createMachine } from "xstate";

export const accordionMachine = createMachine({
  id: "accordion",
  initial: "closed",
  states: {
    opened: {
      on: {
        CLOSE: {
          target: "closed",
        },
      },
    },
    closed: {
      on: {
        OPEN: {
          target: "opened",
        },
      },
    },
  },
});
