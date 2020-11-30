const devMode = process.env.NODE_ENV !== "development";

export default {
  // App Details
  appName: "Monad React Native Starter",

  // Build Configuration - eg. Debug or Release?
  DEV: devMode,

  // Google Analytics - uses a 'dev' account while we're testing
  gaTrackingId: devMode ? "UA-2" : "UA-1",
};
