import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import formatISO from "date-fns/formatISO";
import { RootState } from "../../config/rtk/rootReducer";
import { generatePushID } from "../../utils/generatePushID";
import { Habit, HabitOrder, Habits, Item, Meta } from "./types";

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
    updateHabit(
      state,
      action: PayloadAction<{ id: string; title: string; goal: number; noteTemplate?: string }>,
    ) {
      const { id, title, goal, noteTemplate } = action.payload;

      const habit = state.habits[id];

      habit.goal = goal;
      habit.title = title;
      habit.noteTemplate = noteTemplate;
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
    /**
     * Sets a habit entirely - used by sync to update a habit with merged items.
     * Unlike updateHabit, this replaces the entire habit object.
     */
    setHabit(state, action: PayloadAction<{ habit: Habit }>) {
      const { habit } = action.payload;
      state.habits[habit.id] = habit;
      // Ensure habit is in order array (in case it was synced from remote)
      if (!state.order.order.includes(habit.id)) {
        state.order.order.push(habit.id);
        state.order.meta.lastUpdatedOn = now();
      }
    },
    /**
     * Clears all habits state - used on logout to prevent data leakage between accounts.
     */
    clearHabitsState(state) {
      state.habits = {};
      state.order = { order: [], meta: { isDeleted: false, createdOn: "", lastUpdatedOn: "" } };
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

// Cache structure for incremental updates
interface IndexCache {
  items: Item[]; // Reference to detect changes
  index: ItemsByDateIndex; // The actual index
  length: number; // Track length for add detection
}

const itemsIndexCache = new Map<string, IndexCache>();

/**
 * Returns an indexed map of items by date for O(1) lookups.
 *
 * INCREMENTAL UPDATE OPTIMIZATION:
 * Instead of rebuilding the entire index on every change, we detect the type
 * of change and update incrementally when possible:
 *
 * - Same reference → return cached (O(1), no work)
 * - Length increased → new item added, just add to index (O(1) for single add)
 * - Length same → existing item updated, update single entry (O(1))
 * - Length decreased → item deleted, rebuild (rare case)
 *
 * This is critical for the common case: tapping an empty day to create a new item.
 */
export const selectItemsIndexByHabitId = (state: RootState, habitId: string): ItemsByDateIndex => {
  const items = selectHabitItems(state, habitId);
  if (!items) return {};

  const cached = itemsIndexCache.get(habitId);

  // Fast path: same reference, nothing changed
  if (cached && cached.items === items) {
    return cached.index;
  }

  // Check if we can do incremental update
  if (cached) {
    const lengthDiff = items.length - cached.length;

    // Case 1: New item(s) added (most common - tapping empty day)
    // Items are always pushed, so new items are at the end
    if (lengthDiff > 0) {
      const index = { ...cached.index };
      // Only process the new items - O(k) where k = new items (usually 1)
      for (let i = cached.length; i < items.length; i++) {
        const item = items[i];
        if (!item.meta?.isDeleted) {
          const dateKey = item.date.slice(0, 10);
          index[dateKey] = item;
        }
      }
      itemsIndexCache.set(habitId, { items, index, length: items.length });
      return index;
    }

    // Case 2: Same length - an existing item was updated (tap to change status)
    // The item object has new reference due to Immer, but we can find it by
    // checking which dateKey has a different item reference
    if (lengthDiff === 0) {
      const index = { ...cached.index };
      // Find and update only the changed item - typically just one
      for (const item of items) {
        if (!item.meta?.isDeleted) {
          const dateKey = item.date.slice(0, 10);
          // Only update if item reference changed
          if (index[dateKey] !== item) {
            index[dateKey] = item;
          }
        }
      }
      itemsIndexCache.set(habitId, { items, index, length: items.length });
      return index;
    }
  }

  // Full rebuild needed (first load, or items were deleted)
  const index: ItemsByDateIndex = {};
  for (const item of items) {
    if (!item.meta?.isDeleted) {
      const dateKey = item.date.slice(0, 10);
      index[dateKey] = item;
    }
  }

  itemsIndexCache.set(habitId, { items, index, length: items.length });
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
export const { setHabit } = habitsSlice.actions;
export const { clearHabitsState } = habitsSlice.actions;

export default habitsSlice.reducer;
