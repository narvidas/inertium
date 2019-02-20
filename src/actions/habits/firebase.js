import { FirebaseRef } from '../../lib/firebase';

export const readUserHabits = async (uid) => {
  const habits = await FirebaseRef.child(`habits/${uid}`).once('value');
  return habits.val();
};

export const readUserHabitsOrder = async (uid) => {
  const habitOrder = await FirebaseRef.child(`metadata/${uid}/habitOrder`).once('value');
  return habitOrder.val();
};

export const setUserHabits = (uid, habits) => {
  FirebaseRef.child(`habits/${uid}`).set(habits);
};

export const updateUserHabitItem = (uid, item) => {
  FirebaseRef.child(`habits/${uid}/${item.habitKey}/items/${item.key}`).update(item);
};

export const updateUserHabitDetails = (uid, habit) => {
  FirebaseRef.child(`habits/${uid}/${habit.key}`).update(habit);
};

export const setUserHabit = (uid, habit) => {
  FirebaseRef.child(`habits/${uid}/${habit.key}`).set(habit);
};

export const setUserHabitOrder = (uid, order) => {
  FirebaseRef.child(`metadata/${uid}/habitOrder/`).set(order);
};

export const removeUserHabit = (uid, habitKey) => {
  FirebaseRef.child(`habits/${uid}/${habitKey}`).remove();
};

export const removeUserHabitItem = (uid, item) => {
  FirebaseRef.child(`habits/${uid}/${item.habitKey}/items/${item.key}`).remove();
};
