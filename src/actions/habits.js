import moment from 'moment';

import { Firebase, FirebaseRef } from '../lib/firebase';
import { generatePushID } from '../lib/helpers';
import { loggedIn } from './member';

/**
  * Set an Error Message
  */
export function setError(message) {
  return dispatch => new Promise(resolve => resolve(dispatch({
    type: 'HABITS_ERROR',
    data: message,
  })));
}

const replaceHabits = (dispatch, habitsraw) => dispatch({ type: 'HABITS_REPLACE', habitsraw });
const replaceOrder = (dispatch, order) => dispatch({ type: 'HABITS_ORDER_REPLACE', order });
const getWeek = (dispatch, today) => dispatch({ type: 'GET_WEEK', today });
const updateHabitItemLocal = (dispatch, item) => dispatch({ type: 'UPDATE_HABIT_ITEM', item });
const saveHabitLocal = (dispatch, habit) => dispatch({ type: 'HABIT_UPDATE', habit });
const createHabitLocal = (dispatch, habit) => dispatch({ type: 'HABIT_ADD', habit });
const removeHabitLocal = (dispatch, habit) => dispatch({ type: 'HABIT_REMOVE', habit });
const clearHabitItemLocal = (dispatch, item) => dispatch({ type: 'HABITS_ITEM_CLEAR', item });
const updateHabitOrderLocal = (dispatch, newOrder) => dispatch({ type: 'REORDER_HABITS', newOrder });

const readUserHabits = uid => FirebaseRef.child(`habits/${uid}`).once('value').then(snap => snap.val());
const readUserHabitsOrder = uid => FirebaseRef.child(`metadata/${uid}/habitOrder`).once('value').then(snap => snap.val());
const setUserHabits = (uid, habits) => FirebaseRef.child(`habits/${uid}`).set(habits);
const updateUserHabitItem = (uid, item) => FirebaseRef.child(`habits/${uid}/${item.habitKey}/items/${item.key}`).update(item);
const updateUserHabitDetails = (uid, habit) => FirebaseRef.child(`habits/${uid}/${habit.key}`).update(habit);
const setUserHabit = (uid, habit) => FirebaseRef.child(`habits/${uid}/${habit.key}`).set(habit);
const setUserHabitOrder = (uid, order) => FirebaseRef.child(`metadata/${uid}/habitOrder/`).set(order);
const removeUserHabit = (uid, habit) => FirebaseRef.child(`habits/${uid}/${habit.key}`).remove();
const removeUserHabitOrder = (uid, habit) => FirebaseRef.child(`metadata/${uid}/habitOrder/${habit.key}`).remove();
const removeUserHabitItem = (uid, item) => FirebaseRef.child(`habits/${uid}/${item.habitKey}/items/${item.key}`).remove();

/*
 * For a given day finds matching week and formats weekly habiv view
 */
export const formatWeek = today => async (dispatch) => {
  getWeek(dispatch, today);
};

/*
  * Fetch habits from remote
  */
export const getHabits = () => async (dispatch) => {
  const user = Firebase.auth().currentUser;

  if (loggedIn()) {
    const habits = await readUserHabits(user.uid);
    replaceHabits(dispatch, habits);

    const habitsOrder = await readUserHabitsOrder(user.uid);
    replaceOrder(dispatch, habitsOrder);
  }
};

/*
  * Push local state to remote
  */
export const syncLocalToRemote = async (dispatch, getState) => {
  const state = getState();
  const user = Firebase.auth().currentUser;
  // if habitsraw is empty object that means that we logged out previously and cleared it
  // we do not want to update an empty object to remote, only focus on useful data (not empty)
  // if no data exists we pull from remote
  const habitsExist = Object.keys(state.habits.habitsraw).length !== 0;
  if (loggedIn() && habitsExist) {
    await setUserHabits(user.uid, state.habits.habitsraw);
  } else {
    const habits = await readUserHabits(user.uid);
    replaceHabits(dispatch, habits);

    const habitsOrder = await readUserHabitsOrder(user.uid);
    replaceOrder(dispatch, habitsOrder);

    getWeek(dispatch, moment());
  }
};

