import format from "date-fns/format";
import getDate from "date-fns/getDate";
import React, { FC, useMemo } from "react";
import { Text, View, ViewStyle } from "react-native";
import { styles } from "./CalendarStrip.styles";
import { CalendarDayProps } from "./types";

export const CalendarDay: FC<CalendarDayProps> = ({
  date,
  isToday,
  daySelectionAnimation,
  highlightDateNumberStyle,
  size,
}) => {
  const sizes = useMemo(() => ({
    containerSize: Math.round(size),
    containerPadding: Math.round(size / 5),
    containerBorderRadius: Math.round(size / 2),
    dateNameFontSize: Math.round(size / 5),
    dateNumberFontSize: Math.round(size / 2.9),
  }), [size]);

  // Calculate the selection style for today
  const dateViewStyle = useMemo((): ViewStyle => {
    if (!isToday || !daySelectionAnimation) {
      return {};
    }

    switch (daySelectionAnimation.type) {
      case "background":
        return {
          backgroundColor: daySelectionAnimation.highlightColor ?? "yellow",
        };
      case "border":
        return {
          borderColor: daySelectionAnimation.borderHighlightColor ?? "black",
          borderWidth: daySelectionAnimation.borderWidth ?? 1,
        };
      default:
        return {};
    }
  }, [isToday, daySelectionAnimation]);

  const responsiveDateContainerStyle: ViewStyle = {
    width: sizes.containerSize,
    height: sizes.containerSize,
    borderRadius: sizes.containerBorderRadius,
    padding: sizes.containerPadding,
  };

  const dateNumberStyle = isToday
    ? [styles.dateNumber, { fontSize: sizes.dateNumberFontSize }, highlightDateNumberStyle]
    : [styles.dateNumber, { fontSize: sizes.dateNumberFontSize }];

  return (
    <View
      style={[
        styles.dateContainer,
        responsiveDateContainerStyle,
        dateViewStyle,
      ]}
    >
      <Text style={[styles.dateName, { fontSize: sizes.dateNameFontSize }]}>
        {format(date, "EEE").toUpperCase()}
      </Text>
      <Text style={dateNumberStyle}>
        {getDate(date)}
      </Text>
    </View>
  );
};

