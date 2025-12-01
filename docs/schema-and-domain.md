# Inertium Codebase Documentation

> A comprehensive guide to patterns, conventions, and gotchas for AI assistants and developers.

## Quick Reference

| Aspect | Details |
|--------|---------|
| **Tech Stack** | React Native (Expo SDK 54), TypeScript, Redux Toolkit, Firebase |
| **State Management** | Redux Toolkit + Redux Persist (AsyncStorage) |
| **Backend** | Firebase Realtime Database + Firebase Auth |
| **Styling** | React Native StyleSheet + NativeWind/Tailwind |
| **Testing** | Jest + React Native Testing Library |

---

# Data Layout

## Firebase Realtime Database Structure

```
├── habits/
│   └── {uid}/                    # User's habit collection
│       └── {habitId}/            # Individual habit (PushID)
│           ├── id: string
│           ├── title: string
│           ├── goal: number
│           ├── items: Item[]
│           └── meta: Meta
│
├── metadata/
│   └── {uid}/
│       └── habitOrder/           # Display order
│           ├── order: string[]   # Array of habitIds
│           └── meta: Meta
│
└── users/
    └── {uid}/                    # User profile
        ├── firstName: string
        ├── lastName: string
        └── email: string
```

## Local State Structure (Redux)

```typescript
// RootState shape
{
  habitsState: {
    habits: {
      [habitId: string]: Habit    // Object keyed by habitId
    },
    order: HabitOrder
  }
}
```

---

# Domain-specific Terminology

## What is a Habit?

A **Habit** is the primary entity representing a daily practice the user wants to track. Each habit has a weekly goal (0-7 days) and contains a collection of **Items** representing day-by-day entries.

```typescript
// Runtime example
{
  id: "-NxYz123AbcDef456789",      // Firebase PushID (20 chars)
  title: "Morning Run",
  goal: 5,                         // Target: 5 days per week
  items: [/* Item[] */],
  meta: {
    isDeleted: false,
    createdOn: "2024-01-15T08:30:00.000Z",
    lastUpdatedOn: "2024-01-20T14:22:00.000Z"
  }
}
```

## What is an Item?

An **Item** represents a single day's entry within a Habit. Items are **embedded in the Habit's `items` array**, not stored separately.

```typescript
// Runtime example
{
  id: "-NxYz789GhiJkl012345",
  date: "2024-01-20T00:00:00.000Z",  // ISO date string
  status: "done",                     // "default" | "done" | "fail"
  notes: "Ran 5k in 28 minutes",     // Max 1000 characters
  meta: {
    isDeleted: false,
    createdOn: "2024-01-20T09:00:00.000Z",
    lastUpdatedOn: "2024-01-20T09:15:00.000Z"
  }
}
```

## What is HabitOrder?

Tracks the display order of habits in the UI. When habits are reordered via drag-and-drop, this is updated.

```typescript
{
  order: ["-NxYz123...", "-NxYz456...", "-NxYz789..."],
  meta: { /* Meta */ }
}
```

## Status Lifecycle

Item status cycles through three states on tap:

```
default → done → fail → default (repeat)
       ↑        ↑      ↑
    1 tap    2 taps  3 taps
```

- **default**: Gray/untracked (not counted toward goal)
- **done**: Green/success (counted toward goal)
- **fail**: Red/failed (not counted toward goal)

---

# Design Decisions and Caveats

## ID Generation: Firebase PushIDs

IDs are generated using `generatePushID()` (found in `src/utils/generatePushID.ts`), which creates 20-character identifiers with these properties:

1. **Timestamp-based**: Sort chronologically
2. **Lexicographically sortable**: String comparison works correctly
3. **Collision-resistant**: 72 bits of randomness
4. **Monotonically increasing**: Even with same-millisecond generation

```typescript
// Example ID: "-NxYz123AbcDef456789"
// First 8 chars = timestamp, next 12 = random
```

**⚠️ Gotcha**: Never use simple UUIDs or sequential integers. The sync mechanism depends on these properties.

