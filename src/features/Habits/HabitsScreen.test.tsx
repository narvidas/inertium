import React from "react";
import { fireEvent, render, waitFor, within } from "../../testing/customRender";
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

  test("Will show habit target as 0 if no value exists in local/remote state (UX improvement)", async () => {
    const { findByText, store } = render(<HabitsScreen />);
    store.dispatch(createNewHabit({ title: "run 5k", goal: undefined }));

    await findByText("run 5k (0/0)");
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
    test("Will show error toast if no title provided or goal is more than 7 days", async () => {
      const { getByText, findByText, getByLabelText, getByTestId, sync, store } = render(<HabitsScreen />);
      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(store.getState().habitsState.habits).toStrictEqual({});

      const newHabitButton = getByTestId("round-button");
      fireEvent.press(newHabitButton);

      const newHabitText = getByText("New habit");
      fireEvent.press(newHabitText);

      getByText(/create new habit/i);

      // Not entering title 1st time round
      const habitNameInput = getByLabelText(/habit name/i);
      fireEvent.changeText(habitNameInput, "");

      const goalInput = getByLabelText(/goal/i);
      fireEvent.changeText(goalInput, "4");

      const saveButton = getByText(/save/i);
      fireEvent.press(saveButton);

      await findByText(/Title is required/i);

      // Enter title this time, but goal is more than 7 days (makes no sense in a week)
      fireEvent.changeText(habitNameInput, "test habit");

      fireEvent.changeText(goalInput, "8");
      fireEvent.press(saveButton);

      await findByText(/Week has only 7 days/i);

      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(sync.syncHabit).not.toHaveBeenCalled();
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
    test("Can remove a habit", async () => {
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
    test("Can reorder habits", async () => {
      const { getByTestId, sync, store } = render(<HabitsScreen />);
      store.dispatch(createNewHabit({ title: "run 5k", goal: 4 }));
      store.dispatch(createNewHabit({ title: "stronglift 5x5", goal: 3 }));
      jest.clearAllMocks();

      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(sync.syncHabit).not.toHaveBeenCalled();

      const [habitBefore1, habitBefore2] = Object.values(store.getState().habitsState.habits);
      const orderBefore = Object.values(store.getState().habitsState.order.order);
      expect(orderBefore.length).toBe(2);

      expect(orderBefore[0]).toBe(habitBefore1.id);
      expect(orderBefore[1]).toBe(habitBefore2.id);

      // SortableList is inside habit-list View - get its first child
      const habitListView = getByTestId("habit-list");
      const [sortableHabitList] = habitListView.children;

      const newOrderByIndex = [1, 0]; // Simulate reordering (swapping of two items in list)
      fireEvent(sortableHabitList, "onReleaseRow", undefined, newOrderByIndex);

      await waitFor(() => {
        expect(sync.syncHabitOrder).toHaveBeenCalled();
      });
      const orderAfter = Object.values(store.getState().habitsState.order.order);
      expect(orderAfter.length).toBe(2);

      expect(orderAfter[0]).toBe(habitBefore2.id);
      expect(orderAfter[1]).toBe(habitBefore1.id);
    });
  });
  describe("Items", () => {
    test("Can change item status when tapping on them", async () => {
      const { getByTestId, sync, store } = render(<HabitsScreen />);
      store.dispatch(createNewHabit({ title: "run 5k", goal: 4 }));
      jest.clearAllMocks();

      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(sync.syncHabit).not.toHaveBeenCalled();

      const [habitBefore] = Object.values(store.getState().habitsState.habits);
      expect(habitBefore.items.length).toBe(0);

      // Select Monday as success (single tap)
      const getWeekItems = async () => {
        const habitContainer = getByTestId("habit-container");
        return await within(habitContainer).findAllByTestId("item-container");
      };
      const [monday] = await getWeekItems();
      fireEvent.press(monday);

      // Select Wednesday as failure (two taps)
      const getWednesday = async () => (await getWeekItems())[2];
      fireEvent.press(await getWednesday());
      fireEvent.press(await getWednesday());

      // Select Friday as default by circling state back to initial (three taps)
      const getFriday = async () => (await getWeekItems())[4];
      fireEvent.press(await getFriday());
      fireEvent.press(await getFriday());
      fireEvent.press(await getFriday());

      await waitFor(() => {
        expect(sync.syncHabit).toHaveBeenCalledWith(habitBefore.id);
        // 6 presses total (1 + 2 + 3), each triggers a sync
        // Plus potential initial render sync - verify at least 6 calls
        expect(sync.syncHabit.mock.calls.length).toBeGreaterThanOrEqual(6);
      });
      const [habitAfter] = Object.values(store.getState().habitsState.habits);
      expect(habitAfter.items.length).toBe(3);
      const [mondayInState, wednesdayInState, fridayInState] = habitAfter.items;

      expect(mondayInState.id).not.toBeFalsy();
      expect(mondayInState.status).toBe("done");

      expect(wednesdayInState.id).not.toBeFalsy();
      expect(wednesdayInState.status).toBe("fail");

      expect(fridayInState.id).not.toBeFalsy();
      expect(fridayInState.status).toBe("default");

      expect(sync.syncAll).not.toHaveBeenCalled();
    });

    test("Can input notes into an item upon a long press", async () => {
      const { getByTestId, getByText, findByLabelText, sync, store } = render(<HabitsScreen />);
      store.dispatch(createNewHabit({ title: "run 5k", goal: 4 }));
      jest.clearAllMocks();

      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(sync.syncHabit).not.toHaveBeenCalled();

      const [habitBefore] = Object.values(store.getState().habitsState.habits);
      expect(habitBefore.items.length).toBe(0);

      const getWeekItems = async () => {
        const habitContainer = getByTestId("habit-container");
        return await within(habitContainer).findAllByTestId("item-container");
      };
      const [_, tuesday] = await getWeekItems();
      fireEvent(tuesday, "onLongPress");

      const notesInput = await findByLabelText(/change item notes/i);
      expect(notesInput.props.defaultValue).toBe("");
      fireEvent.changeText(notesInput, "Easy run, 9.7km/h speed on average");

      const saveButton = getByText(/save/i);
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(sync.syncHabit).toHaveBeenCalledWith(habitBefore.id);
      });
      const [habitAfter] = Object.values(store.getState().habitsState.habits);
      expect(habitAfter.items.length).toBe(1);
      const [mondayInState] = habitAfter.items;

      expect(mondayInState.id).not.toBeFalsy();
      expect(mondayInState.notes).toBe("Easy run, 9.7km/h speed on average");
    });

    test("Can cancel inputting notes into an item", async () => {
      const { getByTestId, getByText, findByLabelText, sync, store } = render(<HabitsScreen />);
      store.dispatch(createNewHabit({ title: "run 5k", goal: 4 }));

      // Wait for initial sync from useEffect after habit creation, then clear mocks
      await waitFor(() => expect(sync.syncHabit).toHaveBeenCalled());
      jest.clearAllMocks();

      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(sync.syncHabit).not.toHaveBeenCalled();

      const [habitBefore] = Object.values(store.getState().habitsState.habits);
      expect(habitBefore.items.length).toBe(0);

      const getWeekItems = async () => {
        const habitContainer = getByTestId("habit-container");
        return await within(habitContainer).findAllByTestId("item-container");
      };
      const [_, tuesday] = await getWeekItems();
      fireEvent(tuesday, "onLongPress");

      const notesInput = await findByLabelText(/change item notes/i);
      expect(notesInput.props.defaultValue).toBe("");
      fireEvent.changeText(notesInput, "Easy run, 9.7km/h speed on average");

      const saveButton = getByText(/close/i);
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(sync.syncHabit).not.toHaveBeenCalled();
      });
      const [habitAfter] = Object.values(store.getState().habitsState.habits);
      expect(habitAfter.items.length).toBe(0);
    });

    test("Will show error toast if notes are longer than 1000 symbols", async () => {
      const { getByTestId, findByText, getByText, findByLabelText, sync, store } = render(<HabitsScreen />);
      store.dispatch(createNewHabit({ title: "run 5k", goal: 4 }));

      // Wait for initial sync from useEffect after habit creation, then clear mocks
      await waitFor(() => expect(sync.syncHabit).toHaveBeenCalled());
      jest.clearAllMocks();

      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(sync.syncHabit).not.toHaveBeenCalled();

      const [habitBefore] = Object.values(store.getState().habitsState.habits);
      expect(habitBefore.items.length).toBe(0);

      const getWeekItems = async () => {
        const habitContainer = getByTestId("habit-container");
        return await within(habitContainer).findAllByTestId("item-container");
      };
      const [monday] = await getWeekItems();
      fireEvent(monday, "onLongPress");

      const notesInput = await findByLabelText(/change item notes/i);
      expect(notesInput.props.defaultValue).toBe("");
      const longText = "VERY-LONG-TEXT".repeat(100);
      fireEvent.changeText(notesInput, longText);

      const saveButton = getByText(/save/i);
      fireEvent.press(saveButton);

      await findByText(/Cannot be more than 1000 symbols/i);
      expect(sync.syncHabit).not.toHaveBeenCalled();
      const [habitAfter] = Object.values(store.getState().habitsState.habits);
      expect(habitAfter.items.length).toBe(0);
    });
    test("Will accept an empty string as valid notes as save it (minor UX improvement for fluidity in use)", async () => {
      const { getByTestId, getByText, findByLabelText, sync, store } = render(<HabitsScreen />);
      store.dispatch(createNewHabit({ title: "run 5k", goal: 4 }));
      jest.clearAllMocks();

      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(sync.syncHabit).not.toHaveBeenCalled();

      const [habitBefore] = Object.values(store.getState().habitsState.habits);
      expect(habitBefore.items.length).toBe(0);

      const getWeekItems = async () => {
        const habitContainer = getByTestId("habit-container");
        return await within(habitContainer).findAllByTestId("item-container");
      };
      const [monday] = await getWeekItems();
      fireEvent(monday, "onLongPress");

      const notesInput = await findByLabelText(/change item notes/i);
      fireEvent.changeText(notesInput, "");

      const saveButton = getByText(/save/i);
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(sync.syncHabit).toHaveBeenCalled();
      });
      const [habitAfter] = Object.values(store.getState().habitsState.habits);
      expect(habitAfter.items.length).toBe(1);
      const [item] = habitAfter.items;
      expect(item.notes).toBe("");
    });
  });
});
