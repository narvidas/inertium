import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import addDays from "date-fns/addDays";
import formatISO from "date-fns/formatISO";
import isMonday from "date-fns/isMonday";
import isWithinInterval from "date-fns/isWithinInterval";
import parseISO from "date-fns/parseISO";
import React, { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, FlatList, Platform, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Spacer } from "../../../../components/Spacer/Spacer";
import SyncContext from "../../../../config/remote/syncContext";
import { RootState } from "../../../../config/rtk/rootReducer";
import { removeHabit, updateHabit } from "../../habits.slice";
import { HabitsStackParamList } from "../../types";
import { ConfigureHabitModal } from "../ConfigureHabitModal";
import { HeaderComponent } from "../HeaderComponent";
import { useScrollViewSync } from "../../context";
import { ScrollableDayItem } from "../ScrollableDayItem";
import { styles } from "./ScrollableHabitRow.styles";

type NavigationProp = NativeStackNavigationProp<HabitsStackParamList, "HabitsList">;

// Date item for virtualized list - contains only the date, not the habit item
interface DateItem {
  date: Date;
  dateKey: string;
}

interface Props {
  habitId: string;
  scrollViewId: string;
  /** Whether this row is currently being dragged */
  isActive?: boolean;
  /** Callback to initiate drag */
  onDrag?: () => void;
  /** 
   * Whether user can scroll this row directly. 
   * When false, row only syncs via calendar strip scroll.
   * @default false 
   */
  userScrollEnabled?: boolean;
}

// Memoized selector for habit metadata (title, goal, noteTemplate) - doesn't include items
const selectHabitMeta = (habitId: string) => (state: RootState) => {
  const habit = state.habitsState.habits[habitId];
  if (!habit) return null;
  return {
    id: habit.id,
    title: habit.title,
    goal: habit.goal,
    noteTemplate: habit.noteTemplate,
  };
};

// Separate selector for items - used only for goal progress calculation
const selectHabitItems = (habitId: string) => (state: RootState) => {
  const habit = state.habitsState.habits[habitId];
  return habit?.items ?? [];
};