/*
 * Update any property of a given item in remote
 */
const updateHabitItemRemote = async (item) => {
  const user = Firebase.auth().currentUser;
  if (loggedIn()) await updateUserHabitItem(user.uid, item);
};

/**
  * Toggle habit item status (pass/fail/skip)
  */
export const toggleHabitItemStatus = (itemKey, habitKey, currentStatus, startingDate, index) => async (dispatch) => {
  let newStatus = '';

  // Decide next status based on current status of the item
  if (currentStatus === 'done') {
    newStatus = 'undone';
  } else if (currentStatus === 'undone') {
    newStatus = 'none';
  } else {
    newStatus = 'done';
  }

  // When rendering in a list in RN we can get the index which directly maps to day of the week
  const newDate = startingDate.clone().add(index, 'days').format();
  const newItem = {
    habitKey,
    key: itemKey,
    status: newStatus,
    date: newDate,
  };

  await updateHabitItemLocal(dispatch, newItem);
  await updateHabitItemRemote(newItem);
};

/**
  * Save any notes added to an item
  */
export const saveHabitItemNotes = (itemKey, habitKey, newNotes, startingDate, index) => async (dispatch) => {
  const newDate = startingDate.clone().add(index, 'days').format();
  const newItem = {
    habitKey,
    key: itemKey,
    date: newDate,
    notes: newNotes,
  };

  await updateHabitItemLocal(dispatch, newItem);
  await updateHabitItemRemote(newItem);
};

/**
  * Saves information for a given habit in a Firebase real-time database
  */
const saveHabitRemote = async (habit) => {
  const user = Firebase.auth().currentUser;

  if (loggedIn()) await updateUserHabitDetails(user.uid, habit);
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

  await saveHabitLocal(dispatch, newHabit);
  await saveHabitRemote(newHabit);
};

/**
 * Creates a new habit in the Firebase real-time database
 */
const createHabitRemote = async (habit, order) => {
  const user = Firebase.auth().currentUser;

  if (loggedIn()) {
    await setUserHabit(user.uid, habit);
    await setUserHabitOrder(user.uid, order);
  }
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
      date: monday.clone().add(i, 'days').format(),
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
  let order = habits.habitOrder;
  order.splice(0, 0, habitKey);

  await createHabitLocal(dispatch, newHabit);
  await updateHabitOrderLocal(dispatch, order);
  await createHabitRemote(newHabit, order);
};

/**
  * Remove habits from the local Redux store
  */


/**
  * Remove habits from the Firebase real-time database
  */
const removeHabitRemote = async (habit) => {
  const user = Firebase.auth().currentUser;

  if (loggedIn()) {
    await removeUserHabit(user.uid, habit);
    await removeUserHabitOrder(user.uid, habit);
  }
};

/**
  * Remove habit
  */
export const removeHabit = key => async (dispatch) => {
  const habitToRemove = { key };

  await removeHabitLocal(dispatch, habitToRemove);
  await removeHabitRemote(habitToRemove);
};

/**
  * Clear habit item. On Firebase real-time database we go one step further
  * and remove the record completely
  */
const clearHabitItemRemote = (item) => {
  const user = Firebase.auth().currentUser;

  if (loggedIn()) {
    removeUserHabitItem(user.uid, item);
  }
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
  };

  await clearHabitItemLocal(dispatch, itemToRemove);
  await clearHabitItemRemote(itemToRemove);
};

/**
  * Reorder habit items on Firebase
  */
const updateHabitOrderRemote = async (newOrder) => {
  const user = Firebase.auth().currentUser;

  if (loggedIn()) {
    await setUserHabitOrder(user.uid, newOrder);
  }
};

/**
  * Reorder habits
  */
export const reorderHabits = (prevOrder, fromId, toId) => async (dispatch) => {
  // Decide on new order
  // Sort HERE
  const newOrder = prevOrder.slice();
  newOrder.splice(toId, 0, newOrder.splice(fromId, 1)[0]);

  await updateHabitOrderLocal(dispatch, newOrder);
  await updateHabitOrderRemote(newOrder);
};

