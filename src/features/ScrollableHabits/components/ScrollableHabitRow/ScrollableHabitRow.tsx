import addDays from "date-fns/addDays";
import formatISO from "date-fns/formatISO";
import isSameDay from "date-fns/isSameDay";
import parseISO from "date-fns/parseISO";
import React, { FC, useCallback, useContext, useMemo, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Spacer } from "../../../../components/Spacer/Spacer";
import SyncContext from "../../../../config/remote/syncContext";
import { generatePushID } from "../../../../utils/generatePushID";
import { habitSelector, removeHabit, updateHabit } from "../../../Habits/habits.slice";
import { ConfigureHabitModal } from "../../../Habits/HabitComponent/ConfigureHabitModal";
import { HeaderComponent } from "../../../Habits/HabitComponent/HeaderComponent";
import { Habit, Item } from "../../../Habits/types";
import { useScrollViewSync } from "../../context";
import { HabitDayItemData } from "../../types";
import { ScrollableDayItem } from "../ScrollableDayItem";
import { styles } from "./ScrollableHabitRow.styles";

// Create an unrecorded item for a date (same as original HabitComponent)
const createUnrecordedItem = (date: Date): Item => {
  return {
    id: generatePushID(),
    date: formatISO(date),
    notes: "",
    status: "default",
    meta: {
      isDeleted: false,
      lastUpdatedOn: formatISO(new Date()),
      createdOn: formatISO(new Date()),
    },
  };
};

// Find existing item or create a new unrecorded one
const getItemForDate = (habit: Habit, date: Date): Item => {
  const existing = habit.items.find(item =>
    isSameDay(parseISO(item.date), date)
  );
  return existing || createUnrecordedItem(date);
};

interface Props {
  habit: Habit;
  scrollViewId: string;
  /** 
   * Whether user can scroll this row directly. 
   * When false, row only syncs via calendar strip scroll.
   * @default false 
   */
  userScrollEnabled?: boolean;
}

export const ScrollableHabitRow: FC<Props> = ({ habit, scrollViewId, userScrollEnabled = false }) => {
  const dispatch = useDispatch();
  const flatListRef = useRef<FlatList<HabitDayItemData>>(null);
  const { syncHabit } = useContext(SyncContext);
  const [configModalVisible, setConfigModalVisible] = useState(false);

  // Watch for habit changes to trigger sync
  const habitFromStore = useSelector(habitSelector(habit.id));

  const {
    dayWidth,
    bufferDays,
    centerDate,
    handleScroll,
    handleScrollBegin,
    handleScrollEnd,
  } = useScrollViewSync(scrollViewId, flatListRef);

  // Sync habit when it changes
  React.useEffect(() => {
    if (habitFromStore && syncHabit) {
      syncHabit(habit.id);
    }
  }, [habitFromStore, syncHabit, habit.id]);

  // Generate items for the virtualized list - each item pairs a date with the habit's item for that date
  const items = useMemo((): HabitDayItemData[] => {
    const result: HabitDayItemData[] = [];
    for (let i = -bufferDays; i <= bufferDays; i++) {
      const date = addDays(centerDate, i);
      const item = getItemForDate(habit, date);
      result.push({
        date,
        isToday: i === 0,
        dateKey: formatISO(date, { representation: "date" }),
        habitId: habit.id,
        item,
      });
    }
    return result;
  }, [centerDate, bufferDays, habit]);

  // Calculate goal progress across visible week (approximation using items)
  const goalProgress = useMemo(() => {
    // Count 'done' items in the last 7 days around today
    const sevenDaysAgo = addDays(centerDate, -6);
    const completedInWeek = habit.items.filter(item => {
      const itemDate = parseISO(item.date);
      return item.status === "done" &&
        itemDate >= sevenDaysAgo &&
        itemDate <= centerDate;
    }).length;
    return {
      completed: completedInWeek,
      total: habit.goal || 0,
    };
  }, [habit.items, habit.goal, centerDate]);

  const renderItem = useCallback(({ item }: { item: HabitDayItemData }) => (
    <ScrollableDayItem
      habitId={item.habitId}
      item={item.item}
      dayWidth={dayWidth}
    />
  ), [dayWidth]);

  const keyExtractor = useCallback((item: HabitDayItemData) => `${item.habitId}-${item.dateKey}`, []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: dayWidth,
    offset: dayWidth * index,
    index,
  }), [dayWidth]);

  const handleSaveHabit = useCallback((title: string, goal: number) => {
    dispatch(updateHabit({ id: habit.id, title, goal }));
    setConfigModalVisible(false);
  }, [habit.id, dispatch]);

  const handleRemoveHabit = useCallback(() => {
    dispatch(removeHabit({ habitId: habit.id }));
    setConfigModalVisible(false);
  }, [habit.id, dispatch]);

  return (
    <View style={styles.container} testID="scrollable-habit-container">
      <ConfigureHabitModal
        visible={configModalVisible}
        defaultValues={{ title: habit.title, goal: habit.goal }}
        onSave={handleSaveHabit}
        onClose={() => setConfigModalVisible(false)}
        onRemove={handleRemoveHabit}
      />
      <Spacer size={8} />
      <View style={styles.headerContainer}>
        <HeaderComponent
          title={`${habit.title} (${goalProgress.completed}/${goalProgress.total})`}
          accessibilityLabel={`Configure habit ${habit.title}`}
          onCogPress={() => setConfigModalVisible(true)}
        />
      </View>
      <View style={styles.itemsContainer}>
        <FlatList
          ref={flatListRef}
          data={items}
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
    </View>
  );
};

ScrollableHabitRow.displayName = "ScrollableHabitRow";

