import { useSelector } from "@xstate/react";
import { ActorRefFrom } from "xstate";
import { inputMachine } from "./input.machine";
import { ChangeEventHandler, useCallback } from "react";

type Props = {
  inputMachineRef: ActorRefFrom<typeof inputMachine>;
};

export const useInputMachine = ({ inputMachineRef }: Props) => {
  const state = useSelector(inputMachineRef, (state) => state.value);
  const context = useSelector(inputMachineRef, (state) => state.context);

  const errorMessage = useSelector(inputMachineRef, (state) => {
    const message = state.context.error?.issues
      .map((issue) => issue.message)
      .join("\n");

    return state.matches({
      validity: "invalid",
      validationState: "validated",
    })
      ? message
      : null;
  });

  const isDirty = useSelector(inputMachineRef, (state) =>
    state.matches({ dirtyState: "dirty" }),
  );
  const isDisabled = useSelector(inputMachineRef, (state) =>
    state.matches({ editableState: "disabled" }),
  );
  const isFocusing = useSelector(inputMachineRef, (state) =>
    state.matches({
      editableState: {
        enabled: {
          focusState: "focused",
        },
      },
    }),
  );
  const isTouched = useSelector(inputMachineRef, (state) =>
    state.matches({
      touchState: "touched",
    }),
  );
  const isValidating = useSelector(inputMachineRef, (state) =>
    state.matches({
      validationState: "validating",
    }),
  );
  const isValidated = useSelector(inputMachineRef, (state) =>
    state.matches({
      validationState: "validated",
    }),
  );

  const isValid = useSelector(inputMachineRef, (state) =>
    state.matches({
      validity: "valid",
    }),
  );

  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => inputMachineRef.send({ type: "CHANGE", value: e.target.value }),
    [inputMachineRef],
  );

  const onBlur = useCallback(
    () => inputMachineRef.send({ type: "BLUR" }),
    [inputMachineRef],
  );

  const onFocus = useCallback(
    () => inputMachineRef.send({ type: "FOCUS" }),
    [inputMachineRef],
  );

  const toggleEditableState = useCallback(() => {
    if (isDisabled) {
      inputMachineRef.send({ type: "ENABLE" });
    } else {
      inputMachineRef.send({ type: "DISABLE" });
    }
  }, [inputMachineRef, isDisabled]);

  return {
    state,
    context,
    selectors: {
      errorMessage,
      isDirty,
      isDisabled,
      isFocusing,
      isTouched,
      isValidating,
      isValidated,
      isValid,
    },
    handlers: {
      onChange,
      onBlur,
      onFocus,
    },
    toggleEditableState,
  };
};
