import { Item } from "../Habits/types";

export interface MonthData {
  year: number;
  month: number; // 0-indexed (0 = January)
  days: MonthDayData[];
}

export interface MonthDayData {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  item: Item | null; // null for days outside current month or without habit data
}

export type MonthlyViewRouteParams = {
  MonthlyView: {
    habitId: string;
    habitTitle: string;
  };
};
