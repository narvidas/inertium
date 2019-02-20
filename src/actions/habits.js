import moment from 'moment';
import { generatePushID } from '../lib/helpers';
import * as local from './habits/local';
import * as remote from './habits/remote';

/**
 * Set an Error Message
 */
export function setError(message) {
  return (dispatch) =>
    new Promise((resolve) =>
      resolve(
        dispatch({
          type: 'HABITS_ERROR',
          data: message,
        })
      )
    );
}

/*
 * For a given day finds matching week and formats weekly habit view
 */
export const formatWeek = (today) => async (dispatch, getState) => {
  const state = getState();
  local.getWeek(dispatch, today, state);
};

/*
 * Fetch habits from remote
 */
export const getHabits = () => async (dispatch) => {
  const habits = await remote.readHabits();
  if (habits) local.replaceHabits(dispatch, habits);
};

export const getHabitOrder = () => async (dispatch) => {
  const order = await remote.readHabitOrder();
  if (order) local.replaceOrder(dispatch, order);
};

/*
 * Push local state to remote
 */
export const syncLocalToRemote = async (dispatch, getState) => {
  const state = getState();
  const currentHabits = Object.keys(state.habits.local);
  const today = moment();

  // if habitsraw is empty object that means that we logged out previously and cleared it
  // we do not want to update an empty object to remote, only focus on useful data (not empty)
  // if no data exists we pull from remote
  const habitsExist = currentHabits.length > 0;
  if (habitsExist) {
    // Local pushes to remote
    await remote.setHabits(currentHabits);
  } else {
    // Local pulls from remote
    const newHabits = await remote.readHabits();
    if (newHabits) local.replaceHabits(dispatch, newHabits);

    const newHabitsOrder = await remote.readHabitOrder();
    if (newHabitsOrder) local.replaceOrder(dispatch, newHabitsOrder);

    formatWeek(today);
  }
};

/**
 * Toggle habit item status (pass/fail/skip)
 */
export const toggleHabitItemStatus = (itemKey, habitKey, currStatus, startDate, index) => async (dispatch) => {
  let newStatus = '';

  // Decide next status based on current status of the item
  if (currStatus === 'done') {
    newStatus = 'undone';
  } else if (currStatus === 'undone') {
    newStatus = 'none';
  } else {
    newStatus = 'done';
  }

  // When rendering in a list in RN we can get the index which directly maps to day of the week
  const newDate = startDate
    .clone()
    .add(index, 'days')
    .format();
  const newItem = {
    habitKey,
    key: itemKey,
    status: newStatus,
    date: newDate,
  };

  await local.updateHabitItem(dispatch, newItem);
  await remote.updateHabitItem(newItem);
};

/**
 * Save any notes added to an item
 */
export const saveHabitItemNotes = (itemKey, habitKey, newNotes, startingDate, index) => async (dispatch) => {
  const newDate = startingDate
    .clone()
    .add(index, 'days')
    .format();
  const newItem = {
    habitKey,
    key: itemKey,
    date: newDate,
    notes: newNotes,
  };

  await local.updateHabitItem(dispatch, newItem);
  await remote.updateHabitItem(newItem);
};

/**
 * Saves information for a given habit
 */
export const saveHabit = (habitKey, newTitle, newGoal) => async (dispatch) => {
  const newHabit = {
    key: habitKey,
    title: newTitle,
    goal: newGoal,
  };

  await local.saveHabit(dispatch, newHabit);
  await remote.saveHabit(newHabit);
};

/**
 * Creates a new habit
 */
export const createHabit = (today, habitKey) => async (dispatch, getState) => {
  const monday = today.clone().startOf('isoWeek');

  const firebaseItems = {};
  for (let i = 0; i < 7; i += 1) {
    const itemID = generatePushID();
    firebaseItems[itemID] = {
      date: monday
        .clone()
        .add(i, 'days')
        .format(),
      key: itemID,
      habitKey,
    };
  }

  const newHabit = {
    key: habitKey,
    title: '',
    items: firebaseItems,
  };

  // insert new habit into start
  const { habits } = getState();
  const newOrder = [...habits.order];
  newOrder.splice(0, 0, habitKey);

  await local.createHabit(dispatch, newHabit);
  await remote.createHabit(newHabit, newOrder);
};

/**
 * Remove habit
 */
export const removeHabit = (habitKey) => async (dispatch) => {
  await local.removeHabit(dispatch, habitKey);
  await remote.removeHabit(habitKey);
};

/**
 * Clear habit item.
 * From user's point of view this removes all data for that item (status, notes etc.)
 * In local redux store we replace that day's item with a empty one
 * On Firebase real-time database we go one step further and remove the record completely
 */
export const clearHabitItem = (itemKey, habitKey) => async (dispatch) => {
  const itemToRemove = {
    habitKey,
    key: itemKey,
    status: null,
    notes: '',
  };

  await local.clearHabitItem(dispatch, itemToRemove);
  await remote.clearHabitItem(itemToRemove);
};

/**
 * Reorder habits
 */
export const reorderHabits = (prevOrder, fromId, toId) => async (dispatch) => {
  const newOrder = prevOrder.slice();
  newOrder.splice(toId, 0, newOrder.splice(fromId, 1)[0]);

  await local.updateHabitOrder(dispatch, newOrder);
  await remote.updateHabitOrder(newOrder);
};
