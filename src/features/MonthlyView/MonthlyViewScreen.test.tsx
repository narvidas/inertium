import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { render as rtlRender, fireEvent, waitFor } from "@testing-library/react-native";
import format from "date-fns/format";
import React from "react";
import { Provider } from "react-redux";
import FirebaseContext from "../../config/remote/firebaseContext";
import SyncContext from "../../config/remote/syncContext";
import { getStore } from "../../config/rtk/store";
import firebaseMock from "../../testing/firebaseMock";
import { getSyncMock } from "../../testing/syncMock";
import { createNewHabit } from "../Habits/habits.slice";
import { MonthlyViewScreen } from "./MonthlyViewScreen";

// Suppress console warnings/errors in tests
console.warn = () => { };
console.error = () => { };

// Create a test wrapper with navigation and all providers
const Stack = createNativeStackNavigator();

const createTestWrapper = (habitId: string, habitTitle: string) => {
  const store = getStore();
  const sync = getSyncMock();
  const firebaseValues = {
    auth: firebaseMock.auth,
    db: firebaseMock.database,
    updateStoredCurrentUser: jest.fn(),
  };

  const TestComponent = () => (
    <NavigationContainer>
      <FirebaseContext.Provider value={firebaseValues}>
        <SyncContext.Provider value={sync}>
          <Provider store={store}>
            <Stack.Navigator>
              <Stack.Screen
                name="MonthlyView"
                component={MonthlyViewScreen}
                initialParams={{ habitId, habitTitle }}
              />
            </Stack.Navigator>
          </Provider>
        </SyncContext.Provider>
      </FirebaseContext.Provider>
    </NavigationContainer>
  );

  return { TestComponent, store, sync };
};

