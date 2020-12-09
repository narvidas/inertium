import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import formatISO from "date-fns/formatISO";
import { RootState } from "../../config/rtk/rootReducer";
import { generatePushID } from "../../utils/generatePushID";
import { HabitOrder, Habits, Item, Meta } from "./types";

interface HabitsState {
  habits: Habits;
  order: HabitOrder;
}

const now = () => formatISO(new Date());

const initialState: HabitsState = {
  habits: {},
  order: { order: [] },
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
      const itemIndex = habit.items.findIndex(i => i.id === item.id);
      const recordedItemExists = itemIndex >= 0;

      if (recordedItemExists) {
        habit.items[itemIndex].notes = item.notes || "";
        habit.items[itemIndex].status = item.status;
        habit.items[itemIndex].meta.lastUpdatedOn = now();
      } else {
        habit.items.push(item);
      }

      habit.meta.lastUpdatedOn = now();
    },
    createNewHabit(state, action: PayloadAction<{ title: string; goal: number }>) {
      const { title, goal } = action.payload;
      const id = generatePushID();

      const meta = {
        isDeleted: false,
        lastUpdatedOn: now(),
        createdOn: now(),
      };

      state.habits[id] = {
        id,
        title,
        goal,
        items: [],
        meta,
      };
      state.order.order.push(id);
      state.order.meta = meta;
    },
    updateHabitOrder(state, action: PayloadAction<{ newOrder: Array<string> }>) {
      const { newOrder } = action.payload;
      state.order.order = newOrder;
      state.order.meta = { ...state.order.meta, lastUpdatedOn: now() };
    },
    updateHabit(state, action: PayloadAction<{ id: string; title: string; goal: number }>) {
      const { id, title, goal } = action.payload;

      const habit = state.habits[id];

      habit.goal = goal;
      habit.title = title;
      (habit.meta as Meta).lastUpdatedOn = now();
    },
    removeHabit(state, action: PayloadAction<{ habitId: string }>) {
      const { habitId } = action.payload;

      const habit = state.habits[habitId];
      (habit.meta as Meta).isDeleted = true;
      (habit.meta as Meta).lastUpdatedOn = now();

      state.order.order = state.order.order.filter(id => id !== habit.id);
      state.order.meta = { ...state.order.meta, lastUpdatedOn: now() };
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
  const sortedHabits = state.habitsState.order.order.map(key => habits[key]);
  return sortedHabits;
};

export const orderSelector = (state: RootState) => state.habitsState.order;
export const habitSelector = (habitId: string) => (state: RootState) => state.habitsState.habits[habitId];
export const itemSelector = (habitId: string, itemId: string) => (state: RootState) =>
  state.habitsState.habits[habitId].items.find(item => item.id === itemId);

export const { updateHabits } = habitsSlice.actions;
export const { updateOrCreateItem } = habitsSlice.actions;
export const { createNewHabit } = habitsSlice.actions;
export const { updateHabit } = habitsSlice.actions;
export const { removeHabit } = habitsSlice.actions;
export const { updateHabitOrder } = habitsSlice.actions;

export default habitsSlice.reducer;
