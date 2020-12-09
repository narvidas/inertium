export interface Habit {
  id: string;
  title: string;
  goal: number;
  items: Item[];
  meta: Meta;
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
