import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./rootReducer";

export interface SettingsState {
  useScrollableView: boolean;
}

const initialState: SettingsState = {
  useScrollableView: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setUseScrollableView(state, action: PayloadAction<boolean>) {
      state.useScrollableView = action.payload;
    },
    toggleScrollableView(state) {
      state.useScrollableView = !state.useScrollableView;
    },
  },
});

// Selectors
export const useScrollableViewSelector = (state: RootState) => state.settings?.useScrollableView ?? false;

// Actions
export const { setUseScrollableView, toggleScrollableView } = settingsSlice.actions;

export default settingsSlice.reducer;
