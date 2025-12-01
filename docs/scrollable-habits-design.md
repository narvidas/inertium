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

## Open Questions

1. Should dragging to reorder habits work in scrollable view? (Probably yes)
2. What happens at scroll boundaries? (Infinite in both directions)
3. How to handle "today" indicator? (Highlight current day, button to scroll back)

---

## Implementation Summary (Completed)

### Files Created

#### Settings
- `src/config/rtk/settings.slice.ts` - Redux slice for app settings including scrollable view toggle
- `src/config/rtk/settings.slice.test.ts` - Tests for settings slice

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
- `src/components/TabNavigation/TabNavigation.tsx` - Conditional rendering based on setting
- `src/features/Profile/ProfileScreen/AuthenticatedView.tsx` - Added toggle switch
- `src/features/Profile/ProfileScreen/AnonymousView.tsx` - Added toggle switch

### Key Design Decisions

1. **Scroll Sync via Context**: Used a `ScrollSyncContext` that tracks scroll position and synchronizes all registered FlatLists. Each scrollable component registers itself and receives scroll events.

2. **Virtualization**: Used `FlatList` with `getItemLayout` for O(1) scroll-to-index performance. Each list shows 60 days buffer on each side of today.

3. **Reuse of Existing Components**: Reused `ConfigureHabitModal`, `ItemModal`, `HeaderComponent`, `NewHabitModal` from the original Habits feature to maintain consistency.

4. **Data Integrity**: Each day item explicitly uses `formatISO(date)` for dates, and `isSameDay` for matching. Items are identified by ID, not by position.

5. **Backward Compatibility**: The original HabitsScreen is completely unchanged. Users toggle between views via the Profile screen setting.

### Testing

- 7 tests for settings slice
- 11 tests for ScrollableHabitsScreen
- All 39 tests pass (including 14 original HabitsScreen tests + 7 CalendarStrip tests)

### Known Limitations

1. **Goal Progress**: Currently shows goal progress for the last 7 days around today, regardless of scroll position. A future enhancement could compute this based on visible week.

2. **Month Header**: The month/year header is static (shows current month). Could be enhanced to update based on scroll position.

3. **Snap-to-day**: Scrolling is completely free. Could add snap-to-week or snap-to-day behavior.

4. **Infinite Scroll**: Currently limited to ±60 days from today. Could implement true infinite scroll with dynamic data loading.

