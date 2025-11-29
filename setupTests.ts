import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
// Jest matchers built into @testing-library/react-native v12.4+
import "@testing-library/react-native/build/matchers/extend-expect";
import "react-native-gesture-handler/jestSetup";

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

// Pass through in test-land, without persisting
jest.mock("redux-persist", () => {
  const real = jest.requireActual("redux-persist");
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers),
  };
});
