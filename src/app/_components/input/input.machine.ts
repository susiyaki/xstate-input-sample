import { PromiseActorLogic, assign, createMachine, fromPromise } from "xstate";
import { ZodEffects, ZodError, ZodString, ZodTypeAny, z } from "zod";

type Context = {
  initialValue: string;
  value: string;
  required: boolean;
  validator: ZodTypeAny;
  error: ZodError | undefined;
  mode: "onBlur" | "onChange" | "onTouched" | "all";
};

type Events =
  | { type: "FOCUS" }
  | { type: "ENABLE" }
  | { type: "DISABLE" }
  | { type: "BLUR" }
  | { type: "CHANGE"; value: string }
  | {
    type: "xstate.done.actor.validate";
    output: ZodError<string> | undefined;
  };

type Actors = {
  id: "validate";
  src: "validate";
  logic: PromiseActorLogic<
    ZodError | undefined,
    { validator: ZodTypeAny; value: string }
  >;
};

type Actions =
  | { type: "setValue"; value: string }
  | {
    type: "setError";
    error: ZodError | undefined;
  };

type Input = Partial<Pick<Context, "initialValue" | "validator" | "mode">>;

type Guards =
  | { type: "isAllMode" }
  | { type: "isOnBlurMode" }
  | { type: "isOnChangeMode" }
  | { type: "isOnTouchedMode" }
  | { type: "isDirty" }
  | { type: "isPristine" }
  | { type: "isValid" }
  | { type: "isInvalid" };

const isDirty = ({ context }: { context: Context }) =>
  context.initialValue !== context.value;
const isPristine = ({ context }: { context: Context }) => !isDirty({ context });
const isValid = ({ context }: { context: Context }) => {
  if (context.required && !context.value) return false;
  return !context.error;
};
const isInvalid = ({ context }: { context: Context }) => !isValid({ context });

/**
 * ZodStringまたはZodEffects(refine, superRefine)のみをサポート
 * min(0)があるかどうかでallowEmptyを判定する
 */
const getAllowEmpty = (schema: ZodTypeAny): boolean => {
  if (schema instanceof ZodEffects) {
    return getAllowEmpty(schema._def.schema);
  }
  if (schema instanceof ZodString) {
    return schema._def.checks.some(
      (check) => check.kind === "min" && check.value === 0,
    );
  }
  throw new Error("Invalid schema");
};

export const inputMachine = createMachine(
  {
    id: "inputMachine",
    type: "parallel",
    types: {
      actions: {} as Actions,
      events: {} as Events,
      context: {} as Context,
      input: {} as Input,
      actors: {} as Actors,
      guards: {} as Guards,
    },
    context: ({ input }) => {
      const initialValue = input.initialValue ?? "";
      const validator = input.validator ?? z.string();
      const allowEmpty = getAllowEmpty(validator);

      return {
        initialValue,
        value: initialValue,
        required: !allowEmpty,
        validator,
        error: undefined,
        mode: input.mode ?? "all",
      };
    },
    states: {
      touchState: {
        initial: "untouched",
        states: {
          untouched: {
            on: {
              FOCUS: {
                target: "touched",
              },
            },
          },
          touched: {
            type: "final",
          },
        },
      },
      dirtyState: {
        initial: "pristine",
        states: {
          pristine: {
            always: {
              target: "dirty",
              guard: "isDirty",
            },
          },
          dirty: {
            always: {
              target: "pristine",
              guard: "isPristine",
            },
          },
        },
      },
      validity: {
        initial: "invalid",
        states: {
          invalid: {
            always: {
              target: "valid",
              guard: "isValid",
            },
          },
          valid: {
            always: {
              target: "invalid",
              guard: "isInvalid",
            },
          },
        },
      },
      validationState: {
        initial: "idle",
        states: {
          idle: {
            always: {
              target: "validating",
              guard: "isAllMode",
            },
            on: {
              CHANGE: [
                {
                  guard: "isOnChangeMode",
                  target: "validating",
                },
              ],
              BLUR: [
                {
                  guard: "isOnBlurMode",
                  target: "validating",
                },
                {
                  guard: "isOnTouchedMode",
                  target: "validating",
                },
              ],
            },
          },
          validating: {
            on: {
              CHANGE: [
                {
                  guard: "isAllMode",
                  target: "validating",
                },
                {
                  guard: "isOnChangeMode",
                  target: "validating",
                },
                {
                  guard: "isOnTouchedMode",
                  target: "validating",
                },
              ],
              BLUR: [
                {
                  guard: "isAllMode",
                  target: "validating",
                },
                {
                  guard: "isOnBlurMode",
                  target: "validating",
                },
              ],
            },
            invoke: {
              id: "validate",
              src: "validate",
              input: ({ context }) => {
                return {
                  value: context.value,
                  validator: context.validator,
                };
              },
              onDone: [
                {
                  target: "validated",
                  actions: {
                    type: "setError",
                  },
                },
              ],
            },
          },
          validated: {
            on: {
              CHANGE: [
                {
                  guard: "isAllMode",
                  target: "validating",
                },
                {
                  guard: "isOnChangeMode",
                  target: "validating",
                },
                {
                  guard: "isOnTouchedMode",
                  target: "validating",
                },
              ],
              BLUR: [
                {
                  guard: "isAllMode",
                  target: "validating",
                },
                {
                  guard: "isOnBlurMode",
                  target: "validating",
                },
              ],
            },
          },
        },
      },
      editableState: {
        initial: "enabled",
        states: {
          enabled: {
            states: {
              focusState: {
                initial: "unfocused",
                states: {
                  unfocused: {
                    on: {
                      FOCUS: {
                        target: "focused",
                      },
                    },
                  },
                  focused: {
                    on: {
                      BLUR: {
                        target: "unfocused",
                      },
                      CHANGE: {
                        actions: {
                          type: "setValue",
                        },
                      },
                    },
                  },
                },
              },
            },
            on: {
              DISABLE: {
                target: "disabled",
              },
            },
            type: "parallel",
          },
          disabled: {
            on: {
              ENABLE: {
                target: "enabled",
              },
            },
          },
        },
      },
    },
  },
  {
    actions: {
      setValue: assign(({ event }) => {
        if (event.type !== "CHANGE") return {};
        return {
          value: event.value,
        };
      }),
      setError: assign(({ event }) => {
        if (event.type !== "xstate.done.actor.validate") return {};
        return {
          error: event.output,
        };
      }),
    },
    actors: {
      validate: fromPromise(async ({ input }) => {
        const result = await input.validator.safeParseAsync(input.value);
        return result.success ? undefined : result.error;
      }),
    },
    guards: {
      isDirty,
      isPristine,
      isValid,
      isInvalid,
      isAllMode: ({ context }) => context.mode === "all",
      isOnBlurMode: ({ context }) => context.mode === "onBlur",
      isOnChangeMode: ({ context }) => context.mode === "onChange",
      isOnTouchedMode: ({ context }) => context.mode === "onTouched",
    },
  },
);
