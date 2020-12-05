import { combineReducers } from "@reduxjs/toolkit";
import { HabitsStateReducer } from "../../screens/HabitsScreen";

const rootReducer = combineReducers({
  habitsState: HabitsStateReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