## Soft Delete Pattern

Habits are **never actually deleted** from the database. Instead:

```typescript
// Wrong: Deleting from object
delete state.habits[habitId];

// Correct: Setting soft delete flag
habit.meta.isDeleted = true;
```

**Why**: Sync reconciliation needs to know an item was intentionally deleted, not just missing. The `habitsSelector` filters out deleted habits for the UI.

```typescript
// From habits.slice.ts
const filterDeleted = (habits: Habits): Habits =>
  Object.keys(habits)
    .filter(key => !habits[key].meta?.isDeleted)
    .reduce((obj, key) => ({ ...obj, [key]: habits[key] }), {});
```

**⚠️ Gotcha**: Always filter deleted habits before displaying. Never show `habits` directly.

## Items Are Embedded, Not Separate

Items live inside their parent Habit's `items` array, NOT in a separate collection.

```typescript
// Wrong assumption
db.ref(`items/${habitId}/${itemId}`)

// Reality
db.ref(`habits/${uid}/${habitId}/items`) // Items are embedded
```

**Why**: Simplifies sync logic and atomic updates. A habit with its items is always consistent.

**Trade-off**: Large habits with many historical items could grow large. In practice, habits accumulate ~365 items/year maximum.

## Sync: "Last Updated Wins"

The sync mechanism uses timestamp-based conflict resolution:

```typescript
// From sync.ts
const remoteIsNewer = remoteHabit.meta.lastUpdatedOn > localHabit.meta.lastUpdatedOn;
remoteIsNewer ? updateLocal() : await updateRemote();
```

**⚠️ Gotcha**: This means if two devices edit the same habit simultaneously, the one syncing last will overwrite. There's no merge for individual items.

**Commented-out item-level merge** exists in `sync.ts` (lines 67-81) but is not implemented:
```typescript
// Covers cases where local is outdated but still has some items remote does not
// const allItems = [...localHabitItemIds, ...remoteHabitItemIds]...
```

## Week Starts on Monday

The calendar uses Monday as the first day of the week:

```typescript
// From HabitsScreen.tsx
const mondayOfCurrentWeek = dateFnsStartOfWeek(new Date(), { weekStartsOn: 1 });
```

**⚠️ Gotcha**: Don't use default `startOfWeek()` (which starts on Sunday).

## Goal Range: 0-7 Only

Weekly goals must be 0-7 (days in a week). Validated by Yup:

```typescript
goal: Yup.number()
  .min(0, "Cannot be a negative number!")
  .max(7, "Week has only 7 days!")
```

---

# Edge Cases & Gotchas

## Firebase v10 Compatibility

Firebase was upgraded from v7 to v10, requiring **compat mode** imports:

```typescript
// Wrong (v7 style)
import firebase from 'firebase/app';

// Correct (v10 compat mode)
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
```

**⚠️ Critical**: `auth.currentUser` is **read-only** in v10+. Don't try to assign to it:

```typescript
// Wrong - will fail silently
auth.currentUser = storedUser;

// The app uses stored user for UI hints only
const storedCurrentUser = await getStoredCurrentUser();
```

## Week View Backfilling

When displaying a week, items are "backfilled" with unrecorded placeholders:

```typescript
// From HabitComponent.tsx
const backfillWeekItems = (recordedItems: Item[], startOfWeek: Date) => {
  const emptyWeekArray = [...Array(DAYS_IN_WEEK)];
  return emptyWeekArray.map((_, index) => {
    const itemDate = addDays(startOfWeek, index);
    const recordedItem = recordedItems.find(item => 
      isSameDay(itemDate, parseISO(item.date))
    );
    return recordedItem || unrecordedItem(itemDate);
  });
};
```

**⚠️ Gotcha**: Unrecorded items are created on-the-fly with new IDs each time. They're only persisted when the user interacts with them.

## Notes Dot Indicator

Items with notes show a small dot (`.`) below the day number. This is checked with:

```typescript
const notesExist = item.notes && item.notes !== "";
```

