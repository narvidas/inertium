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
  * Get habits
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

export function getWeek(today) {
  const monday = today.clone().startOf('isoWeek');
  const sunday = monday.clone().add(7, 'days');
  console.log('monday')
  console.log(monday.format())
  console.log('sunday')
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
  * Toggle habit item status
  */
export function toggleHabitItemStatus(itemKey, habitKey, currentStatus, startingDate, index) {
  let newStatus = '';

  if(currentStatus === 'done'){
    newStatus = 'undone'
  } else if (currentStatus === 'undone'){
    newStatus = 'none'
  } else {
    newStatus = 'done'
  }

  const newDate = startingDate.clone().add(index, 'days').format();
 

  const newItem = {
    habitKey: habitKey,
    key: itemKey,
    status: newStatus,
    date: newDate
  }
  console.log('newItem');
  console.log(newItem);

  return dispatch => new Promise(resolve => {
    updateHabitItemLocal(dispatch, newItem)
    .then(()=>normaliseHabits(dispatch))
    .then(()=>updateHabitItemRemote(newItem))
    .then(()=>{return resolve()});
  })
}

const updateHabitItemLocal = (dispatch, item) => {
  return new Promise(resolve =>{
    return resolve(dispatch({
        type: 'UPDATE_HABIT_ITEM',
        item,
      }));
  });
}

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
  * Toggle habit item status
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
    .then(()=>getHabits(startingDate))
    .then(()=>{return resolve()});
  })
}

/**
  * Save habit
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

const saveHabitLocal = (dispatch, habit) => {
  return new Promise(resolve =>{
    return resolve(dispatch({
        type: 'HABIT_UPDATE',
        habit
      }));
  });
}

const normaliseHabits = (dispatch) => {
  return new Promise(resolve =>{
    return resolve(dispatch({
        type: 'NORMALISE_HABITS'
      }));
  });
}

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
  * Create habit
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

const createHabitLocal = (dispatch, habit) => {
  return new Promise(resolve =>{
    return resolve(dispatch({
        type: 'HABIT_ADD',
        habit
      }));
  });
}

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
  * Delete habit
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

const removeHabitLocal = (dispatch, habit) => {
  return new Promise(resolve =>{
    return resolve(dispatch({
        type: 'HABIT_REMOVE',
        habit
      }));
  });
}

const removeHabitRemote = (habit) => {
  if (Firebase === null || Firebase.auth().currentUser === null) return () => new Promise(resolve => resolve());
  const UID = Firebase.auth().currentUser.uid;
  
  const habitRef = FirebaseRef.child('habits/'+UID+'/'+habit.key);

  return new Promise(resolve =>{
      habitRef.remove()
      .then(()=>{return resolve()})
      .catch(e => console.log(e))
  })
}

/**
  * Clear habit item
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

const clearHabitItemLocal = (dispatch, item) => {
  return new Promise(resolve =>{
    return resolve(dispatch({
        type: 'HABITS_ITEM_CLEAR',
        item
      }));
  });
}

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
