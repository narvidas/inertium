# Optimistic Updates & Performance Investigation

> Analysis of current performance optimizations and recommendations for real-device improvements.

## Current Implementation Summary

### ✅ What's Already Optimized Well

#### 1. Optimistic Updates Pattern
Both `ScrollableDayItem` and `MonthDayCell` implement optimistic updates correctly:

```typescript
// IMMEDIATE: Update UI optimistically
setOptimisticStatus(newStatus);

// DEFERRED: Dispatch to Redux after interactions complete
pendingDispatchRef.current = InteractionManager.runAfterInteractions(() => {
  dispatch(updateOrCreateItem({ habitId, item: newItem }));
});
```

**Benefits:**
- User sees immediate visual feedback (< 16ms)
- Heavy Redux operations don't block the JS thread during touch handling
- Touch responsiveness maintained even with many habits

#### 2. Cell-Level Redux Subscriptions
Each day cell uses its own selector to subscribe only to its specific item:

```typescript
const selectItemForDate = useMemo(makeSelectItemForDate, []);
const item = useSelector((state) => selectItemForDate(state, habitId, date));
```

**Benefits:**
- Tapping one cell doesn't re-render other cells
- Minimizes component tree updates

#### 3. Component Memoization
All performance-critical components use `React.memo`:
- `ScrollableDayItem`
- `ScrollableHabitRow`
- `MonthDayCell`
- `EmptyDayCell`

#### 4. FlatList Optimizations
```typescript
<FlatList
  removeClippedSubviews={true}
  maxToRenderPerBatch={14}
  windowSize={5}
  initialNumToRender={14}
  getItemLayout={getItemLayout}  // O(1) layout calculation
/>
```

#### 5. Debounced Network Sync
Network calls are debounced to avoid spam on rapid taps:
```typescript
// Debounce sync by 500ms
syncTimeoutRef.current = setTimeout(() => {
  syncHabit(habitId);
}, 500);
```

---

## 🔴 Identified Performance Issues

### Issue 1: O(n) Item Lookups in Selectors

**Location:** `ScrollableDayItem.tsx:41`, `MonthDayCell.tsx:51`

```typescript
// Current: O(n) lookup every time state changes
return habit.items.find((item) => isSameDay(parseISO(item.date), date));
```

**Problem:** 
- Each visible cell runs `find()` through the entire items array
- As habits accumulate items (~365/year), lookups get progressively slower
- With 10 habits × 14 visible cells × 365 items = **51,100 iterations** per state change

**Impact:** Noticeable lag after a year of use, especially on older devices.

---

### Issue 2: `habitsSelector` Creates New References

**Location:** `habits.slice.ts:97-101`

```typescript
export const habitsSelector = (state: RootState) => {
  const habits = filterDeleted(state.habitsState.habits);  // New object every time
  const sortedHabits = state.habitsState.order.order.map(key => habits[key]);  // New array every time
  return sortedHabits;
};
```

**Problem:**
- Every state change creates new array/object references
- Causes `DraggableFlatList` to re-render all habit rows
- Even unrelated state changes (like updating a single item) trigger this

**Impact:** Full list re-renders when tapping any item.

---

### Issue 3: Date Formatting in Render Path

**Location:** `ScrollableDayItem.tsx:69-70`

```typescript
const dayOfWeekWord = format(date, "EEE");
const dayOfMonthNumber = format(date, "d");
```

**Problem:**
- `date-fns/format` parses format strings and creates new Date objects
- Called on every render of every cell
- 14 visible cells × 2 format calls = 28 format operations per scroll frame

**Impact:** Minor but cumulative during scrolling.

---

### Issue 4: Goal Progress Filters All Items

**Location:** `ScrollableHabitRow.tsx:184-188`

```typescript
const completedInWeek = habitItems.filter(item => {
  const itemDate = parseISO(item.date);
  return item.status === "done" && isWithinInterval(itemDate, { start: weekStart, end: weekEnd });
}).length;
```

**Problem:**
- Runs on every `habitItems` change
- Parses ISO dates for every item in the habit
- With many items, this is expensive

---

### Issue 5: No Memoized Selectors (createSelector)

**Problem:**
- Redux Toolkit includes `createSelector` from reselect, but it's not being used
- All selectors recompute on every state change, even when inputs haven't changed

---

## 💡 Recommended Improvements

### Improvement 1: Indexed Item Lookups (High Impact)

**Transform items from array to indexed structure:**

```typescript
// In types.ts
interface ItemsIndex {
  byDate: { [dateKey: string]: Item };  // O(1) lookup by date
  byId: { [itemId: string]: Item };     // O(1) lookup by id
  allIds: string[];                      // Preserve order if needed
}

interface Habit {
  id: string;
  title: string;
  goal: number;
  items: ItemsIndex;  // Changed from Item[]
  meta: Meta;
}
```

**Updated selector:**
```typescript
// O(1) instead of O(n)
const selectItemForDate = (state: RootState, habitId: string, dateKey: string) => {
  return state.habitsState.habits[habitId]?.items.byDate[dateKey];
};
```

**Migration:** Can be done incrementally with a migration in redux-persist.

---

### Improvement 2: Memoized Selectors with createSelector

**Use reselect for derived data:**

