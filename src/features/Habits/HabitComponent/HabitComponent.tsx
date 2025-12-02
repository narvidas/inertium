import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import addDays from "date-fns/addDays";
import formatISO from "date-fns/formatISO";
import isSameDay from "date-fns/isSameDay";
import isWithinInterval from "date-fns/isWithinInterval";
import parseISO from "date-fns/parseISO";
import { List, ListItem } from "../../../ui";
import React, { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Spacer } from "../../../components/Spacer/Spacer";
import SyncContext from "../../../config/remote/syncContext";
import { generatePushID } from "../../../utils/generatePushID";
import { habitSelector, removeHabit, updateHabit } from "../habits.slice";
import { HabitsStackParamList } from "../HabitsStackNavigation";
import { Habit, Item } from "../types";
import { ConfigureHabitModal } from "./ConfigureHabitModal";
import { styles } from "./HabitComponent.styles";
import { HeaderComponent } from "./HeaderComponent";
import { ItemComponent } from "./ItemComponent";

type NavigationProp = NativeStackNavigationProp<HabitsStackParamList, "HabitsList">;

const DAYS_IN_WEEK = 7;

const unrecordedItem = (date: Date): Item => {
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

const filterInGivenWeek = (items: Item[], startOfWeek: Date) => {
  const endOfWeek = addDays(startOfWeek, DAYS_IN_WEEK);
  return items.filter(item => isWithinInterval(parseISO(item.date), { start: startOfWeek, end: endOfWeek }));
};

const backfillWeekItems = (recordedItems: Item[], startOfWeek: Date) => {
  const emptyWeekArray = [...Array(DAYS_IN_WEEK)];

  return emptyWeekArray.map((_, index) => {
    const itemDate = addDays(startOfWeek, index);
    const recordedItem = recordedItems.find(item => isSameDay(itemDate, parseISO(item.date)));
    return recordedItem || unrecordedItem(itemDate);
  });
};

interface OwnProps {
  habitId: string;
  startOfWeek: Date;
}

type Props = Habit & OwnProps;

export const HabitComponent: FC<Props> = ({ habitId, items, title, goal, startOfWeek }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const habit = useSelector(habitSelector(habitId));
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const { syncHabit } = useContext(SyncContext);

  // Track previous habit for change detection - null triggers initial sync
  const prevHabitRef = useRef<typeof habit | null>(null);
  // Debounced sync timer ref
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync habit when it changes - DEBOUNCED to avoid network spam on rapid taps
  useEffect(() => {
    if (habit !== prevHabitRef.current && habit && syncHabit) {
      prevHabitRef.current = habit;

      // Clear any pending sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Debounce sync by 100ms - short enough for tests, long enough to batch rapid taps
      syncTimeoutRef.current = setTimeout(() => {
        syncHabit(habitId);
        syncTimeoutRef.current = null;
      }, 100);
    }

    // Cleanup on unmount
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [habit, syncHabit, habitId]);

  const weekItems = useMemo(() => {
    const recordedItemsForThisWeek = filterInGivenWeek(items, startOfWeek);
    const weekItems = backfillWeekItems(recordedItemsForThisWeek, startOfWeek);

    return weekItems;
  }, [items, startOfWeek]);

  const renderItem = (item: Item) => (
    <ListItem style={styles.list}>
      <ItemComponent {...item} habitId={habitId} />
    </ListItem>
  );

  const completedGoalCount = weekItems.filter(item => item.status === "done")?.length || 0;
  const totalGoalCount = goal || 0;

  // Handler for save - sync immediately since component may not see the change before navigation
  const handleSave = (newTitle: string, newGoal: number) => {
    dispatch(updateHabit({ id: habitId, title: newTitle, goal: newGoal }));
    setConfigModalVisible(false);
    syncHabit?.(habitId);
  };

  // Handler for remove - sync immediately since component will unmount
  const handleRemove = () => {
    dispatch(removeHabit({ habitId }));
    setConfigModalVisible(false);
    syncHabit?.(habitId);
  };

  return (
    <View>
      <ConfigureHabitModal
        visible={configModalVisible}
        defaultValues={{ title, goal }}
        onSave={handleSave}
        onClose={() => setConfigModalVisible(false)}
        onRemove={handleRemove}
      />
      <Spacer size={15} />
      <View style={styles.container} testID="habit-container">
        <HeaderComponent
          title={title}
          goalProgress={`${completedGoalCount}/${totalGoalCount}`}
          accessibilityLabel={`Configure habit ${title}`}
          onCogPress={() => setConfigModalVisible(true)}
          onCalendarPress={() => navigation.navigate("MonthlyView", { habitId, habitTitle: title })}
        />
        <List
          dataArray={weekItems}
          horizontal
          scrollEnabled={false}
          removeClippedSubviews={false}
          style={styles.list}
          renderRow={renderItem}
        />
      </View>
    </View>
  );
};
