import { getFirebaseValues } from "../../config/firebase";
import { store } from "../../config/rtk/store";
import { areArraysEqual } from "../../utils/areArraysEqual";
import { createNewHabit, updateHabit, updateHabitOrder } from "./habits.slice";
import { Habit, HabitOrder, Habits } from "./types";

const syncAll = async () => {
  await syncHabitOrder();
  await syncHabits();
};

const isNotLoggedIn = () => {
  const { auth } = getFirebaseValues();
  return !(auth && auth.currentUser);
};

const syncHabitOrder = async () => {
  const { auth, db } = getFirebaseValues();
  if (isNotLoggedIn()) return;

  const uid = auth.currentUser.uid;
  const habitOrderDbRef = db.ref(`metadata/${uid}/habitOrder`);
  const remoteHabitOrder = (await habitOrderDbRef.once("value")).val() as HabitOrder;
  const localHabitOrder = store.getState().habitsState.order;

  const remoteHasRecord = !!remoteHabitOrder;
  const remoteIsNewer = remoteHasRecord && remoteHabitOrder.meta.lastUpdatedOn > localHabitOrder.meta.lastUpdatedOn;

  const updateLocal = () => store.dispatch(updateHabitOrder({ newOrder: remoteHabitOrder.order }));
  const updateRemote = async () => await habitOrderDbRef.set(localHabitOrder);

  // Prevent redundant updating the the order hasn't changed
  const needsUpdating = !areArraysEqual(remoteHabitOrder.order, localHabitOrder.order);
  if (needsUpdating) remoteIsNewer ? updateLocal() : await updateRemote();
};

const syncHabit = async (habitId: string) => {
  const { auth, db } = getFirebaseValues();
  if (isNotLoggedIn()) return;

  const uid = auth.currentUser.uid;
  const habitDbRef = db.ref(`habits/${uid}/${habitId}`);
  const remoteHabit = (await habitDbRef.once("value")).val() as Habit;
  const localHabit = store.getState().habitsState.habits[habitId];

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
  if (localHasNoRecord && remoteHasNoRecord) return;

  // If either has no records, update the counterpart
  if (localHasNoRecord) return updateLocal();
  if (remoteHasNoRecord) return await updateRemote();

  // If both have records, reconcile based on last updated date (newer wins)
  const remoteIsNewer = remoteHabit.meta.lastUpdatedOn > localHabit.meta.lastUpdatedOn;
  remoteIsNewer ? updateLocal() : await updateRemote();
};

const syncHabits = async () => {
  const { auth, db } = getFirebaseValues();
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

export const sync = {
  syncAll,
  syncHabitOrder,
  syncHabit,
  syncHabits,
};
