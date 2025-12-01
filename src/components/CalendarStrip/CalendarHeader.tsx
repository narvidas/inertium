import format from "date-fns/format";
import getMonth from "date-fns/getMonth";
import getYear from "date-fns/getYear";
import React, { FC, useMemo } from "react";
import { Text, TouchableOpacity } from "react-native";
import { styles } from "./CalendarStrip.styles";
import { CalendarHeaderProps } from "./types";

const HEADER_FORMAT = "MMMM yyyy";

export const CalendarHeader: FC<CalendarHeaderProps> = ({
  datesForWeek,
  style,
  fontSize,
  onPress,
}) => {
  const headerText = useMemo(() => {
    if (!datesForWeek || datesForWeek.length === 0) {
      return "";
    }

    const firstDay = datesForWeek[0];
    const lastDay = datesForWeek[datesForWeek.length - 1];

    // Same month - just show "Month Year"
    if (getMonth(firstDay) === getMonth(lastDay)) {
      return format(firstDay, HEADER_FORMAT);
    }

    // Different years - show "Month Year / Month Year"
    if (getYear(firstDay) !== getYear(lastDay)) {
      return `${format(firstDay, HEADER_FORMAT)} / ${format(lastDay, HEADER_FORMAT)}`;
    }

    // Same year, different months - show "Mon / Month Year"
    return `${format(firstDay, "MMM")} / ${format(lastDay, HEADER_FORMAT)}`;
  }, [datesForWeek]);

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Text style={[styles.calendarHeader, { fontSize }, style]}>
        {headerText}
      </Text>
    </TouchableOpacity>
  );
};

