# Scrollable Habits View - Design Document

## Overview

This document outlines the design for an alternative "infinite scroll" view of habits where users can horizontally scroll through days continuously, rather than jumping week-by-week.

## Current Architecture

### Paginated Week View (Current)
- `CalendarStrip` shows 7 fixed days with left/right arrows
- `HabitsScreen` renders habits via `DraggableFlatList`
- Each `HabitComponent` shows 7 `ItemComponent`s for the current week
- Week changes via arrow tap or swipe gesture
- State: `startOfWeek: Date` tracks which Monday is displayed

### Data Flow
```
User swipes → CalendarStripComponent → CalendarStrip (ref.getNextWeek)
                                     ↓
                           setStartingDate(newMonday)
                                     ↓
                           onWeekChanged(newMonday)
                                     ↓
                    HabitsScreen.setStartOfWeek(newMonday)
                                     ↓
                    All HabitComponents re-render with new week
```

## New Scrollable View Architecture

### Key Challenges
1. **Synchronized scrolling**: Calendar strip and all habit rows must scroll together
2. **Performance**: Must virtualize for smooth scrolling (many habits × many days)
3. **Infinite scroll**: Need to dynamically load days in both directions
4. **Fixed labels**: Habit titles must stay in place while days scroll

### Solution: Shared Animated Value + Virtualized Lists

#### Core Concept
Use a shared `Animated.Value` to represent the scroll offset. This value drives:
1. The calendar strip's horizontal scroll
2. Each habit row's horizontal scroll

React Native's `FlatList` with horizontal orientation already uses virtualization. We'll leverage this.

#### Component Hierarchy
```
ScrollableHabitsScreen
├── ScrollSyncProvider (Context + Animated.Value)
├── ScrollableCalendarStrip
│   └── [CalendarDayItem, ...] (virtualized)
├── DraggableFlatList (vertical, for habit reordering)
│   └── ScrollableHabitRow
│       ├── HabitHeader (fixed, doesn't scroll)
│       └── ScrollableItemsRow
│           └── [ItemDayComponent, ...] (virtualized, synced)
```

#### Scroll Synchronization Strategy

**Option A: ScrollView with onScroll + scrollTo**
- One "master" scroll view fires `onScroll`
- Other scroll views call `scrollTo` to match
- Pros: Works with FlatList
- Cons: Slight delay, potential feedback loops

**Option B: Animated.event binding (Chosen)**
- Use `Animated.event` to capture scroll position
- Bind same animated value to `transform: [{translateX}]` of all rows
- Render all items but translate the container
- Pros: Buttery smooth, no loops
- Cons: Need to handle virtualization separately

**Option C: Shared horizontal FlatList ref**
- All rows share scrollToOffset calls
- Use `useImperativeHandle` to expose sync method
- Hybrid: Virtualization + manual sync

### Implementation Details

#### 1. Settings Slice
```typescript
// src/config/rtk/settings.slice.ts
interface SettingsState {
  useScrollableView: boolean;
}
```

#### 2. ScrollSyncContext
```typescript
// Provides scroll offset + methods to all scrollable components
interface ScrollSyncContextValue {
  scrollOffset: Animated.Value;
  scrollTo: (offset: number) => void;
  registerScrollView: (id: string, ref: FlatListRef) => void;
}
```

#### 3. Date Range Management
Instead of `startOfWeek`, we track:
- `centerDate`: The "anchor" date (today initially)
- `visibleRange`: Computed from scroll offset + screen width

Virtualized list generates dates around `centerDate`:
```typescript
const generateDates = (center: Date, bufferDays: number) => {
  const dates = [];
  for (let i = -bufferDays; i <= bufferDays; i++) {
    dates.push(addDays(center, i));
  }
  return dates;
};
```

#### 4. Item Date Matching
When rendering habit items, we find or create items for each visible date:
```typescript
const getItemForDate = (habit: Habit, date: Date): Item => {
  const existing = habit.items.find(item => 
    isSameDay(parseISO(item.date), date)
  );
  return existing || createUnrecordedItem(date);
};
```

### Performance Considerations

1. **Virtualization**: Use `FlatList` with `getItemLayout` for O(1) scroll-to-index
2. **Memoization**: Wrap item components in `React.memo`
3. **Shared data**: Keep `Animated.Value` outside React state to avoid re-renders
4. **Batch updates**: Use `useNativeDriver: true` for animations
5. **Item key stability**: Use date ISO string as key, not array index

### Data Integrity

**Critical**: The scrollable view must NOT accidentally mutate wrong dates.

Safeguards:
1. Item creation always uses explicit `formatISO(date)` 
2. Item lookup uses `isSameDay` comparison
3. `updateOrCreateItem` in slice finds by `item.id`, not by position
4. Tests verify date integrity across scroll positions

