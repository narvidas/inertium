import addWeeks from "date-fns/addWeeks";
import startOfISOWeek from "date-fns/startOfISOWeek";
import subWeeks from "date-fns/subWeeks";
import React, { createRef } from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { CalendarStrip } from "./CalendarStrip";
import { CalendarStripRef } from "./types";
import { act } from "react-test-renderer";

describe("CalendarStrip", () => {
  const today = new Date();
  const mondayOfCurrentWeek = startOfISOWeek(today);

  it("renders the current week days", () => {
    const { getByText } = render(<CalendarStrip />);

    expect(getByText("MON")).toBeTruthy();
    expect(getByText("TUE")).toBeTruthy();
    expect(getByText("WED")).toBeTruthy();
    expect(getByText("THU")).toBeTruthy();
    expect(getByText("FRI")).toBeTruthy();
    expect(getByText("SAT")).toBeTruthy();
    expect(getByText("SUN")).toBeTruthy();
  });

  it("renders the month header", () => {
    const { getByText } = render(<CalendarStrip />);

    const monthName = mondayOfCurrentWeek.toLocaleDateString("en-US", { month: "long" });
    expect(getByText(new RegExp(monthName))).toBeTruthy();
  });

  it("exposes navigation methods via ref", () => {
    const ref = createRef<CalendarStripRef>();
    render(<CalendarStrip ref={ref} />);

    expect(ref.current).toBeTruthy();
    expect(typeof ref.current?.getNextWeek).toBe("function");
    expect(typeof ref.current?.getPreviousWeek).toBe("function");
  });

  it("calls onWeekChanged when navigating to previous week", () => {
    const onWeekChanged = jest.fn();
    const ref = createRef<CalendarStripRef>();

    render(<CalendarStrip ref={ref} onWeekChanged={onWeekChanged} />);

    act(() => {
      ref.current?.getPreviousWeek();
    });

    expect(onWeekChanged).toHaveBeenCalledWith(subWeeks(mondayOfCurrentWeek, 1));
  });

  it("calls onWeekChanged when navigating to next week", () => {
    const onWeekChanged = jest.fn();
    const ref = createRef<CalendarStripRef>();

    render(<CalendarStrip ref={ref} onWeekChanged={onWeekChanged} />);

    act(() => {
      ref.current?.getNextWeek();
    });

    expect(onWeekChanged).toHaveBeenCalledWith(addWeeks(mondayOfCurrentWeek, 1));
  });

  it("calls onToday when header is pressed", () => {
    const onToday = jest.fn();
    const ref = createRef<CalendarStripRef>();

    const { getByText } = render(
      <CalendarStrip ref={ref} onToday={onToday} />
    );

    // Navigate away first
    act(() => {
      ref.current?.getNextWeek();
    });

    // Press header to return to today
    const monthName = mondayOfCurrentWeek.toLocaleDateString("en-US", { month: "long" });
    fireEvent.press(getByText(new RegExp(monthName)));

    expect(onToday).toHaveBeenCalled();
  });

  it("renders with styling props without crashing", () => {
    const { getByText } = render(
      <CalendarStrip
        daySelectionAnimation={{
          type: "border",
          duration: 100,
          borderWidth: 1,
          borderHighlightColor: "rgba(0,0,0,0.8)",
        }}
        style={{ height: 100, paddingTop: 20 }}
        calendarHeaderStyle={{ paddingBottom: 15 }}
        highlightDateNumberStyle={{ textDecorationLine: "underline" }}
        iconContainer={{ width: 40 }}
      />
    );

    expect(getByText("MON")).toBeTruthy();
  });
});
