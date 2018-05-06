import { Firebase, FirebaseRef } from '../lib/firebase';
import { snapshotToArray, objectToArray, generatePushID } from '../lib/helpers';
import moment from 'moment';

/**
  * Set an Error Message
  */
export function setError(message) {
  return dispatch => new Promise(resolve => resolve(dispatch({
    type: 'HABITS_ERROR',
    data: message,
  })));
}

/**
  * Request for store to normalise habits data
  * (converts objects in Firebase snapshot-like representation to arrays)
  */
const normaliseHabits = (dispatch) => {
  return new Promise(resolve =>{
    return resolve(dispatch({
        type: 'NORMALISE_HABITS'
      }));
  });
}

/**
  * Fetch habits from Firebase
  */
export function getHabits(today) {
  if (Firebase === null) return () => new Promise(resolve => resolve());

  return dispatch => new Promise(resolve => {
    Firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        FirebaseRef.child('habits/'+user.uid).once('value').then((snapshot) => {
          let habitsraw = snapshotToArray(snapshot) || {};
          dispatch({
            type: 'HABITS_RAW_REPLACE',
            habitsraw: habitsraw,
          });

          FirebaseRef.child('metadata/'+user.uid+'/habitOrder').once('value').then((snapshot) => {
            let order = (snapshot.val()) || {};
              dispatch({
                type: 'HABITS_ORDER_REPLACE',
                order: order,
              });
          })

          const today = moment();
          const monday = today.clone().startOf('isoWeek');
          const sunday = monday.clone().add(7, 'days');
          resolve(dispatch({
            type: 'GET_WEEK',
            dayFrom: monday,
            dayTo: sunday,
          }));
        })
      }
    })
  }).catch(e => console.log(e));
}

/**
  * Request store to update week for rendering for a given day (moment object)
  */
export function getWeek(today) {
  const monday = today.clone().startOf('isoWeek');
  const sunday = monday.clone().add(7, 'days');
  console.log(sunday.format())
  return dispatch => new Promise(resolve => {
      resolve(dispatch({
        type: 'GET_WEEK',
        dayFrom: monday,
        dayTo: sunday,
      }));
    }).catch(e => console.log(e));
  }

/**
  * Toggle habit item status (pass/fail/skip)
  */
export function toggleHabitItemStatus(itemKey, habitKey, currentStatus, startingDate, index) {
  let newStatus = '';

  // Decide next status based on current status of the item
  if(currentStatus === 'done'){
    newStatus = 'undone'
  } else if (currentStatus === 'undone'){
    newStatus = 'none'
  } else {
    newStatus = 'done'
  }

  // When rendering in a list in RN we can get the index which directly maps to day of the week
  const newDate = startingDate.clone().add(index, 'days').format();

  const newItem = {
    habitKey: habitKey,
    key: itemKey,
    status: newStatus,
    date: newDate
  }

  return dispatch => new Promise(resolve => {
    updateHabitItemLocal(dispatch, newItem)
    .then(()=>normaliseHabits(dispatch))
    .then(()=>updateHabitItemRemote(newItem))
    .then(()=>{return resolve()});
  })
}


/**
 * Update any property of a given item on the local Redux store
 * (determined by which habit it belonds to (habit key) and it's index (item key))
 */
const updateHabitItemLocal = (dispatch, item) => {
  return new Promise(resolve =>{
    return resolve(dispatch({
        type: 'UPDATE_HABIT_ITEM',
        item,
      }));
  });
}

/**
 * Update any property of a given item in Firebase real-time database
 * (determined by which habit it belonds to (habit key) and it's index (item key))
 */
const updateHabitItemRemote = (item) => {
  if (Firebase === null || Firebase.auth().currentUser === null) return () => new Promise(resolve => resolve());

  const UID = Firebase.auth().currentUser.uid;
  const habitItemRef =
    FirebaseRef.child('habits/'+UID+'/'+item.habitKey+'/items/'+item.key);

  return new Promise(resolve =>{
      habitItemRef.update(item)
      .then(()=>{return resolve()})
      .catch(e => console.log(e))
  })
}

