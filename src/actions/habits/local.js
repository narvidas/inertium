export const replaceHabits = (dispatch, habitsraw) => dispatch({ type: 'REPLACE_LOCAL_HABITS', habitsraw });
export const replaceOrder = (dispatch, newOrder) => dispatch({ type: 'REPLACE_HABIT_ORDER', newOrder });
export const getWeek = (dispatch, today, habits) => dispatch({ type: 'GET_WEEK', today, habits });
export const updateHabitItem = (dispatch, item) => {
  dispatch({ type: 'UPDATE_WEEK_HABIT_ITEM', item });
  dispatch({ type: 'UPDATE_LOCAL_HABIT_ITEM', item });
};
export const saveHabit = (dispatch, habit) => {
  dispatch({ type: 'UPDATE_WEEK_HABIT', habit });
  dispatch({ type: 'UPDATE_LOCAL_HABIT', habit });
};
export const createHabit = (dispatch, habit) => {
  dispatch({ type: 'ADD_WEEK_HABIT', habit });
  dispatch({ type: 'ADD_LOCAL_HABIT', habit });
  dispatch({ type: 'ADD_HABIT_ORDER', habit });
};
export const removeHabit = (dispatch, habit) => {
  dispatch({ type: 'REMOVE_HABIT_LOCAL', habit });
  dispatch({ type: 'REMOVE_HABIT_WEEK', habit });
  dispatch({ type: 'REMOVE_HABIT_ORDER', habit });
};
export const clearHabitItem = (dispatch, item) => dispatch({ type: 'HABITS_ITEM_CLEAR', item });
export const updateHabitOrder = (dispatch, newOrder) => {
  dispatch({ type: 'REPLACE_HABIT_ORDER', newOrder });
  dispatch({ type: 'REORDER_WEEK_HABITS', newOrder });
};
