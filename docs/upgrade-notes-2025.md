# Expo SDK 49 to 54 Upgrade Notes

## Overview
Upgraded React Native habit tracker app from Expo SDK 49 to SDK 54, including React 19 compatibility fixes.

## Key Version Changes
- **Expo**: 49 → 54
- **React**: 18.x → 19.1.0
- **React Native**: 0.72.x → 0.81.5
- **Firebase**: 7.9.0 → 10.7.0 (compat mode)
- **React Navigation**: 6.x → 7.x
- **UI Library**: native-base v2 → custom NativeWind components

## Phase 1: SDK Upgrade (Expo 49 → 54)

### 1. Firebase Migration (v7 → v10)
Firebase v10 removed the `grpc` dependency that required node-gyp/python2.

**Changes:**
- Import paths changed to compat mode: `firebase/compat/app`, `firebase/compat/auth`, etc.
- Config import: default → named export (`import { config }`)
- `auth.currentUser` is now read-only (removed direct assignment)

### 2. React Navigation v7
- Replaced `@react-navigation/stack` with `@react-navigation/native-stack`
- Updated tab navigator imports from `@react-navigation/bottom-tabs`

### 3. Removed/Replaced Packages
| Old Package | Replacement | Reason |
|-------------|-------------|--------|
| `@gorhom/animated-tabbar` | Standard bottom tabs | Incompatible with Reanimated v4 |
| `react-native-action-button` | Custom FAB component | Incompatible with RN 0.81 |
| `expo` AppLoading | `expo-splash-screen` | Deprecated in SDK 54 |

### 4. Ionicons v5+ Name Changes
Updated icon names throughout codebase:
- `ios-checkmark` → `checkmark`
- `ios-close` → `close`
- `md-trash` → `trash`
- `ios-settings` → `settings-outline`
- Native-base `Icon` replaced with `@expo/vector-icons` `Ionicons`

## Phase 2: Native-Base Removal

Migrated from native-base v2 to a custom UI component library to:
- Remove all patches (native-base-shoutem-theme, keyboard-aware-scroll-view)
- Remove shim.js for deprecated RN APIs
- Eliminate React 19 legacy context warnings
- Remove deprecated-react-native-prop-types dependency

### New Architecture
- **`src/ui/index.tsx`** - Custom UI component library using React Native + NativeWind
- **NativeWind v4** - Tailwind CSS for React Native styling
- **Zero patches** - No patch-package dependencies

### Components Migrated
All native-base components replaced with custom implementations:
- Layout: `Container`, `Content`, `View`, `Root`, `StyleProvider`
- Typography: `H1`, `H3`, `Text`
- Form: `Form`, `Item`, `Label`, `Input`, `Button`, `CheckBox`
- List: `List`, `ListItem`, `Body`, `Left`, `Right`
- Toast: Custom animated toast with static API

### Files Removed
- `shim.js` - No longer needed
- `native-base-theme/` - Complete directory
- `patches/` - All patch files

### Dependencies Removed
- `native-base`
- `deprecated-react-native-prop-types`
- `patch-package`
- `postinstall-postinstall`

### Dependencies Added
- `nativewind@^4.0.1`
- `tailwindcss@^3.4.0` (NativeWind v4 requires Tailwind v3.x)
- `react-native-reanimated` (for animations)
- `react-native-worklets` (reanimated peer dep)

### Configuration Files Added
- `tailwind.config.js` - Tailwind configuration
- `global.css` - Tailwind entry point
- `metro.config.js` - NativeWind Metro integration
- `nativewind-env.d.ts` - TypeScript declarations
- `__mocks__/react-native-sortable-list.js` - Test mock

## Test Updates
- Updated tests for React 18+ concurrent rendering
- Changed sync `getBy*` to async `findBy*` for elements appearing after state updates
- Added mock for `react-native-sortable-list` (StyleSheet.absoluteFill issue)
- Simplified `jest.setup.js` (removed native-base shims)
- Added `/ui/` to coverage exclusions

## Phase 3: Sortable List Replacement

### react-native-sortable-list → react-native-draggable-flatlist
The `react-native-sortable-list` library was incompatible with React Native 0.81 (runtime error: `Cannot read property 'style' of undefined`).

**Changes:**
- Replaced `react-native-sortable-list` with `react-native-draggable-flatlist@4.0.3`
- Updated `HabitsScreen.tsx`:
  - Import `DraggableFlatList` instead of `SortableList`
  - Changed from `renderRow`/`onReleaseRow` to `renderItem`/`onDragEnd` API
  - Added `GestureHandlerRootView` wrapper (required by draggable-flatlist)
  - Added `SafeAreaView` from `react-native-safe-area-context` to handle iPhone notch
- Updated `AnimatedRow.tsx`:
  - Added `onDrag` prop to trigger drag on long press
  - Wrapped content in `TouchableOpacity` with `onLongPress={onDrag}`
- Added jest setup for gesture handler: `import "react-native-gesture-handler/jestSetup"`
- Created new mock: `__mocks__/react-native-draggable-flatlist.js`
- Updated test to use new `onDragEnd` event format

**Dependencies Removed:**
- `react-native-sortable-list`
- `@types/react-native-sortable-list`

**Dependencies Added:**
- `react-native-draggable-flatlist@^4.0.3`

## Final State
- **All 14 tests passing**
- **Coverage thresholds met** (95%+ statements/lines/functions, 80%+ branches)
- **No patches**
- **No shims**
- **Clean React 19 compatibility**