```typescript
import { createSelector } from '@reduxjs/toolkit';

// Base selector - just returns the raw data
const selectHabitsState = (state: RootState) => state.habitsState;
const selectHabitsMap = (state: RootState) => state.habitsState.habits;
const selectOrder = (state: RootState) => state.habitsState.order.order;

// Memoized selector - only recomputes when inputs change
export const habitsSelector = createSelector(
  [selectHabitsMap, selectOrder],
  (habits, order) => {
    return order
      .filter(id => habits[id] && !habits[id].meta?.isDeleted)
      .map(id => habits[id]);
  }
);
```

**Benefits:**
- Only recomputes when `habits` or `order` actually change
- Cached result returned for same inputs

---

### Improvement 3: Memoize Date Formatting

**Pre-compute in useMemo or move to parent:**

```typescript
// Option A: Memoize in component
const { dayOfWeekWord, dayOfMonthNumber } = useMemo(() => ({
  dayOfWeekWord: format(date, "EEE"),
  dayOfMonthNumber: format(date, "d"),
}), [date]);

// Option B: Pre-compute in parent when generating dateItems
const dateItems = useMemo((): DateItem[] => {
  const result: DateItem[] = [];
  for (let i = -bufferDays; i <= bufferDays; i++) {
    const date = addDays(centerDate, i);
    result.push({
      date,
      dateKey: formatISO(date, { representation: "date" }),
      dayOfWeek: format(date, "EEE"),      // Pre-computed
      dayOfMonth: format(date, "d"),        // Pre-computed
    });
  }
  return result;
}, [centerDate, bufferDays]);
```

---

### Improvement 4: Denormalize Goal Progress

**Maintain running count in Redux:**

```typescript
// In habits.slice.ts reducers
updateOrCreateItem(state, action) {
  // ... existing logic ...
  
  // Update denormalized count if status changed
  if (oldStatus !== newStatus) {
    const dateKey = item.date.slice(0, 10);  // YYYY-MM-DD
    const weekKey = getISOWeek(dateKey);
    
    if (oldStatus === "done") habit.weeklyCompletions[weekKey]--;
    if (newStatus === "done") habit.weeklyCompletions[weekKey]++;
  }
}
```

**Then in component:**
```typescript
// O(1) lookup instead of O(n) filter
const completedInWeek = habitMeta?.weeklyCompletions?.[currentWeekKey] ?? 0;
```

---

### Improvement 5: Separate Read/Write Concerns

**Consider a normalized state shape:**

```typescript
// Normalized shape - items separate from habits
{
  habits: {
    byId: { [habitId]: { id, title, goal, meta } },
    allIds: []
  },
  items: {
    byId: { [itemId]: Item },
    byHabitAndDate: { [habitId]: { [dateKey]: itemId } }  // Index
  },
  habitOrder: { order: [], meta }
}
```

**Benefits:**
- Updating an item doesn't require finding it in an array
- Selectors can be more granular
- Easier to optimize specific access patterns

---

## 📊 Priority Matrix

| Improvement | Impact | Effort | Priority |
|-------------|--------|--------|----------|
| Indexed item lookups | 🔴 High | Medium | **P0** |
| Memoized selectors (createSelector) | 🟠 Medium | Low | **P1** |
| Pre-compute date formatting | 🟡 Low | Low | **P2** |
| Denormalized goal counts | 🟠 Medium | Medium | **P2** |
| Normalized state shape | 🔴 High | High | **P3** (Future) |

---

## 🧪 Testing Performance Improvements

### Before/After Measurement

```typescript
// Add performance marks in ScrollableDayItem
const updateStatus = useCallback(() => {
  performance.mark('tap-start');
  setOptimisticStatus(newStatus);
  performance.mark('optimistic-done');
  
  InteractionManager.runAfterInteractions(() => {
    dispatch(updateOrCreateItem({ habitId, item: newItem }));
    performance.mark('dispatch-done');
    performance.measure('optimistic-latency', 'tap-start', 'optimistic-done');
    performance.measure('total-latency', 'tap-start', 'dispatch-done');
  });
}, [...]);
```

### React DevTools Profiler
- Record interactions in development
- Look for "cascading renders" after item taps
- Target: Only tapped cell should re-render

### Real Device Testing
- Test on low-end devices (e.g., iPhone SE 1st gen, older Android)
- Test with 1+ year of data (365+ items per habit)
- Measure scroll FPS with Perf Monitor

---

## Implementation Plan

### Phase 1: Quick Wins (1-2 days)
1. ✅ Add `createSelector` to `habitsSelector`
2. ✅ Memoize date formatting in `ScrollableDayItem`
3. ✅ Add performance measurement hooks

### Phase 2: Indexed Lookups (3-5 days)
1. Update `Item[]` to indexed structure
2. Add redux-persist migration
3. Update all selectors and reducers
4. Update sync logic

### Phase 3: Advanced (Future)
1. Consider fully normalized state
2. Evaluate if weeklyCompletions denormalization is needed
3. Profile and optimize further based on real usage data

---

## Conclusion

The current implementation has solid foundations with optimistic updates and cell-level subscriptions. The main bottleneck is **O(n) item lookups** which will degrade over time as users accumulate data.

Priority should be:
1. **Immediately:** Add `createSelector` for `habitsSelector` (low effort, prevents list re-renders)
2. **Soon:** Implement indexed item lookups (highest impact for long-term users)
3. **Later:** Consider full state normalization if other bottlenecks emerge