### File Structure
```
src/features/ScrollableHabits/
├── index.ts
├── types.ts
├── ScrollableHabitsScreen.tsx
├── ScrollableHabitsScreen.styles.ts
├── ScrollableHabitsScreen.test.tsx
├── context/
│   ├── ScrollSyncContext.tsx
│   └── index.ts
├── components/
│   ├── ScrollableCalendarStrip/
│   │   ├── index.ts
│   │   ├── ScrollableCalendarStrip.tsx
│   │   └── ScrollableCalendarStrip.styles.ts
│   ├── ScrollableHabitRow/
│   │   ├── index.ts
│   │   ├── ScrollableHabitRow.tsx
│   │   └── ScrollableHabitRow.styles.ts
│   └── ScrollableDayItem/
│       ├── index.ts
│       ├── ScrollableDayItem.tsx
│       └── ScrollableDayItem.styles.ts
```

## Migration Path

1. Create settings slice with toggle (default: OFF) ✅
2. Build scrollable feature behind toggle ✅
3. Wire up TabNavigation to conditionally render ✅
4. Test extensively before enabling by default ✅
5. Consider A/B testing if analytics available

## Open Questions (Resolved)

1. **Dragging to reorder habits?** → Yes, works via DraggableFlatList
2. **Scroll boundaries?** → Dynamic buffer extension (±90 days, extends +30 when approaching edges)
3. **"Today" indicator?** → "This week" button scrolls to current Monday; today's date is highlighted in calendar strip

---

## Implementation Summary (Completed)

### Files Created

#### Settings
- `src/config/rtk/settings.slice.ts` - Redux slice for app settings including scrollable view toggle
- Settings are persisted via `redux-persist` (whitelist in `store.ts`)

#### ScrollableHabits Feature
- `src/features/ScrollableHabits/index.ts` - Public exports
- `src/features/ScrollableHabits/types.ts` - TypeScript types
- `src/features/ScrollableHabits/ScrollableHabitsScreen.tsx` - Main screen component
- `src/features/ScrollableHabits/ScrollableHabitsScreen.styles.ts` - Styles
- `src/features/ScrollableHabits/ScrollableHabitsScreen.test.tsx` - Tests (11 tests)

#### Context for Scroll Synchronization
- `src/features/ScrollableHabits/context/index.ts` - Exports
- `src/features/ScrollableHabits/context/ScrollSyncContext.tsx` - Scroll sync provider and hooks

#### Components
- `src/features/ScrollableHabits/components/ScrollableCalendarStrip/` - Horizontally scrollable calendar
- `src/features/ScrollableHabits/components/ScrollableHabitRow/` - Scrollable habit row with sync
- `src/features/ScrollableHabits/components/ScrollableDayItem/` - Individual day item (reuses ItemModal)

### Files Modified

- `src/config/rtk/rootReducer.ts` - Added settings reducer
- `src/config/rtk/store.ts` - Added settings to redux-persist whitelist
- `src/components/TabNavigation/TabNavigation.tsx` - Conditional rendering based on setting
- `src/features/Profile/ProfileScreen/AuthenticatedView.tsx` - Added toggle switch
- `src/features/Profile/ProfileScreen/AnonymousView.tsx` - Added toggle switch

### Key Design Decisions

1. **Scroll Sync via Context**: Used a `ScrollSyncContext` that tracks scroll position and synchronizes all registered FlatLists. Each scrollable component registers itself and receives scroll events.

2. **Virtualization**: Used `FlatList` with `getItemLayout` for O(1) scroll-to-index performance. Each list shows 90 days buffer on each side of today (dynamically extends when approaching edges).

3. **Reuse of Existing Components**: Reused `ConfigureHabitModal`, `ItemModal`, `HeaderComponent`, `NewHabitModal` from the original Habits feature to maintain consistency.

4. **Data Integrity**: Each day item explicitly uses `formatISO(date)` for dates, and `isSameDay` for matching. Items are identified by ID, not by position.

5. **Backward Compatibility**: The original HabitsScreen is completely unchanged. Users toggle between views via the Profile screen setting.

### Testing

- 11 tests for ScrollableHabitsScreen
- Settings toggle behavior covered by ProfileScreen integration tests
- All 49 tests pass across the test suite

### UX Enhancements

1. **Real-time Month Header**: Month/year header updates during scroll with 50ms debounce, giving immediate feedback about temporal position while swiping.

2. **Text Fade During Scroll**: Habit item text fades to 20% opacity when scrolling (100ms fade out, 300ms fade in), providing clear "data in flux" feedback while keeping grid structure visible.

3. **Click-to-Snap Navigation**: Tapping any day in the calendar strip snaps the view to that day's week (Monday), making navigation more intuitive.

4. **Animated Scroll Sync**: When calendar strip scroll ends, habit rows animate smoothly to the new position rather than jumping.

### Known Limitations

1. **Goal Progress**: Currently shows goal progress for the visible week only when aligned to a Monday. When scrolled to mid-week, goal progress is hidden.

2. **Infinite Scroll**: Buffer dynamically extends (±90 days initially, +30 days when approaching edges) but has practical limits. True infinite scroll could be implemented with more sophisticated data loading.

