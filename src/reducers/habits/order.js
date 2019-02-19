import update from 'immutability-helper';
import Store from '../../store/habits';

export const initialState = Store.order;

export default function habitOrderReducer(state = initialState, action) {
  switch (action.type) {
    case 'REPLACE_HABIT_ORDER': {
      return update(state, { $set: action.newOrder });
    }

    case 'ADD_HABIT_ORDER': {
      const { key } = action.habit;

      return update(state, { $push: [key] });
    }

    case 'REMOVE_HABIT_ORDER': {
      const newOrder = state.filter((hid) => hid !== action.habit.key);

      return update(state, {
        $set: newOrder,
      });
    }

    case 'USER_RESET': {
      return initialState;
    }

    default:
      return state;
  }
}
