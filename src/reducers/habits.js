import Store from '../store/habits';
import update from 'immutability-helper';
import moment from 'moment';
import { objectToArray, snapshotToArray, arrayToSnapshot, generatePushID, assign } from '../lib/helpers';


/**
  * Empty habit item class type
  */
function EmptyItem(habitKey, date, status=null, notes='') {
  this.date = date;
  this.status = status;
  this.key = generatePushID();
  this.habitKey= habitKey;
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
      const { dayFrom, dayTo } = action;
      // Deep-copy habitsraw
      let habits = objectToArray(state.habitsraw)
        .map((habit) => {
          // Create a subset with this weeks items only
          const givenWeekItems = objectToArray(habit.items)
            .filter(item => moment(item.date).isBetween(dayFrom, dayTo, 'days', '[)')) // Get only dates for current week (filter)
            .map((item) => {return ({ ...item, date: moment(item.date) }); }); // Convert date strings to Moment objects

          // Merge fillers with subset
          // Create empty array of size 7 (7 days in a week)
          // Pre-fill weekdays Mon to Sun with empty items for each weekday (first map)
          // See if we can find a match for the weekday (hence the day() method) and replace if found
          let completeWeekItems = new Array(7)
            .fill(null)
            .map((item, i) => {return (new EmptyItem(habit.key, dayFrom.clone().add(i, 'days')))})
            .map((item) => {return (givenWeekItems.find(usritem => {return item.date.day()===usritem.date.day()}) || item)})
            .map((item) => {return ({ ...item, date: item.date.format() }); });

          // completeWeekItems.reduce((item, key) => {
          //   return { [item.key]: completeWeekItems[key] };
          // }, {});
          return { ...habit, 'key': habit.key, 'items': completeWeekItems };
        });
      
      // Convert object to array
      habits = Object.values(habits);

      return update(state, {
        error: { $set: null },
        loading: { $set: false },
        habits: { $set: habits },
      });
    }

    case 'HABITS_REPLACE': {
      // habitsraw is the raw firebase snapshot (not normalised data)
      return update(state, {
        habitsraw: { $set: action.habitsraw || {} },
      });
    }

    case 'HABITS_ORDER_REPLACE': {
      // our application uses habitOrder as an array, but on firebase
      // we store this as {'habit key': 'sort id'} representation for easier interfacing to firebase
      // hence below when we get the object we need to rebuild the data back into array

      // if (action.order.length) {
      //   let habitOrder = new Array(action.order.length);
      //   Object.keys(action.order).forEach(function(key) {
      //     habitOrder[action.order[key]]=key;
      //   });
      //   habitOrder = habitOrder.filter((el)=> {return el !== undefined });
      const order = action.order || [];
        // habitsraw is the raw firebase snapshot (not normalised data)
        return update(state,{
          habitOrder: {$set: order},
        });
      // }
      // return state;
    }

    case 'HABIT_UPDATE': {
      const { habit } = action;
      const { key } = habit;

      // Find which habit by key and update in store
      const habitIndex = state.habits.findIndex(habit => habit.key === key);
      
      return update(state, {
        habits: { [habitIndex]: { $merge: habit } },
        habitsraw: { [key]: { $merge: habit } },
      });
    }

    case 'HABIT_ADD': {
      const { habit } = action;
      const { key, items } = action.habit;

      const habitraw = { [key]: habit };
      const habitview = { ...habit, 'items': objectToArray(items) };

      return update(state, {
        habitsraw: { $merge: habitraw },
        habits: { $push: [habitview] },
        habitOrder: { $push: [key] },
      });
    }

    case 'UPDATE_HABIT_ITEM': {
      // Find which habit by key
      const habitIndex = state.habits.findIndex(habit => habit.key === action.item.habitKey);

      // Find which item by date
      const itemIndex = state.habits[habitIndex]
        .items.findIndex(item => item.key === action.item.key);

      return update(state, {
        habits: {
          [habitIndex]: {
            items: {
              [itemIndex]: { $set: action.item },
            },
          },
        },
        habitsraw: {
          [action.item.habitKey]: {
            items: {
              [action.item.key]: { $set: action.item },
            },
          },
        },
      });
    }

    case 'HABITS_ITEM_CLEAR': {
      // Find which habit by key
      const habitIndex = state.habits.findIndex(habit => habit.key == action.item.habitKey);

      // Find which item by date
      const itemIndex = state.habits[habitIndex].items.findIndex(item => item.key == action.item.key);

      return update(state, {
        habits:{
          [habitIndex]: {
            items: {
              [itemIndex]: { $set: action.item },
            },
          },
        },
        habitsraw: {
          [action.item.habitKey]: {
            items: { $unset: [action.item.key] },
          },
      }})
    }

    case 'HABIT_REMOVE': {
      // Find which habit by key
      const habitIndex = state.habits.findIndex(habit => habit.key === action.habit.key);
      // const habitRawIndex = state.habitsraw.findIndex(habit => habit.key === action.habit.key);

      let newOrder = state.habitOrder.filter(hid=> hid!=action.habit.key);

      return update(state, {
        habits: {$splice: [[habitIndex, 1]]},
        habitsraw: {$unset: [action.habit.key] },
        habitOrder: {$set: newOrder}
      })
    }

    case 'REORDER_HABITS': {
      // Order habits by habitOrder
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
