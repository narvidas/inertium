import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

export const getStore = () =>
  configureStore({
    reducer: rootReducer,
  });

/* istanbul ignore next */
/* eslint-disable */
if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.accept("./rootReducer", () => {
    const newRootReducer = require("./rootReducer").default;
    store.replaceReducer(newRootReducer);
  });
}
/*eslint-enable */

const store = getStore();
export type AppDispatch = typeof store.dispatch;

export default store;
