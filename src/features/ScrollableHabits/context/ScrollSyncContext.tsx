import addDays from "date-fns/addDays";
import format from "date-fns/format";
import startOfDay from "date-fns/startOfDay";
import React, { createContext, FC, ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { ScrollSyncContextValue } from "../types";

// Match original sizing: screenWidth / 8 (like original HabitComponent)
const screenWidth = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 20; // Match padding from ScrollableHabitsScreen.styles
const AVAILABLE_WIDTH = screenWidth - (HORIZONTAL_PADDING * 2);
const DAY_WIDTH = Math.floor(AVAILABLE_WIDTH / 7); // 7 days visible within the padded area

const INITIAL_BUFFER_DAYS = 90; // Initial buffer: 90 days each side
const BUFFER_EXTENSION = 30; // Add 30 more days when approaching edges

const ScrollSyncContext = createContext<ScrollSyncContextValue | null>(null);

interface ScrollSyncProviderProps {
  children: ReactNode;
}

export const ScrollSyncProvider: FC<ScrollSyncProviderProps> = ({ children }) => {
  const centerDate = useMemo(() => startOfDay(new Date()), []);
  const [bufferDays, setBufferDays] = useState(INITIAL_BUFFER_DAYS);
  const [scrollX, setScrollXState] = useState(INITIAL_BUFFER_DAYS * DAY_WIDTH);
  const [activeScrollViewId, setActiveScrollViewId] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => format(centerDate, "MMMM yyyy"));

  // Track all registered scroll views
  const scrollViewRefs = useRef<Map<string, React.RefObject<FlatList<any> | null>>>(new Map());
  // Track the final scroll position for debounced sync
  const pendingScrollX = useRef<number>(INITIAL_BUFFER_DAYS * DAY_WIDTH);
  // Debounce timer for scroll end
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Register a scroll view for synchronization
  const registerScrollView = useCallback((id: string, ref: React.RefObject<FlatList<any> | null>) => {
    scrollViewRefs.current.set(id, ref);
    return () => {
      scrollViewRefs.current.delete(id);
    };
  }, []);

  /* istanbul ignore next -- @preserve Called by scroll events, requires native scroll simulation */
  // Calculate visible date from scroll offset
  const getVisibleDateFromOffset = useCallback((offset: number): Date => {
    // Calculate which day index is at the center of the screen
    const centerDayIndex = Math.round(offset / DAY_WIDTH) + 3; // +3 to get center of 7 visible days
    const daysFromCenter = centerDayIndex - bufferDays;
    return addDays(centerDate, daysFromCenter);
  }, [centerDate, bufferDays]);

  /* istanbul ignore next -- @preserve Called by scroll events, requires native scroll simulation */
  // Update month header based on visible date
  const updateMonthHeader = useCallback((offset: number) => {
    const visibleDate = getVisibleDateFromOffset(offset);
    const newMonth = format(visibleDate, "MMMM yyyy");
    setVisibleMonth(newMonth);
  }, [getVisibleDateFromOffset]);

  /* istanbul ignore next -- @preserve Called by scroll events, requires native scroll simulation */
  // Check if we need to extend the buffer
  const checkAndExtendBuffer = useCallback((offset: number) => {
    const totalWidth = bufferDays * 2 * DAY_WIDTH;
    const leftThreshold = DAY_WIDTH * 14; // 2 weeks from left edge
    const rightThreshold = totalWidth - (DAY_WIDTH * 14); // 2 weeks from right edge

    if (offset < leftThreshold || offset > rightThreshold) {
      setBufferDays(prev => prev + BUFFER_EXTENSION);
    }
  }, [bufferDays]);

  /* istanbul ignore next -- @preserve Called by scroll events, requires native scroll simulation */
  // Sync all other scroll views (called at scroll end with animation)
  const syncOtherScrollViews = useCallback((offset: number, sourceId: string | null, animated: boolean = true) => {
    scrollViewRefs.current.forEach((ref, id) => {
      if (id !== sourceId && ref.current) {
        ref.current.scrollToOffset({ offset, animated });
      }
    });
  }, []);

  /* istanbul ignore next -- @preserve Called by scroll events, requires native scroll simulation */
  // Called during scroll - only updates state, doesn't sync others
  const setScrollX = useCallback((x: number, sourceId?: string) => {
    pendingScrollX.current = x;
    setScrollXState(x);

    // Clear any pending scroll end timer
    if (scrollEndTimer.current) {
      clearTimeout(scrollEndTimer.current);
    }
  }, []);

  /* istanbul ignore next -- @preserve Called by scroll events, requires native scroll simulation */
  // Called when scroll begins
  const onScrollBegin = useCallback((viewId: string) => {
    setActiveScrollViewId(viewId);
    // Clear any pending scroll end actions
    if (scrollEndTimer.current) {
      clearTimeout(scrollEndTimer.current);
      scrollEndTimer.current = null;
    }
  }, []);

  /* istanbul ignore next -- @preserve Called by scroll events, debounced timer logic */
  // Called when scroll ends - this is where we sync other views
  const onScrollEnd = useCallback((viewId: string) => {
    const finalOffset = pendingScrollX.current;

    // Debounce: wait a short moment to ensure scroll has truly ended
    scrollEndTimer.current = setTimeout(() => {
      // Sync all other scroll views with springy animation
      syncOtherScrollViews(finalOffset, viewId, true);

      // Update month header
      updateMonthHeader(finalOffset);

      // Check if we need to extend buffer
      checkAndExtendBuffer(finalOffset);

      // Clear active scroll view
      setActiveScrollViewId(null);
      scrollEndTimer.current = null;
    }, 50); // Small debounce to catch momentum scroll end
  }, [syncOtherScrollViews, updateMonthHeader, checkAndExtendBuffer]);

  // Scroll to today (used by Today button)
  const scrollToToday = useCallback(() => {
    const todayOffset = bufferDays * DAY_WIDTH;
    pendingScrollX.current = todayOffset;
    setScrollXState(todayOffset);

    // Sync all scroll views to today
    scrollViewRefs.current.forEach((ref) => {
      if (ref.current) {
        ref.current.scrollToOffset({ offset: todayOffset, animated: true });
      }
    });

    // Update month header
    setVisibleMonth(format(centerDate, "MMMM yyyy"));
  }, [bufferDays, centerDate]);

  const value: ScrollSyncContextValue = useMemo(() => ({
    scrollX,
    setScrollX,
    onScrollBegin,
    onScrollEnd,
    activeScrollViewId,
    dayWidth: DAY_WIDTH,
    bufferDays,
    centerDate,
    visibleMonth,
    scrollToToday,
  }), [scrollX, setScrollX, onScrollBegin, onScrollEnd, activeScrollViewId, bufferDays, centerDate, visibleMonth, scrollToToday]);

  return (
    <ScrollSyncContext.Provider value={value}>
      <ScrollSyncRegistryContext.Provider value={{ registerScrollView }}>
        {children}
      </ScrollSyncRegistryContext.Provider>
    </ScrollSyncContext.Provider>
  );
};

