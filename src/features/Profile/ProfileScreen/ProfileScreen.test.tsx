import React from "react";
import { fireEvent, render, waitFor } from "../../../testing/customRender";
import { AnonymousView } from "./AnonymousView";

// Suppress console warnings/errors in tests
console.warn = () => { };
console.error = () => { };

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

describe("ProfileScreen - AnonymousView", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Scrollable View Toggle", () => {
    test("Shows Scrollable Habits View toggle option", async () => {
      const { findByText } = render(
        <AnonymousView navigation={mockNavigation as any} />
      );

      await findByText("Scrollable Habits View");
    });

    test("Can toggle the scrollable habits view setting on", async () => {
      const { findByText, store } = render(
        <AnonymousView navigation={mockNavigation as any} />
      );

      // Initially should be false
      expect(store.getState().settings.useScrollableView).toBe(false);

      // Find and press the toggle
      const toggleText = await findByText("Scrollable Habits View");
      fireEvent.press(toggleText);

      // Should now be true
      await waitFor(() => {
        expect(store.getState().settings.useScrollableView).toBe(true);
      });
    });

    test("Can toggle the scrollable habits view setting off after being on", async () => {
      const { findByText, store } = render(
        <AnonymousView navigation={mockNavigation as any} />
      );

      // Initially false
      expect(store.getState().settings.useScrollableView).toBe(false);

      // Toggle on
      const toggleText = await findByText("Scrollable Habits View");
      fireEvent.press(toggleText);

      await waitFor(() => {
        expect(store.getState().settings.useScrollableView).toBe(true);
      });

      // Toggle off
      fireEvent.press(toggleText);

      await waitFor(() => {
        expect(store.getState().settings.useScrollableView).toBe(false);
      });
    });

    test("Toggle cycles correctly: false -> true -> false -> true", async () => {
      const { findByText, store } = render(
        <AnonymousView navigation={mockNavigation as any} />
      );

      const toggleText = await findByText("Scrollable Habits View");

      // Initial state
      expect(store.getState().settings.useScrollableView).toBe(false);

      // First toggle: false -> true
      fireEvent.press(toggleText);
      await waitFor(() => {
        expect(store.getState().settings.useScrollableView).toBe(true);
      });

      // Second toggle: true -> false
      fireEvent.press(toggleText);
      await waitFor(() => {
        expect(store.getState().settings.useScrollableView).toBe(false);
      });

      // Third toggle: false -> true
      fireEvent.press(toggleText);
      await waitFor(() => {
        expect(store.getState().settings.useScrollableView).toBe(true);
      });
    });
  });
});
