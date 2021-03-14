import { Sync } from "../config/remote/sync";

export const getSyncMock = () => {
  const syncMock: Sync = {
    syncAll: jest.fn(),
    syncHabitOrder: jest.fn(),
    syncHabit: jest.fn(),
    syncHabits: jest.fn(),
  };
  return syncMock;
};
