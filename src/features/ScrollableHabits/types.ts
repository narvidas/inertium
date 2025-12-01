import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from "react-native";

// Re-export habit types for convenience
export type { Habit, Item, Status, Meta } from "../Habits/types";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ScrollSyncContextValue {
  /** The current scroll offset in pixels */
  scrollX: number;
  /** Update the scroll position - called during scroll (doesn't sync others) */
  setScrollX: (x: number, sourceId?: string) => void;
  /** Called when any scroll view starts scrolling */
  onScrollBegin: (viewId: string) => void;
  /** Called when any scroll view ends scrolling - triggers sync to other views */
  onScrollEnd: (viewId: string) => void;
  /** The ID of the currently active (scrolling) view */
  activeScrollViewId: string | null;
  /** Whether any scroll view is currently being scrolled (for blur effect) */
  isScrolling: boolean;
  /** The size of each day cell */
  dayWidth: number;
  /** Number of days to buffer on each side for smooth scrolling */
  bufferDays: number;
  /** The center date (today at initialization) */
  centerDate: Date;
  /** The currently visible month (e.g., "January 2024") - updates on scroll end */
  visibleMonth: string;
  /** Scroll all views to a specific date with animation */
  scrollToDate: (date: Date) => void;
  /** Scroll all views to this week's Monday with animation */
  scrollToThisWeek: () => void;
}

export interface ScrollableListRef {
  scrollToOffset: (offset: number, animated?: boolean) => void;
}

export interface DayItemData {
  date: Date;
  isToday: boolean;
  dateKey: string; // ISO string for stable keys
}

export interface HabitDayItemData extends DayItemData {
  habitId: string;
  item: import("../Habits/types").Item;
}
