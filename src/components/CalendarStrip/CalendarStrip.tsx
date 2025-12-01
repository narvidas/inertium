import addDays from "date-fns/addDays";
import addWeeks from "date-fns/addWeeks";
import isToday from "date-fns/isToday";
import startOfISOWeek from "date-fns/startOfISOWeek";
import subWeeks from "date-fns/subWeeks";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { LayoutChangeEvent, View } from "react-native";
import { CalendarDay } from "./CalendarDay";
import { CalendarHeader } from "./CalendarHeader";
import { styles } from "./CalendarStrip.styles";
import { CalendarStripProps, CalendarStripRef } from "./types";
import { WeekSelector } from "./WeekSelector";

const DAYS_IN_WEEK = 7;
const DEFAULT_MAX_DAY_SIZE = 80;
const DEFAULT_MIN_DAY_SIZE = 10;

export const CalendarStrip = forwardRef<CalendarStripRef, CalendarStripProps>(
  (
    {
      onWeekChanged,
      onToday,
      daySelectionAnimation,
      highlightDateNumberStyle,
      calendarHeaderStyle,
      iconContainer,
      style,
    },
    ref
  ) => {
    // State: the Monday of the current week
    const [startingDate, setStartingDate] = useState<Date>(() =>
      startOfISOWeek(new Date())
    );

    // Responsive sizing state
    const [dayComponentWidth, setDayComponentWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [monthFontSize, setMonthFontSize] = useState(0);
    const [selectorSize, setSelectorSize] = useState(0);

    // Calculate dates for the current week
    const datesForWeek = useMemo(() => {
      const dates: Date[] = [];
      for (let i = 0; i < DAYS_IN_WEEK; i++) {
        dates.push(addDays(startingDate, i));
      }
      return dates;
    }, [startingDate]);

    // Navigate to previous week
    const getPreviousWeek = useCallback(() => {
      const previousWeekStart = subWeeks(startingDate, 1);
      setStartingDate(previousWeekStart);
      onWeekChanged?.(previousWeekStart);
    }, [startingDate, onWeekChanged]);

    // Navigate to next week
    const getNextWeek = useCallback(() => {
      const nextWeekStart = addWeeks(startingDate, 1);
      setStartingDate(nextWeekStart);
      onWeekChanged?.(nextWeekStart);
    }, [startingDate, onWeekChanged]);

    // Reset to current week
    const resetWeekToCurrent = useCallback(() => {
      const todayWeekStart = startOfISOWeek(new Date());
      setStartingDate(todayWeekStart);
      onWeekChanged?.(todayWeekStart);
      onToday?.();
    }, [onWeekChanged, onToday]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        getNextWeek,
        getPreviousWeek,
      }),
      [getNextWeek, getPreviousWeek]
    );

    // Responsive sizing based on container width
    const onLayout = useCallback((event: LayoutChangeEvent) => {
      const containerWidth = event.nativeEvent.layout.width;
      // Total elements: 7 days + 2 selectors = 9
      const numElements = DAYS_IN_WEEK + 2;

      let dayWidth = containerWidth / numElements;
      dayWidth = Math.min(dayWidth, DEFAULT_MAX_DAY_SIZE);
      dayWidth = Math.max(dayWidth, DEFAULT_MIN_DAY_SIZE);

      const fontSize = Math.round(dayWidth / 3.2);
      const arrowSize = Math.round(dayWidth / 2.5);
      const totalHeight = fontSize + dayWidth; // Header height + day component height

      setDayComponentWidth(dayWidth);
      setMonthFontSize(fontSize);
      setSelectorSize(Math.min(arrowSize, totalHeight));
      setHeight(totalHeight);
    }, []);

    return (
      <View style={[styles.calendarContainer, style]}>
        <View
          style={[styles.innerContainer, { height }]}
          onLayout={onLayout}
        >
          {/* Month/Year Header */}
          <CalendarHeader
            datesForWeek={datesForWeek}
            style={calendarHeaderStyle}
            fontSize={monthFontSize}
            onPress={resetWeekToCurrent}
          />

          {/* Days row with navigation arrows */}
          <View style={styles.datesStrip}>
            <WeekSelector
              direction="left"
              onPress={getPreviousWeek}
              iconContainerStyle={iconContainer}
              size={selectorSize}
            />

            <View style={styles.calendarDates}>
              {datesForWeek.map((date, index) => (
                <View key={index} style={{ flex: 1 }}>
                  <CalendarDay
                    date={date}
                    isToday={isToday(date)}
                    daySelectionAnimation={daySelectionAnimation}
                    highlightDateNumberStyle={highlightDateNumberStyle}
                    size={dayComponentWidth}
                  />
                </View>
              ))}
            </View>

            <WeekSelector
              direction="right"
              onPress={getNextWeek}
              iconContainerStyle={iconContainer}
              size={selectorSize}
            />
          </View>
        </View>
      </View>
    );
  }
);

CalendarStrip.displayName = "CalendarStrip";

