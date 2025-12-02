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
      const { findByText } = render(
        <AnonymousView navigation={mockNavigation as any} />
      );

      await findByText("Register");
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
      const { findByText } = render(
        <AnonymousView navigation={mockNavigation as any} />
      );

      const registerOption = await findByText("Register");
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
