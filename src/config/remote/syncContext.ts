import React from "react";

export interface SyncContextValues {
  syncAll: () => Promise<void>;
  syncHabitOrder: () => Promise<void>;
  syncHabit: (habitId: string) => Promise<void>;
  syncHabits: () => Promise<void>;
}

const SyncContext = React.createContext<Partial<SyncContextValues>>({});

export default SyncContext;
