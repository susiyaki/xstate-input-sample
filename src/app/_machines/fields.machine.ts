import { ActorLogicFrom, ActorRefFrom, createMachine } from "xstate";
import { inputMachine } from "../_components/input/input.machine";
import { z } from "zod";

type Types = {
  actors: {
    src: "inputMachine";
    logic: ActorLogicFrom<typeof inputMachine>;
  };

  context: {
    emailInputRef: ActorRefFrom<typeof inputMachine>;
    passwordInputRef: ActorRefFrom<typeof inputMachine>;
    nicknameInputRef: ActorRefFrom<typeof inputMachine>;
  };

  guards: { type: "isValid" } | { type: "isInvalid" };
};

const isValid = ({ context }: { context: Types["context"] }) => {
  return (
    context.emailInputRef.getSnapshot().matches({ validity: "valid" }) &&
    context.passwordInputRef.getSnapshot().matches({ validity: "valid" }) &&
    context.nicknameInputRef.getSnapshot().matches({ validity: "valid" })
  );
};
const isInvalid = ({ context }: { context: Types["context"] }) =>
  !isValid({ context });

const checkNicknameDuplicate = async (nickname: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (nickname === "テスト") {
        resolve(false);
      } else {
        resolve(true);
      }
    }, 1000);
  });
};

export const fieldsMachine = createMachine(
  {
    id: "fieldsMachine",
    types: {} as Types,
    context: ({ spawn }) => ({
      emailInputRef: spawn("inputMachine", {
        id: "email",
        input: {
          validator: z.string().email(),
          mode: "onBlur",
        },
        syncSnapshot: true,
      }),
      passwordInputRef: spawn("inputMachine", {
        id: "password",
        input: {
          validator: z.string().min(8).max(20),
          mode: "onChange",
        },
        syncSnapshot: true,
      }),
      nicknameInputRef: spawn("inputMachine", {
        id: "nickname",
        input: {
          initialValue: "テストユーザー",
          validator: z
            .string()
            .min(0)
            .max(20)
            .refine(
              checkNicknameDuplicate,
              "既に使用されているニックネームです",
            ),
          mode: "onTouched",
        },
        syncSnapshot: true,
      }),
    }),
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
  {
    actors: {
      inputMachine,
    },
    guards: {
      isValid,
      isInvalid,
    },
  },
);
