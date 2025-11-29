// This shim must be imported before any other module that uses deprecated React Native APIs
// It patches ViewPropTypes and other removed APIs for compatibility with native-base v2
// and other legacy packages

import { ViewPropTypes as RNViewPropTypes } from 'deprecated-react-native-prop-types';

// Patch React Native to include ViewPropTypes
const ReactNative = require('react-native');

// Only patch if not already patched
if (!ReactNative.ViewPropTypes) {
  Object.defineProperty(ReactNative, 'ViewPropTypes', {
    get() {
      return RNViewPropTypes;
    },
  });
}

// Also patch ColorPropType, EdgeInsetsPropType, PointPropType, TextPropTypes if needed
import {
  ColorPropType,
  EdgeInsetsPropType,
  PointPropType,
  TextPropTypes,
} from 'deprecated-react-native-prop-types';

if (!ReactNative.ColorPropType) {
  Object.defineProperty(ReactNative, 'ColorPropType', {
    get() {
      return ColorPropType;
    },
  });
}

if (!ReactNative.EdgeInsetsPropType) {
  Object.defineProperty(ReactNative, 'EdgeInsetsPropType', {
    get() {
      return EdgeInsetsPropType;
    },
  });
}

if (!ReactNative.PointPropType) {
  Object.defineProperty(ReactNative, 'PointPropType', {
    get() {
      return PointPropType;
    },
  });
}

if (!ReactNative.TextPropTypes) {
  Object.defineProperty(ReactNative, 'TextPropTypes', {
    get() {
      return TextPropTypes;
    },
  });
}

// Patch Keyboard.removeListener (removed in RN 0.72+)
if (ReactNative.Keyboard && !ReactNative.Keyboard.removeListener) {
  ReactNative.Keyboard.removeListener = () => {
    // No-op: removeListener was removed, subscriptions are now cleaned up via .remove()
  };
}

// Patch Dimensions.removeEventListener (removed in RN 0.72+)
if (ReactNative.Dimensions && !ReactNative.Dimensions.removeEventListener) {
  ReactNative.Dimensions.removeEventListener = () => {
    // No-op: removeEventListener was removed, use subscription.remove() instead
  };
}

