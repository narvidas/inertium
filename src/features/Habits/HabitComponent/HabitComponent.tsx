import addDays from "date-fns/addDays";
import formatISO from "date-fns/formatISO";
import isSameDay from "date-fns/isSameDay";
import isWithinInterval from "date-fns/isWithinInterval";
import parseISO from "date-fns/parseISO";
import { List, ListItem } from "native-base";
import React, { FC, useContext, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Spacer } from "../../../components/Spacer/Spacer";
import SyncContext from "../../../config/remote/syncContext";
import { generatePushID } from "../../../utils/generatePushID";
import { habitSelector, removeHabit, updateHabit } from "../habits.slice";
import { Habit, Item } from "../types";
import { ConfigureHabitModal } from "./ConfigureHabitModal";
import { styles } from "./HabitComponent.styles";
import { HeaderComponent } from "./HeaderComponent";
import { ItemComponent } from "./ItemComponent";

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
  const habit = useSelector(habitSelector(habitId));
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const { syncHabit } = useContext(SyncContext);

  useEffect(() => {
    habit && syncHabit(habitId);
  }, [habit]);

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

  return (
    <View>
      <ConfigureHabitModal
        visible={configModalVisible}
        defaultValues={{ title, goal }}
        onSave={(title, goal) => {
          dispatch(updateHabit({ id: habitId, title, goal }));
          setConfigModalVisible(false);
        }}
        onClose={() => setConfigModalVisible(false)}
        onRemove={() => {
          dispatch(removeHabit({ habitId }));
          setConfigModalVisible(false);
        }}
      />
      <Spacer size={15} />
      <View style={styles.container} testID="habit-container">
        <HeaderComponent
          title={`${title} (${completedGoalCount}/${totalGoalCount})`}
          accessibilityLabel={`Configure habit ${title}`}
          onCogPress={() => setConfigModalVisible(true)}
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
