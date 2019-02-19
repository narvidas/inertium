import update from 'immutability-helper';
import moment from 'moment';
import Store from '../../store/habits';
import { objectToArray, generatePushID } from '../../lib/helpers';

/**
 * Empty habit item class type
 */
function EmptyItem(habitKey, date, status = null) {
  this.date = date;
  this.status = status;
  this.key = generatePushID();
  this.habitKey = habitKey;
}

export const initialState = Store.week;

export default function habitWeekReducer(state = initialState, action) {
  switch (action.type) {
    case 'GET_WEEK': {
      const dayFrom = action.today.clone().startOf('isoWeek'); // monday
      const dayTo = dayFrom.clone().add(7, 'days'); // sunday

      let habits = objectToArray(action.habits.habits.local).map((habit) => {
        // Create a subset with this weeks items only
        // Get only dates for current week (filter)
        // Convert date strings to Moment objects
        const givenWeekItems = objectToArray(habit.items)
          .filter((item) => moment(item.date).isBetween(dayFrom, dayTo, 'days', '[)'))
          .map((item) => ({ ...item, date: moment(item.date) }));

        // Merge fillers with subset
        // Create empty array of size 7 (7 days in a week)
        // Pre-fill weekdays Mon to Sun with empty items for each weekday (first map)
        // See if we can find a match for the weekday (hence day() method) and replace if found
        const completeWeekItems = new Array(7)
          .fill(null)
          .map((item, i) => new EmptyItem(habit.key, dayFrom.clone().add(i, 'days')))
          .map((item) => givenWeekItems.find((thisWeekItem) => item.date.day() === thisWeekItem.date.day()) || item)
          .map((item) => ({ ...item, date: item.date.format() }));

        // completeWeekItems.reduce((item, key) => {
        //   return { [item.key]: completeWeekItems[key] };
        // }, {});
        return { ...habit, key: habit.key, items: completeWeekItems };
      });

      // Convert object to array
      habits = Object.values(habits);

      return update(state, {
        $set: habits,
      });
    }

    case 'UPDATE_WEEK_HABIT': {
      const { habit } = action;
      const { key } = habit;

      // Find which habit by key and update in store
      const habitIndex = state.findIndex((h) => h.key === key);

      return update(state, {
        [habitIndex]: { $merge: habit },
      });
    }

    case 'ADD_WEEK_HABIT': {
      const { habit } = action;
      const { items } = action.habit;
      const habitview = { ...habit, items: objectToArray(items) };

      return update(state, {
        $push: [habitview],
      });
    }

    case 'UPDATE_WEEK_HABIT_ITEM': {
      // Find which habit by key
      const habitIndex = state.findIndex((habit) => habit.key === action.item.habitKey);

      // Find which item by date
      const itemIndex = state[habitIndex].items.findIndex((item) => item.key === action.item.key);

      return update(state, {
        [habitIndex]: {
          items: {
            [itemIndex]: { $merge: action.item },
          },
        },
      });
    }

    case 'CLEAR_WEEK_HABIT_ITEM': {
      // Find which habit by key
      const habitIndex = state.findIndex((habit) => habit.key === action.item.habitKey);

      // Find which item by date
      const itemIndex = state[habitIndex].items.findIndex((item) => item.key === action.item.key);

      return update(state, {
        [habitIndex]: {
          items: {
            [itemIndex]: { $set: action.item },
          },
        },
      });
    }

    case 'REMOVE_WEEK_HABIT': {
      // Find which habit by key
      const habitIndex = state.findIndex((habit) => habit.key === action.habit.key);

      return update(state, {
        $splice: [[habitIndex, 1]],
      });
    }

    case 'REORDER_WEEK_HABITS': {
      const orderedHabits = action.newOrder.map((hid) => state.find((h) => h.key === hid));

      return update(state, { $set: orderedHabits });
    }

    case 'USER_RESET': {
      return initialState;
    }

    default:
      return state;
  }
}