describe("MonthlyViewScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    test("Renders the monthly view root container", async () => {
      const store = getStore();
      store.dispatch(createNewHabit({ title: "Test Habit", goal: 5 }));
      const habit = Object.values(store.getState().habitsState.habits)[0];

      const { TestComponent } = createTestWrapper(habit.id, "Test Habit");
      // Manually update the store in TestComponent's provider
      const sync = getSyncMock();
      const firebaseValues = {
        auth: firebaseMock.auth,
        db: firebaseMock.database,
        updateStoredCurrentUser: jest.fn(),
      };

      const { findByTestId } = rtlRender(
        <NavigationContainer>
          <FirebaseContext.Provider value={firebaseValues}>
            <SyncContext.Provider value={sync}>
              <Provider store={store}>
                <Stack.Navigator>
                  <Stack.Screen
                    name="MonthlyView"
                    component={MonthlyViewScreen}
                    initialParams={{ habitId: habit.id, habitTitle: "Test Habit" }}
                  />
                </Stack.Navigator>
              </Provider>
            </SyncContext.Provider>
          </FirebaseContext.Provider>
        </NavigationContainer>
      );

      await findByTestId("monthly-view-root");
    });

    test("Renders the current month header", async () => {
      const store = getStore();
      store.dispatch(createNewHabit({ title: "Test Habit", goal: 5 }));
      const habit = Object.values(store.getState().habitsState.habits)[0];

      const sync = getSyncMock();
      const firebaseValues = {
        auth: firebaseMock.auth,
        db: firebaseMock.database,
        updateStoredCurrentUser: jest.fn(),
      };

      const { findByText } = rtlRender(
        <NavigationContainer>
          <FirebaseContext.Provider value={firebaseValues}>
            <SyncContext.Provider value={sync}>
              <Provider store={store}>
                <Stack.Navigator>
                  <Stack.Screen
                    name="MonthlyView"
                    component={MonthlyViewScreen}
                    initialParams={{ habitId: habit.id, habitTitle: "Test Habit" }}
                  />
                </Stack.Navigator>
              </Provider>
            </SyncContext.Provider>
          </FirebaseContext.Provider>
        </NavigationContainer>
      );

      // Should show current month and year
      const expectedHeader = format(new Date(), "MMMM yyyy");
      await findByText(expectedHeader);
    });

    test("Renders week day labels in the calendar grid", async () => {
      const store = getStore();
      store.dispatch(createNewHabit({ title: "Test Habit", goal: 5 }));
      const habit = Object.values(store.getState().habitsState.habits)[0];

      const sync = getSyncMock();
      const firebaseValues = {
        auth: firebaseMock.auth,
        db: firebaseMock.database,
        updateStoredCurrentUser: jest.fn(),
      };

      const { findAllByTestId, findAllByText } = rtlRender(
        <NavigationContainer>
          <FirebaseContext.Provider value={firebaseValues}>
            <SyncContext.Provider value={sync}>
              <Provider store={store}>
                <Stack.Navigator>
                  <Stack.Screen
                    name="MonthlyView"
                    component={MonthlyViewScreen}
                    initialParams={{ habitId: habit.id, habitTitle: "Test Habit" }}
                  />
                </Stack.Navigator>
              </Provider>
            </SyncContext.Provider>
          </FirebaseContext.Provider>
        </NavigationContainer>
      );

      // Wait for at least one calendar grid to render
      const grids = await findAllByTestId("month-calendar-grid");
      expect(grids.length).toBeGreaterThan(0);

      // Should show Mon-Sun week day labels (may appear multiple times across months)
      const monLabels = await findAllByText("Mon");
      expect(monLabels.length).toBeGreaterThan(0);

      const sunLabels = await findAllByText("Sun");
      expect(sunLabels.length).toBeGreaterThan(0);
    });

    test("Renders day cells in the calendar grid", async () => {
      const store = getStore();
      store.dispatch(createNewHabit({ title: "Test Habit", goal: 5 }));
      const habit = Object.values(store.getState().habitsState.habits)[0];

      const sync = getSyncMock();
      const firebaseValues = {
        auth: firebaseMock.auth,
        db: firebaseMock.database,
        updateStoredCurrentUser: jest.fn(),
      };

      const { findAllByTestId } = rtlRender(
        <NavigationContainer>
          <FirebaseContext.Provider value={firebaseValues}>
            <SyncContext.Provider value={sync}>
              <Provider store={store}>
                <Stack.Navigator>
                  <Stack.Screen
                    name="MonthlyView"
                    component={MonthlyViewScreen}
                    initialParams={{ habitId: habit.id, habitTitle: "Test Habit" }}
                  />
                </Stack.Navigator>
              </Provider>
            </SyncContext.Provider>
          </FirebaseContext.Provider>
        </NavigationContainer>
      );

      // Should find day cells in the grid
      const dayCells = await findAllByTestId("month-day-cell");
      // A month grid typically has 28-42 days (depending on month and start day)
      expect(dayCells.length).toBeGreaterThanOrEqual(28);
    });
  });

  describe("Sync Operations", () => {
    test("Triggers sync when swiping down", async () => {
      const store = getStore();
      store.dispatch(createNewHabit({ title: "Test Habit", goal: 5 }));
      const habit = Object.values(store.getState().habitsState.habits)[0];

      const sync = getSyncMock();
      const firebaseValues = {
        auth: firebaseMock.auth,
        db: firebaseMock.database,
        updateStoredCurrentUser: jest.fn(),
      };

      const { findByTestId, getByText } = rtlRender(
        <NavigationContainer>
          <FirebaseContext.Provider value={firebaseValues}>
            <SyncContext.Provider value={sync}>
              <Provider store={store}>
                <Stack.Navigator>
                  <Stack.Screen
                    name="MonthlyView"
                    component={MonthlyViewScreen}
                    initialParams={{ habitId: habit.id, habitTitle: "Test Habit" }}
                  />
                </Stack.Navigator>
              </Provider>
            </SyncContext.Provider>
          </FirebaseContext.Provider>
        </NavigationContainer>
      );

      await findByTestId("monthly-view-root");
      jest.clearAllMocks();
      expect(sync.syncHabit).not.toHaveBeenCalled();

      const monthsList = await findByTestId("monthly-view-list");
      const [scrollableList] = monthsList.children;

      // Fire the onRefresh callback from the RefreshControl
      const { refreshControl } = scrollableList.props;
      if (refreshControl && refreshControl.props.onRefresh) {
        await refreshControl.props.onRefresh();
      }

      await waitFor(() => {
        expect(sync.syncHabit).toHaveBeenCalledWith(habit.id);
        getByText("Sync complete.");
      });
    });
  });

  describe("Items", () => {
    test("Can change item status when tapping on a day cell", async () => {
      const store = getStore();
      store.dispatch(createNewHabit({ title: "Test Habit", goal: 5 }));
      const habit = Object.values(store.getState().habitsState.habits)[0];

      const sync = getSyncMock();
      const firebaseValues = {
        auth: firebaseMock.auth,
        db: firebaseMock.database,
        updateStoredCurrentUser: jest.fn(),
      };

      const { findAllByTestId } = rtlRender(
        <NavigationContainer>
          <FirebaseContext.Provider value={firebaseValues}>
            <SyncContext.Provider value={sync}>
              <Provider store={store}>
                <Stack.Navigator>
                  <Stack.Screen
                    name="MonthlyView"
                    component={MonthlyViewScreen}
                    initialParams={{ habitId: habit.id, habitTitle: "Test Habit" }}
                  />
                </Stack.Navigator>
              </Provider>
            </SyncContext.Provider>
          </FirebaseContext.Provider>
        </NavigationContainer>
      );

      jest.clearAllMocks();
      expect(sync.syncHabit).not.toHaveBeenCalled();

      const [habitBefore] = Object.values(store.getState().habitsState.habits);
      expect(habitBefore.items.length).toBe(0);

      // Get day cells and tap one
      const dayCells = await findAllByTestId("month-day-cell");
      const dayCell = dayCells[7]; // Pick a cell that should be in current month
      fireEvent.press(dayCell);

      await waitFor(() => {
        const [habitAfter] = Object.values(store.getState().habitsState.habits);
        expect(habitAfter.items.length).toBeGreaterThan(0);

        // First tap should set status to "done"
        const updatedItem = habitAfter.items[0];
        expect(updatedItem.status).toBe("done");
      });
    });

    test("Can input notes into an item upon a long press", async () => {
      const store = getStore();
      store.dispatch(createNewHabit({ title: "Test Habit", goal: 5 }));
      const habit = Object.values(store.getState().habitsState.habits)[0];

      const sync = getSyncMock();
      const firebaseValues = {
        auth: firebaseMock.auth,
        db: firebaseMock.database,
        updateStoredCurrentUser: jest.fn(),
      };

      const { findAllByTestId, findByLabelText, getByText } = rtlRender(
        <NavigationContainer>
          <FirebaseContext.Provider value={firebaseValues}>
            <SyncContext.Provider value={sync}>
              <Provider store={store}>
                <Stack.Navigator>
                  <Stack.Screen
                    name="MonthlyView"
                    component={MonthlyViewScreen}
                    initialParams={{ habitId: habit.id, habitTitle: "Test Habit" }}
                  />
                </Stack.Navigator>
              </Provider>
            </SyncContext.Provider>
          </FirebaseContext.Provider>
        </NavigationContainer>
      );

      jest.clearAllMocks();
      expect(sync.syncHabit).not.toHaveBeenCalled();

      const [habitBefore] = Object.values(store.getState().habitsState.habits);
      expect(habitBefore.items.length).toBe(0);

      // Get day cells and long press one
      const dayCells = await findAllByTestId("month-day-cell");
      const dayCell = dayCells[10]; // Pick a cell that should be in current month
      fireEvent(dayCell, "onLongPress");

      const notesInput = await findByLabelText(/change item notes/i);
      expect(notesInput.props.defaultValue).toBe("");
      fireEvent.changeText(notesInput, "Monthly view note test");

      const saveButton = getByText(/save/i);
      fireEvent.press(saveButton);

      await waitFor(() => {
        const [habitAfter] = Object.values(store.getState().habitsState.habits);
        expect(habitAfter.items.length).toBe(1);
        const [itemInState] = habitAfter.items;
        expect(itemInState.notes).toBe("Monthly view note test");
      });
    });

    test("Status cycles through default -> done -> fail -> default", async () => {
      const store = getStore();
      store.dispatch(createNewHabit({ title: "Test Habit", goal: 5 }));
      const habit = Object.values(store.getState().habitsState.habits)[0];

      const sync = getSyncMock();
      const firebaseValues = {
        auth: firebaseMock.auth,
        db: firebaseMock.database,
        updateStoredCurrentUser: jest.fn(),
      };

      const { findAllByTestId } = rtlRender(
        <NavigationContainer>
          <FirebaseContext.Provider value={firebaseValues}>
            <SyncContext.Provider value={sync}>
              <Provider store={store}>
                <Stack.Navigator>
                  <Stack.Screen
                    name="MonthlyView"
                    component={MonthlyViewScreen}
                    initialParams={{ habitId: habit.id, habitTitle: "Test Habit" }}
                  />
                </Stack.Navigator>
              </Provider>
            </SyncContext.Provider>
          </FirebaseContext.Provider>
        </NavigationContainer>
      );

      // Get day cells and tap one multiple times
      const dayCells = await findAllByTestId("month-day-cell");
      const dayCell = dayCells[14]; // Pick a cell that should be in current month

      // First tap: default -> done
      fireEvent.press(dayCell);
      await waitFor(() => {
        const habitState = Object.values(store.getState().habitsState.habits)[0];
        const item = habitState.items[0];
        expect(item.status).toBe("done");
      });

      // Second tap: done -> fail
      fireEvent.press(dayCell);
      await waitFor(() => {
        const habitState = Object.values(store.getState().habitsState.habits)[0];
        const item = habitState.items[0];
        expect(item.status).toBe("fail");
      });

      // Third tap: fail -> default
      fireEvent.press(dayCell);
      await waitFor(() => {
        const habitState = Object.values(store.getState().habitsState.habits)[0];
        const item = habitState.items[0];
        expect(item.status).toBe("default");
      });
    });
  });

  describe("Multiple Months", () => {
    test("Initially shows multiple months (current and previous)", async () => {
      const store = getStore();
      store.dispatch(createNewHabit({ title: "Test Habit", goal: 5 }));
      const habit = Object.values(store.getState().habitsState.habits)[0];

      const sync = getSyncMock();
      const firebaseValues = {
        auth: firebaseMock.auth,
        db: firebaseMock.database,
        updateStoredCurrentUser: jest.fn(),
      };

      const { findAllByTestId } = rtlRender(
        <NavigationContainer>
          <FirebaseContext.Provider value={firebaseValues}>
            <SyncContext.Provider value={sync}>
              <Provider store={store}>
                <Stack.Navigator>
                  <Stack.Screen
                    name="MonthlyView"
                    component={MonthlyViewScreen}
                    initialParams={{ habitId: habit.id, habitTitle: "Test Habit" }}
                  />
                </Stack.Navigator>
              </Provider>
            </SyncContext.Provider>
          </FirebaseContext.Provider>
        </NavigationContainer>
      );

      // Should find multiple month grids
      const monthGrids = await findAllByTestId("month-calendar-grid");
      expect(monthGrids.length).toBeGreaterThan(1);
    });
  });
});
