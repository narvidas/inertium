export interface Habit {
  id: string;
  title: string;
  goal: number;
  items: Item[];
  meta: Meta;
}

export type Status = "default" | "done" | "fail";

export interface Item {
  id: string;
  status: Status;
  date: string;
  notes?: string;
  meta: Meta;
}

export interface Meta {
  isDeleted: boolean;
  createdOn: string;
  lastUpdatedOn: string;
}
