import format from "date-fns/format";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import startOfWeek from "date-fns/startOfWeek";
import endOfWeek from "date-fns/endOfWeek";
import addDays from "date-fns/addDays";
import isSameMonth from "date-fns/isSameMonth";
import isSameDay from "date-fns/isSameDay";
import isToday from "date-fns/isToday";
import parseISO from "date-fns/parseISO";
import formatISO from "date-fns/formatISO";
import React, { FC, useMemo } from "react";
import { Text, View } from "react-native";
import { Habit, Item } from "../../../Habits/types";
import { generatePushID } from "../../../../utils/generatePushID";
import { MonthDayData } from "../../types";
import { MonthDayCell } from "../MonthDayCell";
import { styles } from "./MonthCalendarGrid.styles";

// Week days header - Monday first (consistent with week view)
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Create an unrecorded item for a date
const createUnrecordedItem = (date: Date): Item => ({
  id: generatePushID(),
  date: formatISO(date),
  notes: "",
  status: "default",
  meta: {
    isDeleted: false,
    lastUpdatedOn: formatISO(new Date()),
    createdOn: formatISO(new Date()),
  },
});

// Find existing item for a date or create a new one
const getItemForDate = (habit: Habit, date: Date): Item => {
  const existing = habit.items.find((item) =>
    isSameDay(parseISO(item.date), date)
  );
  return existing || createUnrecordedItem(date);
};

interface Props {
  habit: Habit;
  year: number;
  month: number; // 0-indexed (0 = January)
}

export const MonthCalendarGrid: FC<Props> = ({ habit, year, month }) => {
  const monthDate = useMemo(() => new Date(year, month, 1), [year, month]);

  // Generate calendar grid data
  const calendarDays = useMemo((): MonthDayData[] => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    // Get the start of the week containing the month start (Monday)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    // Get the end of the week containing the month end (Sunday)
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: MonthDayData[] = [];
    let currentDate = calendarStart;

    while (currentDate <= calendarEnd) {
      const isCurrentMonth = isSameMonth(currentDate, monthDate);
      const item = isCurrentMonth ? getItemForDate(habit, currentDate) : null;

      days.push({
        date: currentDate,
        dayOfMonth: currentDate.getDate(),
        isCurrentMonth,
        isToday: isToday(currentDate),
        item,
      });

      currentDate = addDays(currentDate, 1);
    }

    return days;
  }, [monthDate, habit]);

  const monthLabel = format(monthDate, "MMMM yyyy");

  return (
    <View style={styles.container} testID="month-calendar-grid">
      <View style={styles.monthHeader}>
        <Text style={styles.monthHeaderText}>{monthLabel}</Text>
      </View>
      <View style={styles.weekDaysHeader}>
        {WEEK_DAYS.map((day) => (
          <Text key={day} style={styles.weekDayLabel}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {calendarDays.map((dayData, index) => (
          <MonthDayCell
            key={`${dayData.date.toISOString()}-${index}`}
            habitId={habit.id}
            dayData={dayData}
          />
        ))}
      </View>
    </View>
  );
};

MonthCalendarGrid.displayName = "MonthCalendarGrid";

