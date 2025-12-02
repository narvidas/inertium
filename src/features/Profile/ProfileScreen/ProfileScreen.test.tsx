import React from "react";
import { fireEvent, render } from "../../../testing/customRender";
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

  describe("Navigation", () => {
    test("Shows Login option", async () => {
      const { findByText } = render(
        <AnonymousView navigation={mockNavigation as any} />
      );

      await findByText("Login");
    });

    test("Shows Register option", async () => {
      const { findAllByText } = render(
        <AnonymousView navigation={mockNavigation as any} />
      );

      const registerElements = await findAllByText("Register");
      // First is header title, second is the button
      expect(registerElements.length).toBeGreaterThanOrEqual(2);
    });

    test("Shows Forgot Password option", async () => {
      const { findByText } = render(
        <AnonymousView navigation={mockNavigation as any} />
      );

      await findByText("Forgot Password");
    });

    test("Navigates to Login screen when Login is pressed", async () => {
      const { findByText } = render(
        <AnonymousView navigation={mockNavigation as any} />
      );

      const loginOption = await findByText("Login");
      fireEvent.press(loginOption);

      expect(mockNavigation.navigate).toHaveBeenCalledWith("Login");
    });

    test("Navigates to Register screen when Register is pressed", async () => {
      const { findAllByText } = render(
        <AnonymousView navigation={mockNavigation as any} />
      );

      const registerElements = await findAllByText("Register");
      // Second element is the button in the list
      const registerOption = registerElements[1];
      fireEvent.press(registerOption);

      expect(mockNavigation.navigate).toHaveBeenCalledWith("Register");
    });

    test("Navigates to Forgot Password screen when Forgot Password is pressed", async () => {
      const { findByText } = render(
        <AnonymousView navigation={mockNavigation as any} />
      );

      const forgotPasswordOption = await findByText("Forgot Password");
      fireEvent.press(forgotPasswordOption);

      expect(mockNavigation.navigate).toHaveBeenCalledWith("Forgot Password");
    });
  });
});