/**
  * Save any notes added to an item
  */
export function saveHabitItemNotes(itemKey, habitKey, newNotes, startingDate, index) {
  const newDate = startingDate.clone().add(index, 'days').format();

  const newItem = {
    habitKey: habitKey,
    key: itemKey,
    date: newDate,
    notes: newNotes,
  }

  return dispatch => new Promise(resolve => {
    updateHabitItemLocal(dispatch, newItem)
    .then(()=>updateHabitItemRemote(newItem))
    // For now if there's no data connection, pass-through.
    // Better strategy may be needed in the future, catch and alert perhaps?
    .then(()=>getHabits(startingDate))
    .then(()=>{return resolve()});
  })
}

/**
  * Saves information for a given habit
  */
export function saveHabit(habitKey, newTitle, newGoal) {

  const newHabit = {
    key: habitKey,
    title: newTitle,
    goal: newGoal
  }

  return dispatch => new Promise(resolve => {
    saveHabitLocal(dispatch, newHabit)
    .then(()=>normaliseHabits(dispatch))
    .then(()=>saveHabitRemote(newHabit))
    .then(()=>{return resolve()});
  })
}

/**
  * Saves information for a given habit in a local Redux store
  */
const saveHabitLocal = (dispatch, habit) => {
  return new Promise(resolve =>{
    return resolve(dispatch({
        type: 'HABIT_UPDATE',
        habit
      }));
  });
}

/**
  * Saves information for a given habit in a Firebase real-time database
  */
const saveHabitRemote = (habit) => {
  if (Firebase === null || Firebase.auth().currentUser === null) return () => new Promise(resolve => resolve());
  const UID = Firebase.auth().currentUser.uid;

  return new Promise(resolve =>{
    const habitItemsRef = FirebaseRef.child('habits/'+UID+'/'+habit.key);
    habitItemsRef.update(habit)
    .then(()=>{return resolve()});
  })
}

/**
  * Creates a new habit
  */
export function createHabit(today, habitKey) {

  const monday = today.clone().startOf('isoWeek');

  let firebaseItems = {};
  for (let i=0; i<7; i++){
    let itemID = generatePushID();
    firebaseItems[itemID] = {
      date: monday.clone().add(i, 'days').format(),
      key: itemID,
      habitKey: habitKey,
    }
  }

  const newFirebaseHabit = {
    key: habitKey,
    title: '',
    items: firebaseItems
  }

  const newReduxHabit = {
    key: habitKey,
    title: '',
    items: objectToArray(firebaseItems)
  }

  return dispatch => new Promise(resolve => {
    createHabitLocal(dispatch, newReduxHabit)
    .then(()=>normaliseHabits(dispatch))
    .then(()=>createHabitRemote(newFirebaseHabit))
    .then(()=>{return resolve()});
  })
}

/**
  * Creates a new habit in the local Redux store
  */
const createHabitLocal = (dispatch, habit) => {
  return new Promise(resolve =>{
    return resolve(dispatch({
        type: 'HABIT_ADD',
        habit
      }));
  });
}

/**
  * Creates a new habit in the Firebase real-time database
  */
const createHabitRemote = (habit) => {
  if (Firebase === null || Firebase.auth().currentUser === null) return () => new Promise(resolve => resolve());
  const UID = Firebase.auth().currentUser.uid;

  return new Promise(resolve =>{
    const habitItemsRef = FirebaseRef.child('habits/'+UID+'/'+habit.key);
    habitItemsRef.set(habit)
    .then(()=>{return resolve()});
  })
}

/**
  * Remove habit
  */
export function removeHabit(key) {
  const habitToRemove = {
    key: key
  }
  return dispatch => new Promise(resolve => {
    removeHabitLocal(dispatch, habitToRemove)
    .then(()=>normaliseHabits(dispatch))
    .then(()=>removeHabitRemote(habitToRemove))
    .then(()=>{return resolve()});
  })
}

