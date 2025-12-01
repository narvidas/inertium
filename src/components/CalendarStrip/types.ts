import { ViewStyle, TextStyle } from "react-native";

export interface DaySelectionAnimation {
  type: "border" | "background";
  duration: number;
  borderWidth?: number;
  borderHighlightColor?: string;
  highlightColor?: string;
}

export interface CalendarStripRef {
  getNextWeek: () => void;
  getPreviousWeek: () => void;
}

export interface CalendarStripProps {
  /** Callback when the week changes. Receives the Monday of the new week. */
  onWeekChanged?: (startOfWeek: Date) => void;
  /** Callback when the header is pressed to return to today. */
  onToday?: () => void;
  /** If false, selecting a date won't auto-change the week. Default: true */
  updateWeek?: boolean;
  /** Animation config for the selected/today indicator */
  daySelectionAnimation?: DaySelectionAnimation;
  /** Disable weekend styling. Default: true */
  styleWeekend?: boolean;
  /** Style for the highlighted (today) date number */
  highlightDateNumberStyle?: TextStyle;
  /** Style for the calendar header (month/year) */
  calendarHeaderStyle?: TextStyle;
  /** Style for the icon (arrow) container */
  iconContainer?: ViewStyle;
  /** Overall container style */
  style?: ViewStyle;
}

export interface CalendarDayProps {
  date: Date;
  isToday: boolean;
  daySelectionAnimation?: DaySelectionAnimation;
  highlightDateNumberStyle?: TextStyle;
  size: number;
}

export interface CalendarHeaderProps {
  datesForWeek: Date[];
  style?: TextStyle;
  fontSize: number;
  onPress?: () => void;
}

export interface WeekSelectorProps {
  direction: "left" | "right";
  onPress: () => void;
  iconContainerStyle?: ViewStyle;
  size: number;
}

