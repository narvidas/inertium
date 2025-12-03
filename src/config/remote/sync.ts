import { EnhancedStore } from "@reduxjs/toolkit";
import { setHabit, updateHabitOrder } from "../../features/ScrollableHabits/habits.slice";
import { Habit, HabitOrder, Habits, Item } from "../../features/ScrollableHabits/types";
import { areArraysEqual } from "../../utils/areArraysEqual";
import { getFirebaseValues } from "./firebase";

/**
 * Merges items from local and remote habits at the item level.
 * For items that exist in both (same date), the newer one wins.
 * Items that only exist in one source are preserved.
 *
 * This prevents data loss when devices have different items for the same habit.
 */
const mergeHabitItems = (localItems: Item[], remoteItems: Item[]): Item[] => {
  // Create objects indexed by date (YYYY-MM-DD) for O(1) lookups
  const localByDate: { [dateKey: string]: Item } = {};
  const remoteByDate: { [dateKey: string]: Item } = {};

  for (const item of localItems) {
    const dateKey = item.date.slice(0, 10);
    localByDate[dateKey] = item;
  }

  for (const item of remoteItems) {
    const dateKey = item.date.slice(0, 10);
    remoteByDate[dateKey] = item;
  }

  // Collect all unique date keys
  const localDateKeys = Object.keys(localByDate);
  const remoteDateKeys = Object.keys(remoteByDate);
  const allDateKeysSet: { [key: string]: boolean } = {};
  localDateKeys.forEach((k) => (allDateKeysSet[k] = true));
  remoteDateKeys.forEach((k) => (allDateKeysSet[k] = true));
  const allDateKeys = Object.keys(allDateKeysSet);

  // Merge: for each date, pick the newer item (or the only one that exists)
  const mergedItems: Item[] = [];
  for (const dateKey of allDateKeys) {
    const localItem = localByDate[dateKey];
    const remoteItem = remoteByDate[dateKey];

    if (localItem && remoteItem) {
      // Both exist - newer wins
      const localIsNewer = localItem.meta.lastUpdatedOn > remoteItem.meta.lastUpdatedOn;
      mergedItems.push(localIsNewer ? localItem : remoteItem);
    } else if (localItem) {
      // Only local exists
      mergedItems.push(localItem);
    } else if (remoteItem) {
      // Only remote exists
      mergedItems.push(remoteItem);
    }
  }

  // Sort by date for consistent ordering
  mergedItems.sort((a, b) => a.date.localeCompare(b.date));

  return mergedItems;
};

export interface Sync {
  syncAll: () => Promise<void>;
  syncHabitOrder: () => Promise<void>;
  syncHabit: (habitId: string) => Promise<void>;
  syncHabits: () => Promise<void>;
}

