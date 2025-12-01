module.exports = {
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  testEnvironment: "jsdom",
  setupFiles: ["core-js", "<rootDir>/jest.setup.js"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  testPathIgnorePatterns: ["node_modules", "calendar-temp"],
  coveragePathIgnorePatterns: ["node_modules", "/testing/", "/ui/", "index\\.ts$", "index\\.js$"],
  transform: { "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest" },
  reporters: ["default"],
  coverageDirectory: "testReport",
  coverageReporters: ["text", "cobertura", "lcov"],
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: { "^.+\\.(css|less|scss)$": "babel-jest" },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|@codler|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|@sentry/.*|firebase|react-native-draggable-flatlist|react-native-calendar-strip|react-native-reanimated|react-native-gesture-handler|react-native-swipe-gestures|nativewind|react-native-css-interop)",
  ],
  globals: { DEV: true },
  verbose: true,
  preset: "jest-expo",
};