const ScrollableHabitRowComponent: FC<Props> = ({
  habitId,
  scrollViewId,
  isActive = false,
  onDrag,
  userScrollEnabled = false
}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const flatListRef = useRef<FlatList<DateItem>>(null);
  const { syncHabit, pushHabit } = useContext(SyncContext);
  const [configModalVisible, setConfigModalVisible] = useState(false);

  // Subscribe to habit metadata only (not items) for header display
  const habitMeta = useSelector(selectHabitMeta(habitId));

  // Subscribe to items only for goal progress - this is the only place we need them
  const habitItems = useSelector(selectHabitItems(habitId));

  // Track previous items reference for sync
  const prevItemsRef = useRef(habitItems);

  const {
    scrollX,
    dayWidth,
    bufferDays,
    centerDate,
    handleScroll,
    handleScrollBegin,
    handleScrollEnd,
    isScrolling,
  } = useScrollViewSync(scrollViewId, flatListRef);

  // Animated value for scroll state (0 = not scrolling, 1 = scrolling)
  const scrollAnimValue = useRef(new Animated.Value(0)).current;

  // Animation for drag state
  const dragAnimation = useRef(new Animated.Value(0)).current;

  // Animate when scrolling state changes
  useEffect(() => {
    Animated.timing(scrollAnimValue, {
      toValue: isScrolling ? 1 : 0,
      duration: isScrolling ? 100 : 300, // Faster fade out, slower fade in
      useNativeDriver: true,
    }).start();
  }, [isScrolling, scrollAnimValue]);

  // Animate when drag state changes
  useEffect(() => {
    Animated.timing(dragAnimation, {
      duration: 100,
      useNativeDriver: true,
      easing: Easing.bounce,
      toValue: isActive ? 1 : 0,
    }).start();
  }, [isActive, dragAnimation]);

  // Debounced push timer ref
  const pushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Push habit to Firebase when items change - DEBOUNCED to avoid network spam on rapid taps
  // Uses pushHabit (write-only) instead of syncHabit (read-merge-write) to avoid
  // unnecessary Firebase reads and Redux dispatches that cause re-renders
  useEffect(() => {
    if (habitItems !== prevItemsRef.current && pushHabit) {
      prevItemsRef.current = habitItems;

      // Clear any pending push
      /* istanbul ignore next -- defensive cleanup, hard to test timing */
      if (pushTimeoutRef.current) {
        clearTimeout(pushTimeoutRef.current);
      }

      // Debounce push by 500ms - allows rapid taps without multiple network calls
      pushTimeoutRef.current = setTimeout(() => {
        pushHabit(habitId);
        pushTimeoutRef.current = null;
      }, 500);
    }

    // Cleanup on unmount
    /* istanbul ignore next -- cleanup function, tested implicitly */
    return () => {
      if (pushTimeoutRef.current) {
        clearTimeout(pushTimeoutRef.current);
      }
    };
  }, [habitItems, pushHabit, habitId]);

  // Generate date items for the virtualized list - INDEPENDENT of habit items
  // This only changes when centerDate or bufferDays changes
  const dateItems = useMemo((): DateItem[] => {
    const result: DateItem[] = [];
    for (let i = -bufferDays; i <= bufferDays; i++) {
      const date = addDays(centerDate, i);
      result.push({
        date,
        dateKey: formatISO(date, { representation: "date" }),
      });
    }
    return result;
  }, [centerDate, bufferDays]);

  // Calculate the leftmost visible date based on scroll position
  const leftmostVisibleDate = useMemo(() => {
    const dayIndex = Math.round(scrollX / dayWidth);
    const daysFromCenter = dayIndex - bufferDays;
    return addDays(centerDate, daysFromCenter);
  }, [scrollX, dayWidth, bufferDays, centerDate]);

  // Only show goal progress when viewing starts on a Monday (full week view)
  const showGoalProgress = useMemo(() => isMonday(leftmostVisibleDate), [leftmostVisibleDate]);

  // Calculate goal progress for the visible week (only when aligned to Monday)
  /* istanbul ignore next -- goal progress display depends on day of week, tested via HabitsScreen */
  const goalProgress = useMemo(() => {
    if (!showGoalProgress || !habitMeta?.goal) {
      return null;
    }

    const weekStart = leftmostVisibleDate;
    const weekEnd = addDays(weekStart, 6);

    const completedInWeek = habitItems.filter(item => {
      const itemDate = parseISO(item.date);
      return item.status === "done" &&
        isWithinInterval(itemDate, { start: weekStart, end: weekEnd });
    }).length;

    return {
      completed: completedInWeek,
      total: habitMeta.goal,
    };
  }, [habitItems, habitMeta?.goal, leftmostVisibleDate, showGoalProgress]);

  // Render item - passes only habitId and date, not the whole item
  const renderItem = useCallback(({ item }: { item: DateItem }) => (
    <ScrollableDayItem
      habitId={habitId}
      date={item.date}
      dayWidth={dayWidth}
      scrollAnimValue={scrollAnimValue}
    />
  ), [habitId, dayWidth, scrollAnimValue]);

  const keyExtractor = useCallback((item: DateItem) => `${habitId}-${item.dateKey}`, [habitId]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: dayWidth,
    offset: dayWidth * index,
    index,
  }), [dayWidth]);

  const handleSaveHabit = useCallback((title: string, goal: number, noteTemplate?: string) => {
    dispatch(updateHabit({ id: habitId, title, goal, noteTemplate }));
    setConfigModalVisible(false);
    syncHabit?.(habitId);
  }, [habitId, dispatch, syncHabit]);

  const handleRemoveHabit = useCallback(() => {
    dispatch(removeHabit({ habitId }));
    setConfigModalVisible(false);
    syncHabit?.(habitId);
  }, [habitId, dispatch, syncHabit]);

  // Drag animation style
  const dragStyle = useMemo(() => ({
    ...Platform.select({
      ios: {
        transform: [
          {
            scale: dragAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.05],
            }),
          },
        ],
        shadowRadius: dragAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 8],
        }),
        shadowOpacity: dragAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.3],
        }),
      },
      android: {
        transform: [
          {
            scale: dragAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.03],
            }),
          },
        ],
        elevation: dragAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 6],
        }),
      },
    }),
  }), [dragAnimation]);

  if (!habitMeta) {
    return null;
  }

  const content = (
    <Animated.View style={[styles.container, dragStyle]} testID="scrollable-habit-container">
      <ConfigureHabitModal
        visible={configModalVisible}
        defaultValues={{ title: habitMeta.title, goal: habitMeta.goal, noteTemplate: habitMeta.noteTemplate }}
        onSave={handleSaveHabit}
        onClose={() => setConfigModalVisible(false)}
        onRemove={handleRemoveHabit}
      />
      <Spacer size={8} />
      <View style={styles.headerContainer}>
        <HeaderComponent
          title={habitMeta.title}
          goalProgress={goalProgress ? `${goalProgress.completed}/${goalProgress.total}` : null}
          onCogPress={() => setConfigModalVisible(true)}
          onCalendarPress={() => navigation.navigate("MonthlyView", { habitId, habitTitle: habitMeta.title })}
          accessibilityLabel={`Configure habit ${habitMeta.title}`}
        />
      </View>
      <View style={styles.itemsContainer}>
        <FlatList
          ref={flatListRef}
          data={dateItems}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          scrollEnabled={userScrollEnabled}
          showsHorizontalScrollIndicator={false}
          getItemLayout={getItemLayout}
          initialScrollIndex={bufferDays}
          // Only attach scroll handlers if user scrolling is enabled
          {...(userScrollEnabled && {
            onScroll: handleScroll,
            onScrollBeginDrag: handleScrollBegin,
            onScrollEndDrag: handleScrollEnd,
            onMomentumScrollEnd: handleScrollEnd,
          })}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          maxToRenderPerBatch={14}
          windowSize={5}
          initialNumToRender={14}
        />
      </View>
    </Animated.View>
  );

  // Wrap with TouchableOpacity for drag support
  if (onDrag) {
    return (
      <TouchableOpacity
        onLongPress={onDrag}
        delayLongPress={200}
        activeOpacity={1}
        disabled={isActive}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export const ScrollableHabitRow = React.memo(ScrollableHabitRowComponent);
ScrollableHabitRow.displayName = "ScrollableHabitRow";
