import format from "date-fns/format";
import React from "react";
import { fireEvent, render, waitFor, within } from "../../testing/customRender";
import spyOnAlert from "../../testing/spyOnAlert";
import { createNewHabit } from "../Habits/habits.slice";
import { ScrollableHabitsScreen } from "./ScrollableHabitsScreen";

const { pressAlertButton } = spyOnAlert();

// Suppress console warnings/errors in tests
console.warn = () => { };
console.error = () => { };

describe("ScrollableHabitsScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    test("Renders the scrollable root container", async () => {
      const { findByTestId } = render(<ScrollableHabitsScreen />);
      await findByTestId("scrollable-root");
    });

    test("Renders the calendar strip with current month and year", async () => {
      const { findByText } = render(<ScrollableHabitsScreen />);
      // Should show current month and year (e.g., "December 2025")
      const expectedHeader = format(new Date(), "MMMM yyyy");
      await findByText(expectedHeader);
    });

    test("Renders the This week button", async () => {
      const { findByText } = render(<ScrollableHabitsScreen />);
      await findByText("This week");
    });

    test("Shows habit with goal progress only when view starts on Monday", async () => {
      const { findByText, store } = render(<ScrollableHabitsScreen />);
      store.dispatch(createNewHabit({ title: "meditation", goal: 3 }));

      // Initial view centers on today - goal progress only shows if leftmost day is Monday
      const today = new Date();
      const isViewOnMonday = today.getDay() === 1; // 1 = Monday

      if (isViewOnMonday) {
        // When on Monday, should show goal progress
        await findByText(/meditation \(\d+\/3\)/);
      } else {
        // When not on Monday, should show just the title
        await findByText("meditation");
      }
    });

    test("Renders today's day name in the calendar strip", async () => {
      const { findAllByText } = render(<ScrollableHabitsScreen />);
      // Today's day should appear multiple times (e.g., "MON" for all Mondays in buffer)
      const todayDayName = format(new Date(), "EEE").toUpperCase();
      const dayElements = await findAllByText(todayDayName);
      // Should find multiple instances (buffer has many weeks)
      expect(dayElements.length).toBeGreaterThan(0);
    });

    test("Renders today's date number in the calendar strip", async () => {
      const { findAllByText } = render(<ScrollableHabitsScreen />);
      // Today's date number should appear
      const todayDateNumber = format(new Date(), "d");
      const dateElements = await findAllByText(todayDateNumber);
      // Should find at least one (in calendar strip)
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  describe("Calendar Navigation", () => {
    test("This week button is pressable and shows current month", async () => {
      const { findByText, getByText } = render(<ScrollableHabitsScreen />);

      // Verify initial month header
      const expectedHeader = format(new Date(), "MMMM yyyy");
      await findByText(expectedHeader);

      // Press This week button
      const thisWeekButton = getByText("This week");
      fireEvent.press(thisWeekButton);

      // Month header should still show current month
      await findByText(expectedHeader);
    });

    test("Multiple habits show synchronized day items", async () => {
      const { findAllByTestId, store } = render(<ScrollableHabitsScreen />);

      // Create two habits
      store.dispatch(createNewHabit({ title: "habit one", goal: 3 }));
      store.dispatch(createNewHabit({ title: "habit two", goal: 5 }));

      // Both should have rendered habit containers
      const habitContainers = await findAllByTestId("scrollable-habit-container");
      expect(habitContainers.length).toBe(2);

      // Each habit should have day items
      for (const container of habitContainers) {
        const dayItems = await within(container).findAllByTestId("scrollable-item-container");
        // Should have multiple day items visible
        expect(dayItems.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Sync Operations", () => {
    test("Triggers sync when swiping down", async () => {
      const { getByText, findByTestId, sync } = render(<ScrollableHabitsScreen />);
      await findByTestId("scrollable-root");
      expect(sync.syncAll).not.toHaveBeenCalled();

      const habitList = await findByTestId("scrollable-habit-list");
      const [scrollableList] = habitList.children;

      // Fire the onRefresh callback from the RefreshControl
      const { refreshControl } = scrollableList.props;
      if (refreshControl && refreshControl.props.onRefresh) {
        await refreshControl.props.onRefresh();
      }

      await waitFor(() => {
        expect(sync.syncAll).toHaveBeenCalled();
        getByText("Sync complete.");
      });
    });
  });

  describe("Habit Creation", () => {
    test("Can create a new habit", async () => {
      const { getByText, getByLabelText, getByTestId, sync, store } = render(<ScrollableHabitsScreen />);
      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(store.getState().habitsState.habits).toStrictEqual({});

      const newHabitButton = getByTestId("round-button");
      fireEvent.press(newHabitButton);

      getByText(/create new habit/i);

      const habitNameInput = getByLabelText(/habit name/i);
      fireEvent.changeText(habitNameInput, "test scrollable habit");

      const goalInput = getByLabelText(/goal/i);
      fireEvent.changeText(goalInput, "5");

      const saveButton = getByText(/save/i);
      fireEvent.press(saveButton);

      await waitFor(() => {
        const habitsLength = Object.keys(store.getState().habitsState.habits).length;
        expect(habitsLength).toBe(1);
      });
      expect(sync.syncAll).toHaveBeenCalled();
    });

    test("Will show error toast if no title provided", async () => {
      const { getByText, findByText, getByLabelText, getByTestId, sync, store } = render(<ScrollableHabitsScreen />);
      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(store.getState().habitsState.habits).toStrictEqual({});

      const newHabitButton = getByTestId("round-button");
      fireEvent.press(newHabitButton);

      getByText(/create new habit/i);

      const habitNameInput = getByLabelText(/habit name/i);
      fireEvent.changeText(habitNameInput, "");

      const goalInput = getByLabelText(/goal/i);
      fireEvent.changeText(goalInput, "4");

      const saveButton = getByText(/save/i);
      fireEvent.press(saveButton);

      await findByText(/Title is required/i);
      expect(sync.syncAll).not.toHaveBeenCalled();
    });
  });

  describe("Habit Modification", () => {
    test("Can change habit name and goal", async () => {
      const { findByLabelText, getByText, getByLabelText, sync, store } = render(<ScrollableHabitsScreen />);
      store.dispatch(createNewHabit({ title: "yoga", goal: 3 }));

      expect(sync.syncAll).not.toHaveBeenCalled();

      const editHabitButton = await findByLabelText(/configure habit yoga/i);
      fireEvent.press(editHabitButton);

      getByText(/edit habit/i);

      const habitNameInput = await findByLabelText(/change habit name/i);
      expect(habitNameInput.props.defaultValue).toBe("yoga");
      fireEvent.changeText(habitNameInput, "daily yoga");

      const goalInput = getByLabelText(/change goal/i);
      expect(goalInput.props.defaultValue).toBe("3");
      fireEvent.changeText(goalInput, "7");

      const saveButton = getByText(/save/i);
      fireEvent.press(saveButton);

      await waitFor(() => {
        const habits = Object.values(store.getState().habitsState.habits);
        expect(habits.length).toBe(1);

        const [habit] = habits;
        expect(habit.goal).toBe("7");
        expect(habit.title).toBe("daily yoga");
        expect(sync.syncHabit).toHaveBeenCalledWith(habit.id);
      });
    });

    test("Can remove a habit", async () => {
      const { findByLabelText, getByText, sync, store } = render(<ScrollableHabitsScreen />);
      store.dispatch(createNewHabit({ title: "morning jog", goal: 5 }));
      store.dispatch(createNewHabit({ title: "evening stretch", goal: 3 }));
      jest.clearAllMocks();

      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(sync.syncHabit).not.toHaveBeenCalled();

      const [habitBefore1, habitBefore2] = Object.values(store.getState().habitsState.habits);
      expect(habitBefore1.meta.isDeleted).toBe(false);
      expect(habitBefore2.meta.isDeleted).toBe(false);

      const editHabitButton = await findByLabelText(/configure habit morning jog/i);
      fireEvent.press(editHabitButton);

      getByText(/edit habit/i);

      const removeHabit = getByText(/remove/i);
      fireEvent.press(removeHabit);
      pressAlertButton("Yes");

      await waitFor(() => {
        const habitsAfter = Object.values(store.getState().habitsState.habits);
        expect(habitsAfter.length).toBe(2);
        const [habitAfter1, habitAfter2] = habitsAfter;

        expect(habitAfter1.title).toBe("morning jog");
        expect(habitAfter1.meta.isDeleted).toBe(true);
        expect(habitAfter2.title).toBe("evening stretch");
        expect(habitAfter2.meta.isDeleted).toBe(false);

        expect(sync.syncHabit).toHaveBeenCalled();
      });
    });
  });

  describe("Items", () => {
    test("Can change item status when tapping on them", async () => {
      const { findByTestId, sync, store } = render(<ScrollableHabitsScreen />);
      store.dispatch(createNewHabit({ title: "read books", goal: 4 }));
      jest.clearAllMocks();

      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(sync.syncHabit).not.toHaveBeenCalled();

      const [habitBefore] = Object.values(store.getState().habitsState.habits);
      expect(habitBefore.items.length).toBe(0);

      // Get day items from the scrollable habit container
      const getItemContainers = async () => {
        const habitContainer = await findByTestId("scrollable-habit-container");
        return await within(habitContainer).findAllByTestId("scrollable-item-container");
      };

      // Note: In scrollable view, items are ordered by date around today
      // The center items should be around today
      const items = await getItemContainers();
      // Tap any visible item to change status
      const item = items[0];
      fireEvent.press(item);

      await waitFor(() => {
        expect(sync.syncHabit).toHaveBeenCalledWith(habitBefore.id);
      });

      const [habitAfter] = Object.values(store.getState().habitsState.habits);
      expect(habitAfter.items.length).toBeGreaterThan(0);

      // First tap should set status to "done"
      const updatedItem = habitAfter.items[0];
      expect(updatedItem.status).toBe("done");
    });

    test("Can input notes into an item upon a long press", async () => {
      const { findByTestId, getByText, findByLabelText, sync, store } = render(<ScrollableHabitsScreen />);
      store.dispatch(createNewHabit({ title: "journal", goal: 7 }));
      jest.clearAllMocks();

      expect(sync.syncAll).not.toHaveBeenCalled();
      expect(sync.syncHabit).not.toHaveBeenCalled();

      const [habitBefore] = Object.values(store.getState().habitsState.habits);
      expect(habitBefore.items.length).toBe(0);

      const getItemContainers = async () => {
        const habitContainer = await findByTestId("scrollable-habit-container");
        return await within(habitContainer).findAllByTestId("scrollable-item-container");
      };

      const items = await getItemContainers();
      const item = items[0];
      fireEvent(item, "onLongPress");

      const notesInput = await findByLabelText(/change item notes/i);
      expect(notesInput.props.defaultValue).toBe("");
      fireEvent.changeText(notesInput, "Wrote for 30 minutes today");

      const saveButton = getByText(/save/i);
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(sync.syncHabit).toHaveBeenCalledWith(habitBefore.id);
      });

      const [habitAfter] = Object.values(store.getState().habitsState.habits);
      expect(habitAfter.items.length).toBe(1);
      const [itemInState] = habitAfter.items;
      expect(itemInState.notes).toBe("Wrote for 30 minutes today");
    });
  });
});

