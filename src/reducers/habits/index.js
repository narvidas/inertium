import Store from '../../store/habits';
import local from './local';
import order from './order';
import week from './week';
import { combineReducers } from 'redux';

export const initialState = Store;

export default combineReducers({ local, order, week });

// export default function habitReducer(state = initialState, action) {
//   switch (action.type) {
//     case 'HABITS_ERROR': {
//       return {
//         ...state,
//         error: action.data,
//       };
//     }

//     case 'USER_RESET': {
//       return initialState;
//     }

//     default:
//       return state;
//   }
// }