export const createSync = (store: EnhancedStore<any>, getValues = getFirebaseValues) => {
  const syncAll = async () => {
    await syncHabitOrder();
    await syncHabits();
  };

  const isNotLoggedIn = () => {
    const { auth } = getValues();
    return !(auth && auth.currentUser);
  };

  const syncHabitOrder = async () => {
    const { auth, db } = getValues();
    if (isNotLoggedIn()) return;

    const uid = auth.currentUser.uid;
    const habitOrderDbRef = db.ref(`metadata/${uid}/habitOrder`);
    const remoteHabitOrder = (await habitOrderDbRef.once("value")).val() as HabitOrder;
    const localHabitOrder = store.getState().habitsState?.order;

    const remoteHasNoRecord = !remoteHabitOrder;
    const remoteHasRecord = !remoteHasNoRecord;

    const localHasNoRecord = !localHabitOrder;
    const localHasRecord = !localHasNoRecord;

    const updateLocal = () => store.dispatch(updateHabitOrder({ newOrder: remoteHabitOrder.order }));
    const updateRemote = async () => await habitOrderDbRef.set(localHabitOrder);

    if (remoteHasNoRecord && localHasNoRecord) return;
    if (localHasRecord && remoteHasNoRecord) return await updateRemote();
    if (localHasNoRecord && remoteHasRecord) return updateLocal();
    if (localHasRecord && remoteHasRecord) {
      const remoteIsNewer = remoteHasRecord && remoteHabitOrder.meta.lastUpdatedOn > localHabitOrder.meta.lastUpdatedOn;

      // Prevent redundant updating if the order hasn't changed
      const needsUpdating = !areArraysEqual(remoteHabitOrder?.order, localHabitOrder.order);
      if (needsUpdating) remoteIsNewer ? updateLocal() : await updateRemote();
    }
  };

  const syncHabit = async (habitId: string) => {
    const { auth, db } = getValues();
    if (isNotLoggedIn()) return;

    const uid = auth.currentUser.uid;
    const habitDbRef = db.ref(`habits/${uid}/${habitId}`);
    const remoteHabit = (await habitDbRef.once("value")).val() as Habit | null;
    const localHabit = store.getState().habitsState?.habits?.[habitId] as Habit | undefined;

    // Neither have records, function was called with irrelevant habitId
    const localHasNoRecord = !localHabit;
    const remoteHasNoRecord = !remoteHabit;
    const localHasRecord = !localHasNoRecord;
    const remoteHasRecord = !remoteHasNoRecord;

    // Case 1: Neither has records - nothing to do
    if (remoteHasNoRecord && localHasNoRecord) return;

    // Case 2: Only local has record - push to remote
    if (localHasRecord && remoteHasNoRecord) {
      await habitDbRef.set(localHabit);
      return;
    }

    // Case 3: Only remote has record - pull to local
    if (localHasNoRecord && remoteHasRecord) {
      store.dispatch(setHabit({ habit: remoteHabit }));
      return;
    }

    // Case 4: Both have records - merge items and use newer habit metadata
    if (localHasRecord && remoteHasRecord) {
      const localItems = localHabit.items || [];
      const remoteItems = remoteHabit.items || [];

      // Merge items at the item level (per-date, newer wins)
      const mergedItems = mergeHabitItems(localItems, remoteItems);

      // Determine which habit's metadata to use (title, goal, meta)
      const remoteMetaIsNewer = remoteHabit.meta.lastUpdatedOn > localHabit.meta.lastUpdatedOn;
      const baseHabit = remoteMetaIsNewer ? remoteHabit : localHabit;

      // Create merged habit with combined items
      const mergedHabit: Habit = {
        ...baseHabit,
        items: mergedItems,
        meta: {
          ...baseHabit.meta,
          lastUpdatedOn: new Date().toISOString(), // Update timestamp since we merged
        },
      };

      // Update both local and remote with merged data
      store.dispatch(setHabit({ habit: mergedHabit }));
      await habitDbRef.set(mergedHabit);
    }
  };

  const syncHabits = async () => {
    const { auth, db } = getValues();
    if (isNotLoggedIn()) return;

    const uid = auth.currentUser.uid;

    const habitsDbRef = db.ref(`habits/${uid}`);
    const remoteHabits = (await habitsDbRef.once("value")).val() as Habits | null;
    // Handle null case: new user with no remote data
    const remoteHabitIds = remoteHabits ? Object.keys(remoteHabits) : [];

    const localHabits = store.getState().habitsState.habits || {};
    const localHabitIds = Object.keys(localHabits);

    // Create new habits in local if remote has more
    // BUG FIX: Changed from `for...in` to `for...of` - was iterating indices instead of values
    const newHabitIdsForLocal = remoteHabitIds.filter((habitId) => !localHabitIds.includes(habitId));
    for (const habitId of newHabitIdsForLocal) {
      const remoteHabit = remoteHabits![habitId];
      store.dispatch(setHabit({ habit: remoteHabit }));
    }

    // Create new habits in remote if local has more
    // BUG FIX: Changed from `for...in` to `for...of`
    const newHabitIdsForRemote = localHabitIds.filter((habitId) => !remoteHabitIds.includes(habitId));
    for (const habitId of newHabitIdsForRemote) {
      const localHabit = localHabits[habitId];
      const habitDbRef = db.ref(`habits/${uid}/${habitId}`);
      await habitDbRef.set(localHabit);
    }

    // Update the intersection of the two sets (habits that exist in both)
    // These need item-level merging handled by syncHabit
    const commonHabitIds = remoteHabitIds.filter((id) => localHabitIds.includes(id));
    await Promise.all(commonHabitIds.map((habitId) => syncHabit(habitId)));
  };

  const sync: Sync = {
    syncAll,
    syncHabitOrder,
    syncHabit,
    syncHabits,
  };
  return sync;
};