/**
  * Remove habits from the local Redux store
  */
const removeHabitLocal = (dispatch, habit) => {
  return new Promise(resolve =>{
    return resolve(dispatch({
        type: 'HABIT_REMOVE',
        habit
      }));
  });
}

/**
  * Remove habits from the Firebase real-time database
  */
const removeHabitRemote = (habit) => {
  if (Firebase === null || Firebase.auth().currentUser === null) return () => new Promise(resolve => resolve());
  const UID = Firebase.auth().currentUser.uid;

  const habitRef = FirebaseRef.child('habits/'+UID+'/'+habit.key);
  const habitOrderRef = FirebaseRef.child('metadata/'+UID+'/habitOrder/'+habit.key);

  return new Promise(resolve =>{
      habitRef.remove()
      .then(()=>habitOrderRef.remove())
      .then(()=>{return resolve()})
      .catch(e => console.log(e))
  })
}

/**
  * Clear habit item.
  * From user's point of view this removes all data for that item (status, notes etc.)
  * In local redux store we replace that day's item with a empty one
  * On Firebase real-time database we go one step further and remove the record completely
  */
export function clearHabitItem(itemKey, habitKey, startingDate, index) {

  const itemToRemove = {
    habitKey: habitKey,
    key: itemKey,
  }

  return dispatch => new Promise(resolve => {
    clearHabitItemLocal(dispatch, itemToRemove)
    .then(()=>clearHabitItemRemote(itemToRemove))
    .then(()=>normaliseHabits(dispatch))
    .then(()=>getHabits(startingDate))
    .then(()=>{return resolve()});
  })
}

/**
  * Clear habit item. In local Redux store we replace that day's item with a empty one
  */
const clearHabitItemLocal = (dispatch, item) => {
  return new Promise(resolve =>{
    return resolve(dispatch({
        type: 'HABITS_ITEM_CLEAR',
        item
      }));
  });
}

/**
  * Clear habit item. On Firebase real-time database we go one step further and remove the record completely
  */
const clearHabitItemRemote = (item) => {
  if (Firebase === null || Firebase.auth().currentUser === null) return () => new Promise(resolve => resolve());
  const UID = Firebase.auth().currentUser.uid;

  const habitItemRef = FirebaseRef.child('habits/'+UID+'/'+item.habitKey+'/items/'+item.key);

  return new Promise(resolve =>{
      habitItemRef.remove()
      .then(()=>{return resolve()})
      .catch(e => console.log(e))
  })
}

/**
  * Reorder habits
  */
export function reorderHabits(prevOrder, fromId, toId, habitId){

  // Decide on new order
  // Sort HERE
  let newOrder = prevOrder.slice();
  newOrder.splice(toId, 0, newOrder.splice(fromId, 1)[0]);

  return dispatch => new Promise(resolve => {
    updateHabitOrderLocal(dispatch, newOrder)
    .then(()=>normaliseHabits(dispatch))
    .then(()=>updateHabitOrderRemote(newOrder))
    .then(()=>{return resolve()});
  })
}


/**
  * Reorder habit items in local Redux store
  */
const updateHabitOrderLocal = (dispatch, newOrder) => {
  return new Promise(resolve =>{
    return resolve(dispatch({
        type: 'REORDER_HABITS',
        newOrder
      }));
  });
}

/**
  * Reorder habit items on Firebase
  */
const updateHabitOrderRemote = (newOrder) => {
  if (Firebase === null || Firebase.auth().currentUser === null) return () => new Promise(resolve => resolve());
  const UID = Firebase.auth().currentUser.uid;

  let newOrderObject = {};
  let i = 0;
  newOrder.forEach(hid => {
    Object.assign(newOrderObject, {[hid]: i});
    i++;
  })

  const habitOrderItemRef = FirebaseRef.child('metadata/'+UID);

  return new Promise(resolve =>{
      habitOrderItemRef.set({habitOrder: newOrderObject})
      .then(()=>{return resolve()})
      .catch(e => console.log(e))
  })
}
