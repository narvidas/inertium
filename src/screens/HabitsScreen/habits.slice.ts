import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../config/rtk/rootReducer";
import { Habit } from "./types";

interface HabitsState {
  habits: Habit[];
}

const initialState: HabitsState = {
  habits: [
    {
      key: "habit1",
      title: "Some Habit",
      goal: 3,
      items: [
        {
          key: "item1",
          status: "done",
          date: new Date(),
        },
      ],
    },
  ],
};

const habitsSlice = createSlice({
  name: "habitsState",
  initialState,
  reducers: {
    updateHabits(state, action: PayloadAction<Habit[]>) {
      state.habits = action.payload;
    },
  },
});

export const habitsSelector = (state: RootState) => state.habitsState.habits;

export const { updateHabits } = habitsSlice.actions;

export default habitsSlice.reducer;
