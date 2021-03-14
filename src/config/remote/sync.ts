import { EnhancedStore } from "@reduxjs/toolkit";
import { createNewHabit, updateHabit, updateHabitOrder } from "../../features/Habits/habits.slice";
import { Habit, HabitOrder, Habits } from "../../features/Habits/types";
import { areArraysEqual } from "../../utils/areArraysEqual";
import { getFirebaseValues } from "./firebase";

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
    const remoteHabit = (await habitDbRef.once("value")).val() as Habit;
    const localHabit = store.getState().habitsState?.habits && store.getState().habitsState?.habits[habitId];

    const updateLocal = () => store.dispatch(updateHabit({ ...remoteHabit }));
    const updateRemote = () => habitDbRef.set(localHabit);

    // const remoteHabitItemIds = remoteHabit.items.map(item => item.id);
    // const localHabitItemIds = localHabit.items.map(item => item.id);

    // const updateLocal = () => {
    //   // Covers cases where local is outdated but still has some items remote does not
    //   const allItems = [...localHabitItemIds, ...remoteHabitItemIds].map(id => /* get each item by id here*/)
    //   const remoteHabitWithAllItems = {...remoteHabit, items = allItems};
    //   store.dispatch(updateHabit({ ...remoteHabitWithAllItems }));
    // };
    // const updateRemote = async () => {
    //   // Covers cases where remote is outdated but still has some items local does not
    //   const allItems = [...remoteHabitItemIds, ...localHabitItemIds].map(id => /* get each item by id here*/)
    //   const localHabitWithAllItems = {...remoteHabit, items = allItems};
    //   await habitDbRef.set(localHabitWithAllItems);
    // };

    // Neither have records, function was called with irrelevant habitId
    const localHasNoRecord = !localHabit;
    const remoteHasNoRecord = !remoteHabit;
    const localHasRecord = !localHasNoRecord;
    const remoteHasRecord = !remoteHasNoRecord;

    if (remoteHasNoRecord && localHasNoRecord) return;
    if (localHasRecord && remoteHasNoRecord) return await updateRemote();
    if (localHasNoRecord && remoteHasRecord) return updateLocal();
    if (localHasRecord && remoteHasRecord) {
      // If both have records, reconcile based on last updated date (newer wins)
      const remoteIsNewer = remoteHabit.meta.lastUpdatedOn > localHabit.meta.lastUpdatedOn;
      remoteIsNewer ? updateLocal() : await updateRemote();
    }
  };

  const syncHabits = async () => {
    const { auth, db } = getValues();
    if (isNotLoggedIn()) return;

    const uid = auth.currentUser.uid;

    const habitsDbRef = db.ref(`habits/${uid}`);
    const remoteHabits = (await habitsDbRef.once("value")).val() as Habits;
    const remoteHabitIds = Object.keys(remoteHabits);

    const localHabits = store.getState().habitsState.habits;
    const localHabitIds = Object.keys(localHabits);

    // Create new habits in local if remote has more
    const newHabitIdsForLocal = remoteHabitIds.filter(habitId => !localHabitIds.includes(habitId));
    for (const habitId in newHabitIdsForLocal) {
      const remoteHabit = remoteHabits[habitId];
      store.dispatch(createNewHabit({ ...remoteHabit }));
    }

    // Create new habits in remote if local has more
    const newHabitIdsForRemote = localHabitIds.filter(habitId => !remoteHabitIds.includes(habitId));
    for (const habitId in newHabitIdsForRemote) {
      const localHabit = localHabits[habitId];
      const habitDbRef = db.ref(`habits/${uid}/${habitId}`);
      habitDbRef.set(localHabit);
    }

    // Update the intersection of the two sets (habits that exists in both)
    const remainingHabitIds = [...remoteHabitIds, ...localHabitIds].filter(
      id => remoteHabitIds.includes(id) && localHabitIds.includes(id),
    );
    remainingHabitIds.map(habitId => syncHabit(habitId));
  };

  const sync: Sync = {
    syncAll,
    syncHabitOrder,
    syncHabit,
    syncHabits,
  };
  return sync;
};
