module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  testEnvironment: "jsdom",
  setupFiles: ["core-js", "<rootDir>/jest.setup.js"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  testPathIgnorePatterns: ["node_modules", "native-base-theme"],
  coveragePathIgnorePatterns: [
    "node_modules",
    "native-base-theme",
    "/testing/",
    "index\\.ts$",
    "index\\.js$",
  ],
  transform: { "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest" },
  reporters: ["default"],
  coverageDirectory: "testReport",
  coverageReporters: ["text", "cobertura", "lcov"],
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: { "^.+\\.(css|less|scss)$": "babel-jest" },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|@codler|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@sentry/.*|firebase)",
  ],
  globals: { DEV: true },
  verbose: true,
  preset: "jest-expo",
};
