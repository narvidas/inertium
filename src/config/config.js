const devMode = process.env.NODE_ENV !== "development";

export default {
  appName: "Inertium Habit Tracker",
  DEV: devMode,
  // Google Analytics - uses a 'dev' account while we're testing
  gaTrackingId: devMode ? "UA-2" : "UA-1",
};
