import addDays from "date-fns/addDays";
import isSameDay from "date-fns/isSameDay";
import isWithinInterval from "date-fns/isWithinInterval";
import { List, ListItem } from "native-base";
import React, { FC } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Spacer from "../../../components/Spacer";
import { Habit, Item } from "../types";
import { HeaderComponent } from "./HeaderComponent";
import { ItemComponent } from "./ItemComponent";

const DAYS_IN_WEEK = 7;

const getRecordedItemsForThisWeek = (items: Item[], startOfWeek: Date) => {
  const endOfWeek = addDays(startOfWeek, DAYS_IN_WEEK);

  return items.filter(item => isWithinInterval(item.date, { start: startOfWeek, end: endOfWeek }));
};

interface OwnProps {
  startOfWeek: Date;
}

type Props = Habit & OwnProps;

export const HabitComponent: FC<Props> = ({ key, items, title, goal, startOfWeek }) => {
  const recordedItemsForThisWeek = getRecordedItemsForThisWeek(items, startOfWeek);

  const weekItems = [...Array(DAYS_IN_WEEK)].map((_, index) => {
    const itemDate = addDays(startOfWeek, index);
    const recordedItem = recordedItemsForThisWeek.find(item => isSameDay(itemDate, item.date));

    const unrecordedItem: Item = {
      key: `habit-${key}-item-${index}`,
      date: itemDate,
      notes: "",
      status: "default",
    };

    return recordedItem || unrecordedItem;
  });

  const renderItem = (item: Item) => (
    <ListItem style={styles.list}>
      <ItemComponent {...item} defaultStatus={item.status} />
    </ListItem>
  );

  const completedGoalCount = weekItems.filter(item => item.status === "done")?.length || 0;
  const totalGoalCount = goal || 0;

  return (
    <View>
      <Spacer size={15} />
      <View style={styles.container}>
        <HeaderComponent
          title={`${title} (${completedGoalCount}/${totalGoalCount})`}
          onCogPress={() => {
            /*open habit modal */
          }}
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

const boxWH = Dimensions.get("window").width / 8;
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: boxWH / 2,
  },
  list: {
    padding: 0,
    borderBottomWidth: 0,
    marginLeft: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginRight: 0,
  },
});
