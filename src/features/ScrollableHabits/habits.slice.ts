import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
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
  order: { order: [], meta: { isDeleted: false, createdOn: "", lastUpdatedOn: "" } },
};

const habitsSlice = createSlice({
  name: "habitsState",
  initialState,
  reducers: {
    updateOrCreateItem(state, action: PayloadAction<{ habitId: string; item: Item }>) {
      const { habitId, item } = action.payload;

      const habit = state.habits[habitId];
      const itemIndex = habit.items.findIndex((i) => i.id === item.id);
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

      state.order.order = state.order.order.filter((id) => id !== habit.id);
      state.order.meta = { ...state.order.meta, lastUpdatedOn: now() };
    },
  },
});

// Base selectors for memoization
const selectHabitsMap = (state: RootState) => state.habitsState.habits;
const selectOrderArray = (state: RootState) => state.habitsState.order.order;

// Memoized selector - only recomputes when habits or order actually change
// This prevents DraggableFlatList from re-rendering all rows when unrelated state changes
export const habitsSelector = createSelector([selectHabitsMap, selectOrderArray], (habits, order) => {
  return order.filter((id) => habits[id] && !habits[id].meta?.isDeleted).map((id) => habits[id]);
});

export const orderSelector = (state: RootState) => state.habitsState.order;
export const habitSelector = (habitId: string) => (state: RootState) => state.habitsState.habits[habitId];

// ============================================
// Indexed Item Selectors for O(1) Date Lookups
// ============================================

// Type for the items-by-date index: { "2024-01-20": Item, ... }
export type ItemsByDateIndex = { [dateKey: string]: Item };

// Selector to get items array for a habit
const selectHabitItems = (state: RootState, habitId: string) => state.habitsState.habits[habitId]?.items;

// Creates a memoized selector for a specific habit that indexes items by date
// This transforms O(n) find() calls into O(1) object property access
// The index is only rebuilt when the habit's items array actually changes
const itemsIndexCache = new Map<string, { items: Item[]; index: ItemsByDateIndex }>();

export const selectItemsIndexByHabitId = (state: RootState, habitId: string): ItemsByDateIndex => {
  const items = selectHabitItems(state, habitId);
  if (!items) return {};

  // Check cache - if items array reference hasn't changed, return cached index
  const cached = itemsIndexCache.get(habitId);
  if (cached && cached.items === items) {
    return cached.index;
  }

  // Build new index - O(n) but only when items change
  const index: ItemsByDateIndex = {};
  for (const item of items) {
    if (!item.meta?.isDeleted) {
      // Extract YYYY-MM-DD from ISO date string for consistent key
      const dateKey = item.date.slice(0, 10);
      index[dateKey] = item;
    }
  }

  // Cache the result
  itemsIndexCache.set(habitId, { items, index });
  return index;
};

// Helper to get a specific item by date - O(1) lookup
export const selectItemByDate = (state: RootState, habitId: string, dateKey: string): Item | undefined => {
  const index = selectItemsIndexByHabitId(state, habitId);
  return index[dateKey];
};

export const { updateOrCreateItem } = habitsSlice.actions;
export const { createNewHabit } = habitsSlice.actions;
export const { updateHabit } = habitsSlice.actions;
export const { removeHabit } = habitsSlice.actions;
export const { updateHabitOrder } = habitsSlice.actions;

export default habitsSlice.reducer;
