import format from "date-fns/format";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import startOfWeek from "date-fns/startOfWeek";
import endOfWeek from "date-fns/endOfWeek";
import addDays from "date-fns/addDays";
import isSameMonth from "date-fns/isSameMonth";
import isToday from "date-fns/isToday";
import React, { FC, useMemo } from "react";
import { Text, View } from "react-native";
import { MonthDayCell } from "../MonthDayCell";
import { styles } from "./MonthCalendarGrid.styles";

// Week days header - Monday first (consistent with week view)
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Calendar day structure - just layout info, no item data
interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface Props {
  habitId: string;
  year: number;
  month: number; // 0-indexed (0 = January)
}

const MonthCalendarGridComponent: FC<Props> = ({ habitId, year, month }) => {
  const monthDate = useMemo(() => new Date(year, month, 1), [year, month]);

  // Generate calendar grid layout - no dependency on habit items!
  // This only recalculates when year/month changes
  const calendarDays = useMemo((): CalendarDay[] => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    // Get the start of the week containing the month start (Monday)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    // Get the end of the week containing the month end (Sunday)
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: CalendarDay[] = [];
    let currentDate = calendarStart;

    while (currentDate <= calendarEnd) {
      days.push({
        date: currentDate,
        dayOfMonth: currentDate.getDate(),
        isCurrentMonth: isSameMonth(currentDate, monthDate),
        isToday: isToday(currentDate),
      });

      currentDate = addDays(currentDate, 1);
    }

    return days;
  }, [monthDate]); // Only depends on monthDate, NOT on habit!

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
        {calendarDays.map((day) => (
          <MonthDayCell
            key={day.date.toISOString()}
            habitId={habitId}
            date={day.date}
            dayOfMonth={day.dayOfMonth}
            isCurrentMonth={day.isCurrentMonth}
            isToday={day.isToday}
          />
        ))}
      </View>
    </View>
  );
};

export const MonthCalendarGrid = React.memo(MonthCalendarGridComponent);
MonthCalendarGrid.displayName = "MonthCalendarGrid";

