import React from "react";
import { fireEvent, render, waitFor } from "../../testing/customRender";
import { refresh } from "../../testing/helpers";
import spyOnAlert from "../../testing/spyOnAlert";
import { createNewHabit } from "./habits.slice";
import { HabitsScreen } from "./HabitsScreen";
const { pressAlertButton } = spyOnAlert();

console.warn = () => {};
console.error = () => {};

describe("Habits", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Triggers sync when swiping down", async () => {
    const { getByText, getByTestId, sync } = render(<HabitsScreen />);
    getByTestId("root");
    expect(sync.syncAll).not.toHaveBeenCalled();

    const [scrollableList] = getByTestId("habit-list").children;
    refresh(scrollableList);

    await waitFor(() => {
      expect(sync.syncAll).toHaveBeenCalled();
      getByText("Sync complete.");
    });
  });
  describe("Habit Creation", () => {
    test("Can create a new habit", async () => {
      const { getByText, getByLabelText, getByTestId, sync, store } = render(<HabitsScreen />);
      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(store.getState().habitsState.habits).toStrictEqual({});

      const newHabitButton = getByTestId("round-button");
      fireEvent.press(newHabitButton);

      const newHabitText = getByText("New habit");
      fireEvent.press(newHabitText);

      getByText(/create new habit/i);

      const habitNameInput = getByLabelText(/habit name/i);
      fireEvent.changeText(habitNameInput, "test habit");

      const goalInput = getByLabelText(/goal/i);
      fireEvent.changeText(goalInput, "4");

      const saveButton = getByText(/save/i);
      fireEvent.press(saveButton);

      await waitFor(() => {
        const habitsLength = Object.keys(store.getState().habitsState.habits).length;
        expect(habitsLength).toBe(1);
      });
      expect(sync.syncAll).toHaveBeenCalled();
    });
    test("Can cancel creating a new habit", async () => {
      const { getByText, getByTestId, sync, store } = render(<HabitsScreen />);
      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(store.getState().habitsState.habits).toStrictEqual({});

      const newHabitButton = getByTestId("round-button");
      fireEvent.press(newHabitButton);

      const newHabitText = getByText("New habit");
      fireEvent.press(newHabitText);

      getByText(/create new habit/i);

      const cancelButton = getByText(/close/i);
      fireEvent.press(cancelButton);

      expect(store.getState().habitsState.habits).toStrictEqual({});
      expect(sync.syncAll).not.toHaveBeenCalled();
    });
  });
  describe("Habit Modification", () => {
    test("Can change habits name and goal", async () => {
      const { findByLabelText, getByText, getByLabelText, sync, store } = render(<HabitsScreen />);
      store.dispatch(createNewHabit({ title: "run 5k", goal: 4 }));

      expect(sync.syncAll).not.toHaveBeenCalled();

      const editHabitButton = getByLabelText(/configure habit run 5k/i);
      fireEvent.press(editHabitButton);

      getByText(/edit habit/i);

      const habitNameInput = await findByLabelText(/change habit name/i);
      expect(habitNameInput.props.defaultValue).toBe("run 5k");
      fireEvent.changeText(habitNameInput, "cold shower");

      const goalInput = getByLabelText(/change goal/i);
      expect(goalInput.props.defaultValue).toBe("4");
      fireEvent.changeText(goalInput, "7");

      const saveButton = getByText(/save/i);
      fireEvent.press(saveButton);

      await waitFor(() => {
        const habits = Object.values(store.getState().habitsState.habits);
        expect(habits.length).toBe(1);

        const [habit] = habits;
        expect(habit.goal).toBe("7");
        expect(habit.title).toBe("cold shower");
        expect(sync.syncHabit).toHaveBeenCalledWith(habit.id);
      });
    });
    test("Can cancel editing a habit", async () => {
      const { getByText, getByLabelText, sync, store } = render(<HabitsScreen />);
      store.dispatch(createNewHabit({ title: "run 5k", goal: 4 }));
      const habitsBefore = store.getState().habitsState.habits;

      expect(sync.syncAll).not.toHaveBeenCalled();

      const editHabitButton = getByLabelText(/configure habit run 5k/i);
      fireEvent.press(editHabitButton);

      getByText(/edit habit/i);

      const cancelButton = getByText(/close/i);
      fireEvent.press(cancelButton);

      const habitsAfter = store.getState().habitsState.habits;
      expect(habitsAfter).toStrictEqual(habitsBefore);
      expect(sync.syncAll).not.toHaveBeenCalled();
    });
    test("Can remote a habit", async () => {
      const { getByText, getByLabelText, sync, store } = render(<HabitsScreen />);
      store.dispatch(createNewHabit({ title: "run 5k", goal: 4 }));
      store.dispatch(createNewHabit({ title: "stronglift 5x5", goal: 3 }));
      jest.clearAllMocks();

      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(sync.syncHabit).not.toHaveBeenCalled();

      const [habitBefore1, habitBefore2] = Object.values(store.getState().habitsState.habits);
      expect(habitBefore1.meta.isDeleted).toBe(false);
      expect(habitBefore2.meta.isDeleted).toBe(false);

      const orderBefore = Object.values(store.getState().habitsState.order);
      expect(orderBefore.length).toBe(2);

      const editHabitButton = getByLabelText(/configure habit run 5k/i);
      fireEvent.press(editHabitButton);

      getByText(/edit habit/i);

      const removeHabit = getByText(/remove/i);
      fireEvent.press(removeHabit);
      pressAlertButton("Yes");

      await waitFor(() => {
        const habitsAfter = Object.values(store.getState().habitsState.habits);
        expect(habitsAfter.length).toBe(2);
        const [habitAfter1, habitAfter2] = habitsAfter;

        expect(habitAfter1.title).toBe("run 5k");
        expect(habitAfter1.meta.isDeleted).toBe(true);
        expect(habitAfter2.title).toBe("stronglift 5x5");
        expect(habitAfter2.meta.isDeleted).toBe(false);

        const orderAfter = Object.values(store.getState().habitsState.order.order);
        expect(orderAfter.length).toBe(1);

        expect(sync.syncHabit).toHaveBeenCalled();
      });
    });
  });
});
