import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from "react-native";

// ============================================
// Core Habit Types (migrated from Habits/)
// ============================================

export interface Habit {
  id: string;
  title: string;
  goal: number;
  items: Item[];
  meta: Meta;
  /** Optional markdown template pre-populated for new item notes */
  noteTemplate?: string;
}

export type Habits = { [key: string]: Habit };

export type Status = "default" | "done" | "fail";

export interface Item {
  id: string;
  status: Status;
  date: string;
  notes: string;
  meta: Meta;
}

export interface Meta {
  isDeleted: boolean;
  createdOn: string;
  lastUpdatedOn: string;
}

export interface HabitOrder {
  order: Array<string>;
  meta: Meta;
}

// ============================================
// Scrollable Habits Types
// ============================================

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

// ============================================
// Navigation Types
// ============================================

export type HabitsStackParamList = {
  HabitsList: undefined;
  MonthlyView: {
    habitId: string;
    habitTitle: string;
  };
};
