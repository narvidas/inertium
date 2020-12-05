import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import addDays from "date-fns/addDays";
import formatISO from "date-fns/formatISO";
import { RootState } from "../../config/rtk/rootReducer";
import { Habit, Item } from "./types";

interface HabitsState {
  habits: Habit[];
}

const today = formatISO(new Date());
const tomorrow = formatISO(addDays(new Date(), 1));
const initialState: HabitsState = {
  habits: [
    {
      key: "habit1",
      title: "Some Habit",
      goal: 3,
      items: [],
    },
  ],
};
const initialState2: HabitsState = {
  habits: [
    {
      key: "habit1",
      title: "Some Habit",
      goal: 3,
      items: [
        {
          key: "item1",
          status: "done",
          date: today,
        },
      ],
    },
    {
      key: "habit2",
      title: "Another Habit",
      goal: 5,
      items: [
        {
          key: "item1",
          status: "done",
          date: today,
        },
        {
          key: "item2",
          status: "fail",
          date: tomorrow,
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
    updateItemStatus(state, action: PayloadAction<{ habitId: string; item: Item }>) {
      const { habitId, item } = action.payload;

      const habitIndex = state.habits.findIndex(h => h.id === habitId);
      const habit = state.habits[habitIndex];
      const itemIndex = habit.items.findIndex(i => i.id === item.id);
      const recordedItemExists = itemIndex >= 0;

      if (recordedItemExists) {
        state.habits[habitIndex].items[itemIndex].status = item.status;
      } else {
        state.habits[habitIndex].items.push(item);
      }
    },
  },
});

export const habitsSelector = (state: RootState) => state.habitsState.habits;

export const { updateHabits } = habitsSlice.actions;
export const { updateItemStatus } = habitsSlice.actions;

export default habitsSlice.reducer;
