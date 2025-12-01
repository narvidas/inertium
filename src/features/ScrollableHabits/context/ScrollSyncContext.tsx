import startOfDay from "date-fns/startOfDay";
import React, { createContext, FC, ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { ScrollSyncContextValue } from "../types";

const DAYS_VISIBLE = 7;
const BUFFER_DAYS = 60; // Buffer 60 days on each side for smooth scrolling

// Calculate day width based on screen width (7 days visible)
const screenWidth = Dimensions.get("window").width;
const DAY_WIDTH = Math.floor(screenWidth / DAYS_VISIBLE);

const ScrollSyncContext = createContext<ScrollSyncContextValue | null>(null);

interface ScrollViewRef {
  ref: React.RefObject<FlatList<any> | null>;
  id: string;
}

interface ScrollSyncProviderProps {
  children: ReactNode;
}

export const ScrollSyncProvider: FC<ScrollSyncProviderProps> = ({ children }) => {
  const [scrollX, setScrollXState] = useState(BUFFER_DAYS * DAY_WIDTH);
  const [activeScrollViewId, setActiveScrollViewId] = useState<string | null>(null);
  const centerDate = useMemo(() => startOfDay(new Date()), []);

  // Track all registered scroll views
  const scrollViewRefs = useRef<Map<string, React.RefObject<FlatList<any> | null>>>(new Map());
  // Prevent scroll sync loops
  const isSyncing = useRef(false);

  // Register a scroll view for synchronization
  const registerScrollView = useCallback((id: string, ref: React.RefObject<FlatList<any> | null>) => {
    scrollViewRefs.current.set(id, ref);
    return () => {
      scrollViewRefs.current.delete(id);
    };
  }, []);

  const setScrollX = useCallback((x: number, sourceId?: string) => {
    if (isSyncing.current) return;

    isSyncing.current = true;
    setScrollXState(x);

    // Sync all other scroll views
    scrollViewRefs.current.forEach((ref, id) => {
      if (id !== sourceId && ref.current) {
        ref.current.scrollToOffset({ offset: x, animated: false });
      }
    });

    // Reset sync flag after a short delay to allow scroll events to settle
    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  }, []);

  const onScrollBegin = useCallback((viewId: string) => {
    setActiveScrollViewId(viewId);
  }, []);

  const onScrollEnd = useCallback((viewId: string) => {
    if (activeScrollViewId === viewId) {
      setActiveScrollViewId(null);
    }
  }, [activeScrollViewId]);

  const value: ScrollSyncContextValue = useMemo(() => ({
    scrollX,
    setScrollX,
    onScrollBegin,
    onScrollEnd,
    activeScrollViewId,
    dayWidth: DAY_WIDTH,
    bufferDays: BUFFER_DAYS,
    centerDate,
  }), [scrollX, setScrollX, onScrollBegin, onScrollEnd, activeScrollViewId, centerDate]);

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
  const { scrollX, setScrollX, onScrollBegin, onScrollEnd, activeScrollViewId, dayWidth, bufferDays, centerDate } = useScrollSync();
  const registry = useContext(ScrollSyncRegistryContext);

  // Register this scroll view on mount
  React.useEffect(() => {
    if (registry) {
      return registry.registerScrollView(id, flatListRef);
    }
  }, [id, flatListRef, registry]);

  // Calculate initial offset to center on today
  const initialOffset = useMemo(() => bufferDays * dayWidth, [bufferDays, dayWidth]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    // Only update if this is the active scroll view or no one is actively scrolling
    if (activeScrollViewId === id || activeScrollViewId === null) {
      setScrollX(x, id);
    }
  }, [id, activeScrollViewId, setScrollX]);

  const handleScrollBegin = useCallback(() => {
    onScrollBegin(id);
  }, [id, onScrollBegin]);

  const handleScrollEnd = useCallback(() => {
    onScrollEnd(id);
  }, [id, onScrollEnd]);

  return {
    scrollX,
    initialOffset,
    dayWidth,
    bufferDays,
    centerDate,
    handleScroll,
    handleScrollBegin,
    handleScrollEnd,
    isActiveScrollView: activeScrollViewId === id,
  };
};

export default ScrollSyncContext;
