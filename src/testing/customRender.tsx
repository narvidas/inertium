import { NavigationContainer } from "@react-navigation/native";
import { render as rtlRender } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import FirebaseContext from "../config/remote/firebaseContext";
import SyncContext from "../config/remote/syncContext";
import { getStore } from "../config/rtk/store";
import firebaseMock from "./firebaseMock";
import { getSyncMock } from "./syncMock";

export const defaults = {};

const render = (ui, { initialState = defaults, store = getStore(), ...renderOptions } = {}) => {
  const firebaseValues = {
    auth: firebaseMock.auth(),
    db: firebaseMock.database(),
    updateStoredCurrentUser: jest.fn(),
  };

  const getFirebaseValuesMock = () => {
    return firebaseValues;
  };

  const sync = getSyncMock();

  // const sync = createSync(store, getFirebaseValuesMock);

  const Wrapper = ({ children }) => (
    <NavigationContainer>
      <FirebaseContext.Provider value={getFirebaseValuesMock()}>
        <SyncContext.Provider value={sync}>
          <Provider store={store}>{children}</Provider>
        </SyncContext.Provider>
      </FirebaseContext.Provider>
    </NavigationContainer>
  );

  return { ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }), store, firebaseValues, sync };
};

export * from "@testing-library/react-native";
export { render };
