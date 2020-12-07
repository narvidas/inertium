import { combineReducers } from "@reduxjs/toolkit";
import { HabitsStateReducer } from "../../features/Habits";

const rootReducer = combineReducers({
  habitsState: HabitsStateReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
