import { combineReducers } from "@reduxjs/toolkit";
import { HabitsStateReducer } from "../../features/ScrollableHabits";
import settingsReducer from "./settings.slice";

const rootReducer = combineReducers({
  habitsState: HabitsStateReducer,
  settings: settingsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
