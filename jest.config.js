module.exports = {
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  testEnvironment: "jsdom",
  setupFiles: ["core-js"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  testPathIgnorePatterns: ["node_modules", "native-base-theme"],
  coveragePathIgnorePatterns: ["node_modules", "native-base-theme"],
  transform: { "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest" },
  reporters: ["default"],
  coverageDirectory: "testReport",
  coverageReporters: ["text", "cobertura", "lcov"],
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: { "^.+\\.(css|less|scss)$": "babel-jest" },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@codler|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@sentry/.*)",
  ],
  globals: { DEV: true },
  verbose: true,
  preset: "jest-expo",
};
