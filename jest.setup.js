// This file runs before modules are loaded (via setupFiles)

// Set up Expo environment variables for jest-expo
process.env.EXPO_OS = "ios";

// Patch ViewPropTypes for native-base v2 compatibility with RN 0.72+
const RN = require("react-native");
const deprecatedPropTypes = require("deprecated-react-native-prop-types");

// Patch ViewPropTypes onto the react-native module
Object.defineProperty(RN, "ViewPropTypes", {
  get() {
    return deprecatedPropTypes.ViewPropTypes;
  },
});

Object.defineProperty(RN, "ColorPropType", {
  get() {
    return deprecatedPropTypes.ColorPropType;
  },
});

Object.defineProperty(RN, "EdgeInsetsPropType", {
  get() {
    return deprecatedPropTypes.EdgeInsetsPropType;
  },
});

Object.defineProperty(RN, "PointPropType", {
  get() {
    return deprecatedPropTypes.PointPropType;
  },
});

Object.defineProperty(RN, "TextPropTypes", {
  get() {
    return deprecatedPropTypes.TextPropTypes;
  },
});

// Patch Keyboard.removeListener (removed in RN 0.72) for native-base v2
if (RN.Keyboard && !RN.Keyboard.removeListener) {
  RN.Keyboard.removeListener = () => {};
}