**⚠️ Gotcha**: An empty string `""` is a valid notes value (for clearing notes). Don't use falsy check alone.

## Delete Account TODO

The "Delete Account" feature is not implemented:

```typescript
// From UpdateProfileScreen.tsx line 198
onPress={() => {
  /* TODO delete account*/
}}
```

## HabitOrder May Be Out of Sync

The order array might contain IDs of deleted habits. The selector handles this gracefully:

```typescript
const sortedHabits = state.habitsState.order.order.map(key => habits[key]);
// habits[key] will be undefined for deleted habits, filtered later
```

---

# Code Patterns & Conventions

## File Structure

```
src/
├── components/              # Shared/reusable components
│   └── {Component}/
│       ├── index.ts         # Re-exports
│       ├── {Component}.tsx  # Component logic
│       └── {Component}.styles.ts
│
├── features/                # Feature modules
│   └── {Feature}/
│       ├── index.js         # Public exports
│       ├── {Feature}.slice.ts    # Redux slice
│       ├── {Feature}Screen.tsx
│       ├── {Feature}Screen.styles.ts
│       ├── {Feature}Screen.test.tsx
│       └── types.ts         # Feature-specific types
│
├── config/
│   ├── remote/              # Firebase setup
│   └── rtk/                 # Redux Toolkit setup
│
├── testing/                 # Test utilities
├── ui/                      # Custom UI component library
└── utils/                   # Shared utilities
```

## Component Pattern

```typescript
// Standard component structure
import { /* UI components */ } from "../../ui";
import React, { FC, useState } from "react";
import { styles } from "./Component.styles";

interface Props {
  // Explicit props with TypeScript
}

export const Component: FC<Props> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  );
};
```

## Style Pattern

Use `StyleSheet.create()` in a separate `.styles.ts` file:

```typescript
// Component.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    // ...
  },
});
```

**Color Palette**:
- Primary/Success: `#5A9C5E` (green)
- Danger/Fail: `#e58570` or `#dc3545`
- Default/Neutral: `#dddddd`
- Text: `#333`

## Form Pattern (Formik + Yup)

All forms use Formik with Yup validation:

```typescript
<Formik
  validationSchema={validationSchema}
  onSubmit={handleSubmit}
  validateOnChange={false}     // Only validate on submit
  validateOnBlur={false}       // Not on blur
  initialValues={{ /* ... */ }}
  render={({ handleChange, handleSubmit, errors }) => (
    // Form JSX
  )}
/>
```

**Error Display Pattern**:
```typescript
const [error, setError] = useState<string>();

useEffect(() => {
  if (error) errorToast(error);
}, [error]);

const updateError = (errors) => {
  if (errors) {
    const errorMessages = Object.values(errors);
    if (errorMessages.length > 0) setError(errorMessages[0]);
  }
};
```

## Context Providers

The app uses two custom contexts:

```typescript
// FirebaseContext - Database and auth access
const { auth, db, storage } = useContext(FirebaseContext);

// SyncContext - Sync operations
const { syncAll, syncHabit, syncHabitOrder } = useContext(SyncContext);
```

## Redux Selectors

Selectors are defined in the slice file and handle filtering:

```typescript
// From habits.slice.ts
export const habitsSelector = (state: RootState) => {
  const habits = filterDeleted(state.habitsState.habits);
  const sortedHabits = state.habitsState.order.order.map(key => habits[key]);
  return sortedHabits;
};
```

---

# Testing Patterns

## Custom Render

Always use the custom render from `testing/customRender.tsx`:

```typescript
import { render, fireEvent, waitFor } from "../../testing/customRender";

const { getByText, findByLabelText, store, sync } = render(<Component />);
```

This provides:
- Pre-configured Redux store
- Mocked Firebase context
- Mocked Sync context
- Access to `store` and `sync` for assertions

## Async Element Finding

For elements that appear after state changes, use `findBy*` (async) instead of `getBy*`:

```typescript
// Wrong - will fail if element appears after render
const element = getByText("Dynamic Text");

// Correct - waits for element
const element = await findByText("Dynamic Text");
```

