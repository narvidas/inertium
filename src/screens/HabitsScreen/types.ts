export interface Habit {
  key: string;
  title: string;
  goal: number;
  items: Item[];
  meta?: Meta;
}

export type Status = "default" | "done" | "fail";

export interface Item {
  key: string;
  status: Status;
  date: Date;
  notes?: string;
  meta?: Meta;
}

interface Meta {
  lastUpdate: Date;
}
