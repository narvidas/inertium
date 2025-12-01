import { combineReducers } from "@reduxjs/toolkit";
import { HabitsStateReducer } from "../../features/Habits";
import settingsReducer from "./settings.slice";

const rootReducer = combineReducers({
  habitsState: HabitsStateReducer,
  settings: settingsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
