import settingsReducer, {
  setUseScrollableView,
  toggleScrollableView,
  useScrollableViewSelector,
  SettingsState,
} from "./settings.slice";
import { RootState } from "./rootReducer";

describe("settings slice", () => {
  const initialState: SettingsState = {
    useScrollableView: false,
  };

  describe("reducer", () => {
    test("should return the initial state", () => {
      expect(settingsReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    test("setUseScrollableView sets the value to true", () => {
      const newState = settingsReducer(initialState, setUseScrollableView(true));
      expect(newState.useScrollableView).toBe(true);
    });

    test("setUseScrollableView sets the value to false", () => {
      const stateWithScrollable = { useScrollableView: true };
      const newState = settingsReducer(stateWithScrollable, setUseScrollableView(false));
      expect(newState.useScrollableView).toBe(false);
    });

    test("toggleScrollableView toggles from false to true", () => {
      const newState = settingsReducer(initialState, toggleScrollableView());
      expect(newState.useScrollableView).toBe(true);
    });

    test("toggleScrollableView toggles from true to false", () => {
      const stateWithScrollable = { useScrollableView: true };
      const newState = settingsReducer(stateWithScrollable, toggleScrollableView());
      expect(newState.useScrollableView).toBe(false);
    });
  });

  describe("selectors", () => {
    test("useScrollableViewSelector returns the correct value", () => {
      const mockState = {
        settings: { useScrollableView: true },
        habitsState: { habits: {}, order: { order: [] } },
      } as RootState;

      expect(useScrollableViewSelector(mockState)).toBe(true);
    });

    test("useScrollableViewSelector returns false when settings is undefined", () => {
      const mockState = ({
        settings: undefined,
        habitsState: { habits: {}, order: { order: [] } },
      } as unknown) as RootState;

      expect(useScrollableViewSelector(mockState)).toBe(false);
    });
  });
});
