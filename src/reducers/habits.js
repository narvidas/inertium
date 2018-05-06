import Store from '../store/habits';
import update from 'immutability-helper';
import moment from 'moment';
import { objectToArray, snapshotToArray, arrayToSnapshot, generatePushID, assign } from '../lib/helpers';


/**
  * Empty habit item class type
  */
function emptyItem(date, type='generic', status=null, notes='') {
  this.date = date;
  this.notes = notes;
  this.status = status;
  this.type = type;
  this.key = generatePushID();
}

export const initialState = Store;

export default function habitReducer(state = initialState, action) {
  switch (action.type) {

    case 'HABITS_ERROR': {
      return {
        ...state,
        error: action.data,
      };
    }

    case 'GET_WEEK': {
      // Deep-copy habitsraw
      let habits = JSON.parse(JSON.stringify(state.habitsraw));
      const {dayFrom, dayTo} = action;

      habits.forEach((habit,habitID, habits)=>{
        // Convert item (object to array)
        // Get only dates for current week (filter)
        // Convert date strings to Moment objects
        let userItems = objectToArray(habit.items)
          .filter(item=>moment(item.date).isBetween(dayFrom, dayTo, 'days', '[]'))
          .map(item=>{return ({...item, date: moment(item.date)})})

        // Create empty array of size 7 (7 days in a week)
        // Pre-fill weekdays Mon to Sun with empty items for each weekday (first map)
        // See if we can find a match for the weekday (hence the day() method) and replace if found
        let weekItems = new Array(7).fill(null)
          .map((item, i)=>{return (new emptyItem(dayFrom.clone().add(i, 'days')))})
          .map(item=>{return (userItems.find(usritem=>{return item.date.day()===usritem.date.day()}) || item)})

        habits[habitID].items = weekItems;
      });

      return update(state, {
        error: {$set: null},
        loading: {$set: false},
        habits: {$set: habits},
      });
    }

    case 'HABITS_RAW_REPLACE': {
      // habitsraw is the raw firebase snapshot (not normalised data)
      return update(state,{
        habitsraw: {$set: action.habitsraw},
      });
    }

    case 'HABITS_ORDER_REPLACE': {
      console.log('>>>>>>>>>>>>>>>>>')
      console.log(action.order)
      // our application uses habitOrder as an array, but on firebase
      // we store this as {'habit key': 'sort id'} representation for easier interfacing to firebase
      // hence below when we get the object we need to rebuild the data back into array
      let habitOrder = new Array(action.order.length);
      Object.keys(action.order).forEach(function(key) {
        habitOrder[action.order[key]]=key;
      });
      habitOrder = habitOrder.filter((el)=> {return el != undefined });

      // habitsraw is the raw firebase snapshot (not normalised data)
      return update(state,{
        habitOrder: {$set: habitOrder},
      });
    }

    case 'HABIT_UPDATE': {
    // Find which habit by key and update in store
      const habitIndex = state.habits.findIndex(habit => habit.key == action.habit.key);
      return update(state, {
        habits: {
          [habitIndex]: {$merge: action.habit}
        }
      });
    }

    case 'HABIT_ADD': {
      // Push new habit to normalised an un-normalised
      return update(state, {
        habitsraw: {$push: [{...action.habit, items: {}}]},
        habits: {$push: [action.habit]}
      });
    }

    case 'UPDATE_HABIT_ITEM': {
      // Find which habit by key
      const habitIndex = state.habits.findIndex(habit => habit.key == action.item.habitKey);
      // Find which item by date
      const itemIndex = state.habits[habitIndex].items.findIndex(item => {
        return item.key == action.item.key});

      // Update nested habit item state using immutability helper
      return update(state, {
        habits: {
          [habitIndex]: {
            items: {
              [itemIndex]: {$merge: action.item}
            }
          }
        }
      });
    }

    case 'NORMALISE_HABITS': {
      // Deep-copy habitsraw
      let normalised = JSON.parse(JSON.stringify(state.habitsraw));

      // For every habits (week) parent
      for(let h=0; h<state.habits.length; h++){
        const habit = JSON.parse(JSON.stringify(state.habits[h]));

        // Get index of habits (week) parent counter-part in habitsraw (normalised) array
        let habitIndex = normalised.findIndex(h => h.key == habit.key);

        // Everything from habits (week) parent will be the same except items, which we re-use
        normalised[habitIndex] = {...habit, items: normalised[habitIndex].items};

        // For every item child in habits (week) parents
        for (let i=0; i<habit.items.length; i++){
          const item = habit.items[i];
          // Don't add placeholder items to save backend space (redundant data)
          // Placeholders are determined by status (initially null until edited)
          if (item.status){
            // Add items property if it doesn't exist completely (happens when no children exist in Firebase)
            !('items' in normalised[habitIndex]) && (normalised[habitIndex].items = {});
            // Re-assign as object property
            normalised[habitIndex].items[item.key] = habit.items[i];
          }
        }
      }

      return update(state, {
        habitsraw: {$set: normalised}
      });
    }

    case 'HABITS_ITEM_CLEAR': {
      // Find which habit by key
      const habitIndex = state.habits.findIndex(habit => habit.key == action.item.habitKey);
      const habitRawIndex = state.habitsraw.findIndex(habit => habit.key == action.item.habitKey);

      console.log("EEEE")
      console.log(habitIndex);

      // Find which item by date
      const itemIndex = state.habits[habitIndex].items.findIndex(item => item.key == action.item.key);

      return update(state, {
        habits:{
          [habitIndex]: {
            items: {
              [itemIndex]: {$set: action.item}
            }
          }
        },
        habitsraw: {
          [habitRawIndex]: {
            items: {$unset: [action.item.key]}}
      }})
    }

    case 'HABIT_REMOVE': {
      // Find which habit by key
      const habitIndex = state.habits.findIndex(habit => habit.key === action.habit.key);
      const habitRawIndex = state.habitsraw.findIndex(habit => habit.key === action.habit.key);

      let newOrder = state.habitOrder.filter(hid=> hid!=action.habit.key);

      return update(state, {
        habits: {$splice: [[habitIndex, 1]]},
        habitsraw: {$splice: [[habitRawIndex, 1]]},
        habitOrder: {$set: newOrder}
      })
    }

    case 'REORDER_HABITS': {
      let orderedHabits = action.newOrder.map(hid =>state.habits.find(h => h.key===hid));

      return update(state, {
        habitOrder: {$set: action.newOrder},
        habits: {$set: orderedHabits},
      })
    }

    default:
      return state;
  }
}
