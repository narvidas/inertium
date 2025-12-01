import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import rootReducer from "./rootReducer";

const persistConfig = {
  key: "habitsState", // Keep original key to preserve existing user data
  storage: AsyncStorage,
  whitelist: ["habitsState", "settings"], // Explicitly persist both slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const getStore = () =>
  configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== "production",
    middleware: getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  });

export const store = getStore();
export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
