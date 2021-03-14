import { render as rtlRender } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import FirebaseContext from "../config/remote/firebaseContext";
import { createSync } from "../config/remote/sync";
import SyncContext from "../config/remote/syncContext";
import { getStore } from "../config/rtk/store";
import { auth, db } from "./firebaseMock";

export const defaults = {};

const render = (ui, { initialState = defaults, store = getStore(), ...renderOptions } = {}) => {
  const firebaseValues = { auth, db };

  const getFirebaseValuesMock = () => {
    return firebaseValues;
  };

  const sync = createSync(store, getFirebaseValuesMock);

  const Wrapper = ({ children }) => (
    <FirebaseContext.Provider value={getFirebaseValuesMock()}>
      <SyncContext.Provider value={{ ...sync }}>
        <Provider store={store}>{children}</Provider>
      </SyncContext.Provider>
    </FirebaseContext.Provider>
  );

  return { ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }), store, firebaseValues, sync };
};

export * from "@testing-library/react-native";
export { render };
