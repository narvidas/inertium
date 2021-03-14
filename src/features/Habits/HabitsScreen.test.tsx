import React from "react";
import { render, waitFor, within } from "../../testing/customRender";
import { HabitsScreen } from "./HabitsScreen";

describe("HabitScreen", () => {
  test("Syncs habits", () => {
    const { container, firebaseValues } = render(<HabitsScreen />);
    within(container).getByTestId("root");
    waitFor(() => {
      expect(firebaseValues.db.ref).toHaveBeenCalled();
    });
  });
});
