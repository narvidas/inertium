import update from 'immutability-helper';
import Store from '../../store/habits';

export const initialState = Store.local;

export default function habitLocalReducer(state = initialState, action) {
  switch (action.type) {
    case 'REPLACE_LOCAL_HABITS': {
      // habitsraw is the raw firebase snapshot (not normalised data)
      return update(state, {
        $set: action.habitsraw || {},
      });
    }

    case 'UPDATE_LOCAL_HABIT': {
      const { habit } = action;
      const { key } = habit;

      return update(state, {
        [key]: { $merge: habit },
      });
    }

    case 'ADD_LOCAL_HABIT': {
      const { habit } = action;
      const { key } = action.habit;
      const habitraw = { [key]: habit };

      return update(state, {
        $merge: habitraw,
      });
    }

    case 'UPDATE_LOCAL_HABIT_ITEM': {
      const { habitKey, key } = action.item;
      const itemIsNew = !state[habitKey].items[key];

      const actionOnItem = itemIsNew ? '$set' : '$merge';
      return update(state, {
        [action.item.habitKey]: {
          items: {
            [action.item.key]: { [actionOnItem]: action.item },
          },
        },
      });
    }

    case 'CLEAR_LOCAL_HABIT_ITEM': {
      return update(state, {
        [action.item.habitKey]: {
          items: { $unset: [action.item.key] },
        },
      });
    }

    case 'REMOVE_LOCAL_HABIT': {
      return update(state, {
        $unset: [action.habitKey],
      });
    }

    case 'USER_RESET': {
      return initialState;
    }

    default:
      return state;
  }
}