// Separate context for registration to avoid re-renders
interface ScrollSyncRegistryContextValue {
  registerScrollView: (id: string, ref: React.RefObject<FlatList<any> | null>) => () => void;
}

const ScrollSyncRegistryContext = createContext<ScrollSyncRegistryContextValue | null>(null);

export const useScrollSync = (): ScrollSyncContextValue => {
  const context = useContext(ScrollSyncContext);
  /* istanbul ignore if -- @preserve Defensive check for context misuse */
  if (!context) {
    throw new Error("useScrollSync must be used within a ScrollSyncProvider");
  }
  return context;
};

// Helper hook to register a scroll view for synchronization
export const useScrollViewSync = (
  id: string,
  flatListRef: React.RefObject<FlatList<any> | null>
) => {
  const { scrollX, setScrollX, onScrollBegin, onScrollEnd, activeScrollViewId, dayWidth, bufferDays, centerDate, visibleMonth, scrollToToday } = useScrollSync();
  const registry = useContext(ScrollSyncRegistryContext);

  // Register this scroll view on mount
  React.useEffect(() => {
    if (registry) {
      return registry.registerScrollView(id, flatListRef);
    }
  }, [id, flatListRef, registry]);

  // Calculate initial offset to center on today
  const initialOffset = useMemo(() => bufferDays * dayWidth, [bufferDays, dayWidth]);

  /* istanbul ignore next -- @preserve Scroll event handler, requires native scroll simulation */
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    // Only update if this is the active scroll view
    if (activeScrollViewId === id) {
      setScrollX(x, id);
    }
  }, [id, activeScrollViewId, setScrollX]);

  /* istanbul ignore next -- @preserve Scroll event handler, requires native scroll simulation */
  const handleScrollBegin = useCallback(() => {
    onScrollBegin(id);
  }, [id, onScrollBegin]);

  /* istanbul ignore next -- @preserve Scroll event handler, requires native scroll simulation */
  const handleScrollEnd = useCallback(() => {
    onScrollEnd(id);
  }, [id, onScrollEnd]);

  return {
    scrollX,
    initialOffset,
    dayWidth,
    bufferDays,
    centerDate,
    visibleMonth,
    scrollToToday,
    handleScroll,
    handleScrollBegin,
    handleScrollEnd,
    isActiveScrollView: activeScrollViewId === id,
  };
};

export default ScrollSyncContext;
