import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import formatISO from "date-fns/formatISO";
import { RootState } from "../../config/rtk/rootReducer";
import { generatePushID } from "../../utils/generatePushID";
import { Habit, Item, Meta } from "./types";

type Habits = { [key: string]: Habit };

interface HabitsState {
  habits: Habits;
  order: Array<string>;
}

const now = formatISO(new Date());

const initialState: HabitsState = {
  habits: {},
  order: [],
};

const habitsSlice = createSlice({
  name: "habitsState",
  initialState,
  reducers: {
    updateHabits(state, action: PayloadAction<Habits>) {
      state.habits = action.payload;
    },
    updateOrCreateItem(state, action: PayloadAction<{ habitId: string; item: Item }>) {
      const { habitId, item } = action.payload;

      const habit = state.habits[habitId];
      console.log("habit", state.habits);
      const itemIndex = habit.items.findIndex(i => i.id === item.id);
      const recordedItemExists = itemIndex >= 0;

      if (recordedItemExists) {
        habit.items[itemIndex].notes = item.notes;
        habit.items[itemIndex].status = item.status;
        habit.items[itemIndex].meta.lastUpdatedOn = now;
      } else {
        habit.items.push(item);
      }

      (habit.meta as Meta).lastUpdatedOn = now;
    },
    createNewHabit(state, action: PayloadAction<{ title: string; goal: number }>) {
      const { title, goal } = action.payload;
      const id = generatePushID();

      state.habits[id] = {
        id,
        title,
        goal,
        items: [],
        meta: {
          isDeleted: false,
          lastUpdatedOn: now,
          createdOn: now,
        },
      };
      state.order.push(id);
    },
    // reorderHabit(state, action: PayloadAction<{ habitId: string; newOrder: number }>) {
    //   const { habitId, newOrder } = action.payload;
    //   const habit = state.habits[habitId];

    //   const oldOrder = habit.order;
    //   habit.order = newOrder;
    //   (habit.meta as Meta).lastUpdatedOn = now;

    //   // Shift all remaining order of habits
    //   for (let habit of Object.values(filterDeleted(state.habits))) {
    //     const needsReordering = habit.order > oldOrder;
    //     if (needsReordering) {
    //       habit.order = habit.order + 1;
    //     }
    //     habit.meta.lastUpdatedOn = now;
    //   }
    // },
    updateHabitOrder(state, action: PayloadAction<{ newOrder: Array<string> }>) {
      const { newOrder } = action.payload;
      state.order = newOrder;
    },
    updateHabit(state, action: PayloadAction<{ habitId: string; title: string; goal: number }>) {
      const { habitId, title, goal } = action.payload;

      const habit = state.habits[habitId];

      habit.goal = goal;
      habit.title = title;
      (habit.meta as Meta).lastUpdatedOn = now;
    },
    removeHabit(state, action: PayloadAction<{ habitId: string }>) {
      const { habitId } = action.payload;

      const habit = state.habits[habitId];
      (habit.meta as Meta).isDeleted = true;
      (habit.meta as Meta).lastUpdatedOn = now;

      state.order = state.order.filter(id => id !== habit.id);
    },
  },
});

const filterDeleted = (habits: Habits): Habits =>
  Object.keys(habits)
    .filter(key => !habits[key].meta?.isDeleted)
    .reduce((obj, key) => {
      return {
        ...obj,
        [key]: habits[key],
      };
    }, {});

export const habitsSelector = (state: RootState) => {
  const habits = filterDeleted(state.habitsState.habits);
  const sortedHabits = state.habitsState.order.map(key => habits[key]);
  return sortedHabits;
};

export const { updateHabits } = habitsSlice.actions;
export const { updateOrCreateItem } = habitsSlice.actions;
export const { createNewHabit } = habitsSlice.actions;
export const { updateHabit } = habitsSlice.actions;
export const { removeHabit } = habitsSlice.actions;
export const { updateHabitOrder } = habitsSlice.actions;

export default habitsSlice.reducer;
