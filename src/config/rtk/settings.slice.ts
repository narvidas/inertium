import { createSlice } from "@reduxjs/toolkit";

// Settings slice - available for future app settings
// The scrollable view toggle has been removed as ScrollableHabits is now the default
export interface SettingsState {
  // Add new settings here as needed
}

const initialState: SettingsState = {};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    // Add new reducers here as needed
  },
});

// Actions - none currently needed
// export const { } = settingsSlice.actions;

export default settingsSlice.reducer;
