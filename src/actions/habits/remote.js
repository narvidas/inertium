import { NetInfo } from 'react-native';
import { loggedIn } from '../member';
import * as firebase from './firebase';

/*
 * Reads habits that belong to the user from remote
 */
export const readHabits = async () => {
  const user = loggedIn();
  const connected = await NetInfo.getConnectionInfo();
  const update = connected.type !== 'none';

  if (user && update) {
    const habits = await firebase.readUserHabits(user.uid);
    return habits;
  }
  return false;
};

/*
 * Reads habit order relating to habits that belong to user from remote
 */
export const readHabitOrder = async () => {
  const user = loggedIn();
  const connected = await NetInfo.getConnectionInfo();
  const update = connected.type !== 'none';

  if (user && update) {
    const order = await firebase.readUserHabitsOrder(user.uid);
    return order;
  }
  return false;
};

/*
 * Reads habit order relating to habits that belong to user from remote
 */
export const setHabits = async (habits) => {
  const user = loggedIn();
  if (user) await firebase.setUserHabit(user.uid, habits);
};

/*
 * Update any property of a given item in remote
 */
export const updateHabitItem = async (item) => {
  const user = loggedIn();
  if (user) await firebase.updateUserHabitItem(user.uid, item);
};

/**
 * Saves information for a given habit in a Firebase real-time database
 */
export const saveHabit = async (habit) => {
  const user = loggedIn();
  if (user) await firebase.updateUserHabitDetails(user.uid, habit);
};

/**
 * Creates a new habit in the Firebase real-time database
 */
export const createHabit = async (habit, order) => {
  const user = loggedIn();

  if (user) {
    await firebase.setUserHabit(user.uid, habit);
    await firebase.setUserHabitOrder(user.uid, order);
  }
};

/**
 * Removes habits from the Firebase real-time database
 */
export const removeHabit = async (habit) => {
  const user = loggedIn();

  if (user) {
    await firebase.removeUserHabit(user.uid, habit);
    await firebase.removeUserHabitOrder(user.uid, habit);
  }
};

/**
 * Clear habit item. On Firebase real-time database we go one step further
 * and remove the record completely
 */
export const clearHabitItem = (item) => {
  const user = loggedIn();

  if (user) firebase.removeUserHabitItem(user.uid, item);
};

/**
 * Reorder habit items on Firebase
 */
export const updateHabitOrder = async (newOrder) => {
  const user = loggedIn();

  if (user) await firebase.setUserHabitOrder(user.uid, newOrder);
};
