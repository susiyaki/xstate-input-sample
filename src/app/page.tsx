"use client";

import { XStateInput } from "./_components/input/XStateInput";
import { useInputMachine } from "./_components/input/useInputMachine";
import { Table } from "./_components/table/Table";
import { useMachine } from "@xstate/react";
import { fieldsMachine } from "./_machines/fields.machine";
import styles from "./page.module.css";
import { accordionMachine } from "./_machines/accorditon.machine";

const Home = () => {
  const [state] = useMachine(fieldsMachine);

  const emailInput = useInputMachine({
    inputMachineRef: state.context.emailInputRef,
  });

  const passwordInput = useInputMachine({
    inputMachineRef: state.context.passwordInputRef,
  });

  const nicknameInput = useInputMachine({
    inputMachineRef: state.context.nicknameInputRef,
  });

  const [stateState, stateSend] = useMachine(accordionMachine);
  const [contextState, contextSend] = useMachine(accordionMachine);
  const [variablesState, variablesSend] = useMachine(accordionMachine);

  return (
    <main className={styles.main}>
      <h1>XStateのinputマシンサンプル</h1>
      <form>
        <div>
          <label htmlFor="userName">email</label>
          <XStateInput
            id="userName"
            type="email"
            isDisabled={emailInput.selectors.isDisabled}
            value={emailInput.context.value}
            {...emailInput.handlers}
          />
          <button type="button" onClick={emailInput.toggleEditableState}>
            to {emailInput.selectors.isDisabled ? "enalbed" : "disabled"}
          </button>
        </div>
        <div>
          <label htmlFor="password">password</label>
          <XStateInput
            id="password"
            type="password"
            isDisabled={passwordInput.selectors.isDisabled}
            value={passwordInput.context.value}
            {...passwordInput.handlers}
          />
          <button type="button" onClick={passwordInput.toggleEditableState}>
            to {passwordInput.selectors.isDisabled ? "enalbed" : "disabled"}
          </button>
        </div>
        <div>
          <label htmlFor="nickname">nickname</label>
          <XStateInput
            id="nickname"
            type="text"
            isDisabled={nicknameInput.selectors.isDisabled}
            value={nicknameInput.context.value}
            {...nicknameInput.handlers}
          />
          <button type="button" onClick={nicknameInput.toggleEditableState}>
            to {nicknameInput.selectors.isDisabled ? "enalbed" : "disabled"}
          </button>
        </div>
        <button type="button" disabled={state.matches("invalid")}>
          state: {state.matches("invalid") ? "invalid" : "valid"}
        </button>
      </form>
      <section>
        <h2
          className={styles.sectionHeader}
          onClick={() =>
            stateState.matches("opened")
              ? stateSend({ type: "CLOSE" })
              : stateSend({ type: "OPEN" })
          }
        >
          State {stateState.matches("opened") ? "▼" : "▲"}
        </h2>
        {stateState.matches("opened") && (
          <div>
            <div>
              <h3>email</h3>
              <p>{JSON.stringify(emailInput.state, null, "\t")}</p>
            </div>
            <div>
              <h3>password</h3>
              <p>{JSON.stringify(passwordInput.state, null, "\t")}</p>
            </div>
            <div>
              <h3>nickname</h3>

              <p>{JSON.stringify(nicknameInput.state, null, "\t")}</p>
            </div>
          </div>
        )}
      </section>
      <section>
        <h2
          className={styles.sectionHeader}
          onClick={() =>
            contextState.matches("opened")
              ? contextSend({ type: "CLOSE" })
              : contextSend({ type: "OPEN" })
          }
        >
          Context {contextState.matches("opened") ? "▼" : "▲"}
        </h2>
        {contextState.matches("opened") && (
          <div className={styles.sectionContent}>
            <div className={styles.tableWrapper}>
              <h3>email</h3>
              <Table
                headers={["プロパティ", "値"]}
                rows={[
                  ["mode", emailInput.context.mode],
                  ["initialValue", emailInput.context.initialValue],
                  ["value", emailInput.context.value],
                  ["error", emailInput.context.error],
                  ["required", emailInput.context.required],
                ]}
              />
            </div>
            <div className={styles.tableWrapper}>
              <h3>password</h3>
              <Table
                headers={["プロパティ", "値"]}
                rows={[
                  ["mode", passwordInput.context.mode],
                  ["initialValue", passwordInput.context.initialValue],
                  ["value", passwordInput.context.value],
                  ["error", passwordInput.context.error],
                  ["required", passwordInput.context.required],
                ]}
              />
            </div>
            <div className={styles.tableWrapper}>
              <h3>nickname</h3>
              <Table
                headers={["プロパティ", "値"]}
                rows={[
                  ["mode", nicknameInput.context.mode],
                  ["initialValue", nicknameInput.context.initialValue],
                  ["value", nicknameInput.context.value],
                  ["error", nicknameInput.context.error],
                  ["required", nicknameInput.context.required],
                ]}
              />
            </div>
          </div>
        )}
      </section>
      <section>
        <h2
          className={styles.sectionHeader}
          onClick={() =>
            variablesState.matches("opened")
              ? variablesSend({ type: "CLOSE" })
              : variablesSend({ type: "OPEN" })
          }
        >
          Variables {variablesState.matches("opened") ? "▼" : "▲"}
        </h2>
        {variablesState.matches("opened") && (
          <div className={styles.sectionContent}>
            <div className={styles.tableWrapper}>
              <h3>email</h3>
              <Table
                headers={["変数名", "値"]}
                rows={[
                  ["errorMessage", emailInput.selectors.errorMessage],
                  ["isDirty", emailInput.selectors.isDirty],
                  ["isDisabled", emailInput.selectors.isDisabled],
                  ["isFocusing", emailInput.selectors.isFocusing],
                  ["isTouched", emailInput.selectors.isTouched],
                  ["isValidating", emailInput.selectors.isValidating],
                  ["isValidated", emailInput.selectors.isValidated],
                  ["isValid", emailInput.selectors.isValid],
                ]}
              />
            </div>
            <div className={styles.tableWrapper}>
              <h3>password</h3>
              <Table
                headers={["変数名", "値"]}
                rows={[
                  ["errorMessage", passwordInput.selectors.errorMessage],
                  ["isDirty", passwordInput.selectors.isDirty],
                  ["isDisabled", passwordInput.selectors.isDisabled],
                  ["isFocusing", passwordInput.selectors.isFocusing],
                  ["isTouched", passwordInput.selectors.isTouched],
                  ["isValidating", passwordInput.selectors.isValidating],
                  ["isValidated", passwordInput.selectors.isValidated],
                  ["isValid", passwordInput.selectors.isValid],
                ]}
              />
            </div>
            <div className={styles.tableWrapper}>
              <h3>nickname</h3>
              <Table
                headers={["変数名", "値"]}
                rows={[
                  ["errorMessage", nicknameInput.selectors.errorMessage],
                  ["isDirty", nicknameInput.selectors.isDirty],
                  ["isDisabled", nicknameInput.selectors.isDisabled],
                  ["isFocusing", nicknameInput.selectors.isFocusing],
                  ["isTouched", nicknameInput.selectors.isTouched],
                  ["isValidating", nicknameInput.selectors.isValidating],
                  ["isValidated", nicknameInput.selectors.isValidated],
                  ["isValid", nicknameInput.selectors.isValid],
                ]}
              />
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;
