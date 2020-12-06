import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import addDays from "date-fns/addDays";
import formatISO from "date-fns/formatISO";
import { RootState } from "../../config/rtk/rootReducer";
import { Habit, Item, Meta } from "./types";

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

      (state.habits[habitIndex].meta as Meta).lastUpdatedOn = formatISO(new Date());
    },
    createNewHabit(state, action: PayloadAction<{ title: string; goal: number }>) {
      const { title, goal } = action.payload;

      state.habits.push({
        id: title,
        title,
        goal,
        items: [],
        meta: {
          isDeleted: false,
          lastUpdatedOn: formatISO(new Date()),
          createdOn: formatISO(new Date()),
        },
      });
    },
    updateHabit(state, action: PayloadAction<{ habitId: string; title: string; goal: number }>) {
      const { habitId, title, goal } = action.payload;

      const habitIndex = state.habits.findIndex(h => h.id === habitId);

      state.habits[habitIndex].goal = goal;
      state.habits[habitIndex].title = title;

      (state.habits[habitIndex].meta as Meta).lastUpdatedOn = formatISO(new Date());
    },
    removeHabit(state, action: PayloadAction<{ habitId: string }>) {
      const { habitId } = action.payload;

      const habitIndex = state.habits.findIndex(h => h.id === habitId);
      (state.habits[habitIndex].meta as Meta).isDeleted = true;

      (state.habits[habitIndex].meta as Meta).lastUpdatedOn = formatISO(new Date());
    },
  },
});

export const habitsSelector = (state: RootState) => state.habitsState.habits.filter(h => !h.meta?.isDeleted);

export const { updateHabits } = habitsSlice.actions;
export const { updateItemStatus } = habitsSlice.actions;
export const { createNewHabit } = habitsSlice.actions;
export const { updateHabit } = habitsSlice.actions;
export const { removeHabit } = habitsSlice.actions;

export default habitsSlice.reducer;