## Testing Alert Dialogs

Use the `spyOnAlert` helper:

```typescript
import spyOnAlert from "../../testing/spyOnAlert";
const { pressAlertButton } = spyOnAlert();

// In test
fireEvent.press(removeButton);
pressAlertButton("Yes");  // Simulates pressing "Yes" button
```

## Testing Sync Calls

The sync mock tracks all calls:

```typescript
expect(sync.syncAll).toHaveBeenCalled();
expect(sync.syncHabit).toHaveBeenCalledWith(habitId);
expect(sync.syncHabitOrder).not.toHaveBeenCalled();
```

---

# Common Operations

## Creating a New Habit

```typescript
import { createNewHabit } from "./habits.slice";

dispatch(createNewHabit({ 
  title: "Exercise", 
  goal: 5 
}));
// ID is auto-generated, timestamps are auto-set
```

## Updating an Item Status

```typescript
import { updateOrCreateItem } from "./habits.slice";

const newItem = { 
  ...existingItem, 
  status: "done" 
};
dispatch(updateOrCreateItem({ habitId, item: newItem }));
```

## Triggering Sync

```typescript
const { syncAll, syncHabit } = useContext(SyncContext);

// Sync everything
await syncAll();

// Sync specific habit
await syncHabit(habitId);
```

## Accessing Current User

```typescript
const { auth, db } = useContext(FirebaseContext);
const uid = auth.currentUser?.uid;
const userRef = db.ref(`users/${uid}`);
```

---

# What NOT to Do

## ❌ Don't Use Raw Habits Object

```typescript
// Wrong - includes deleted habits
const habits = state.habitsState.habits;

// Correct - use selector
const habits = useSelector(habitsSelector);
```

## ❌ Don't Mutate State Directly

```typescript
// Wrong - direct mutation outside Immer
habit.title = "New Title";

// Correct - dispatch action
dispatch(updateHabit({ id: habitId, title: "New Title", goal }));
```

## ❌ Don't Store Items Separately

```typescript
// Wrong - items should be in habit
db.ref(`items/${itemId}`).set(item);

// Correct - items live in habit
db.ref(`habits/${uid}/${habitId}`).set(habitWithItems);
```

## ❌ Don't Sync Without Auth Check

```typescript
// Wrong - will fail if not logged in
await habitDbRef.set(habit);

// Correct - check first
if (auth.currentUser) {
  await habitDbRef.set(habit);
}
```

## ❌ Don't Use Sunday as Week Start

```typescript
// Wrong - defaults to Sunday
startOfWeek(date);

// Correct - Monday start
startOfWeek(date, { weekStartsOn: 1 });
```

---

# Dependencies Worth Knowing

| Package | Purpose | Notes |
|---------|---------|-------|
| `date-fns` | Date manipulation | Used for week calculations, ISO formatting |
| `formik` + `yup` | Form handling | All forms use this pattern |
| `react-firebase-hooks` | Firebase React hooks | `useObjectVal` for realtime data |
| `react-native-draggable-flatlist` | Drag-to-reorder | Replaced `react-native-sortable-list` |
| `react-native-calendar-strip` | Week calendar | Custom fork at github.com/narvidas |
| `expo-secure-store` | Secure storage | For storing auth state |
| `redux-persist` | State persistence | Uses AsyncStorage |

---

# Incomplete Features

1. **Delete Account** - TODO in UpdateProfileScreen.tsx
2. **Item-level sync merge** - Commented out in sync.ts
3. **Offline-first behavior** - Sync requires network, no queuing

---

# Quick Debugging Tips

1. **Clear persisted state**: Uncomment `persistor.purge()` in Application.tsx
2. **Check sync status**: Watch for "Sync complete." toast on pull-to-refresh
3. **Verify Firebase connection**: Check `getFirebaseValues()` in console
4. **Test item cycling**: Tap item 3 times to verify status cycle
5. **Coverage report**: Run `yarn test` - report in `testReport/`

