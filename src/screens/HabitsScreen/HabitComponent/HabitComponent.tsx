import addDays from "date-fns/addDays";
import formatISO from "date-fns/formatISO";
import isSameDay from "date-fns/isSameDay";
import isWithinInterval from "date-fns/isWithinInterval";
import parseISO from "date-fns/parseISO";
import { List, ListItem } from "native-base";
import React, { FC, useMemo, useState } from "react";
import { View } from "react-native";
import { useDispatch } from "react-redux";
import { Spacer } from "../../../components/Spacer/Spacer";
import { removeHabit, updateHabit } from "../habits.slice";
import { Habit, Item } from "../types";
import { ConfigureHabitModal } from "./ConfigureHabitModal";
import { styles } from "./HabitComponent.styles";
import { HeaderComponent } from "./HeaderComponent";
import { ItemComponent } from "./ItemComponent";

const DAYS_IN_WEEK = 7;

const getRecordedItemsForThisWeek = (items: Item[], startOfWeek: Date) => {
  const endOfWeek = addDays(startOfWeek, DAYS_IN_WEEK);

  return items.filter(item => isWithinInterval(parseISO(item.date), { start: startOfWeek, end: endOfWeek }));
};

interface OwnProps {
  habitId: string;
  startOfWeek: Date;
}

type Props = Habit & OwnProps;

export const HabitComponent: FC<Props> = ({ habitId, items, title, goal, startOfWeek }) => {
  const dispatch = useDispatch();
  const [configModalVisible, setConfigModalVisible] = useState(false);

  const weekItems = useMemo(() => {
    const recordedItemsForThisWeek = getRecordedItemsForThisWeek(items, startOfWeek);

    const emptyWeekArray = [...Array(DAYS_IN_WEEK)];
    return emptyWeekArray.map((_, index) => {
      const itemDate = addDays(startOfWeek, index);
      const recordedItem = recordedItemsForThisWeek.find(item => isSameDay(itemDate, parseISO(item.date)));

      const unrecordedItem: Item = {
        id: `habit-${habitId}-item-${index}`,
        date: formatISO(itemDate),
        status: "default",
      };

      return recordedItem || unrecordedItem;
    });
  }, [items, startOfWeek]);

  const renderItem = (item: Item) => (
    <ListItem style={styles.list}>
      <ItemComponent {...item} habitId={habitId} defaultStatus={item.status} />
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
          dispatch(updateHabit({ habitId, title, goal }));
          setConfigModalVisible(false);
        }}
        onClose={() => setConfigModalVisible(false)}
        onRemove={() => {
          dispatch(removeHabit({ habitId }));
          setConfigModalVisible(false);
        }}
      />
      <Spacer size={15} />
      <View style={styles.container}>
        <HeaderComponent
          title={`${title} (${completedGoalCount}/${totalGoalCount})`}
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
