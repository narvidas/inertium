import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import React, { FC, useCallback, useState } from "react";
import { Text, TouchableHighlight, View } from "react-native";
import { useDispatch } from "react-redux";
import { updateOrCreateItem } from "../../../Habits/habits.slice";
import { Item, Status } from "../../../Habits/types";
import { ItemModal } from "../../../Habits/HabitComponent/ItemComponent/ItemModal";
import { styles } from "./ScrollableDayItem.styles";

const getStyle = (status: Status) => {
  if (status === "done") return styles.done;
  if (status === "fail") return styles.fail;
  return null;
};

interface Props {
  habitId: string;
  item: Item;
  dayWidth: number;
}

export const ScrollableDayItem: FC<Props> = React.memo(({ habitId, item, dayWidth }) => {
  const dispatch = useDispatch();
  const [itemModalVisible, setItemModalVisible] = useState(false);

  const date = parseISO(item.date);
  const dayOfWeekWord = format(date, "EEE"); // E.g. 'SUN' for Sunday
  const dayOfMonthNumber = format(date, "d"); // E.g. '14' for 14th December
  const notesExist = item.notes && item.notes !== "";

  const updateStatus = useCallback(() => {
    let newStatus: Status = "default";
    if (item.status === "default") newStatus = "done";
    if (item.status === "done") newStatus = "fail";
    if (item.status === "fail") newStatus = "default";

    const newItem = { ...item, status: newStatus };
    dispatch(updateOrCreateItem({ habitId, item: newItem }));
  }, [item, habitId, dispatch]);

  const handleSaveNotes = useCallback((notes: string) => {
    dispatch(updateOrCreateItem({ habitId, item: { ...item, notes } }));
  }, [item, habitId, dispatch]);

  const handleLongPress = useCallback(() => {
    setItemModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setItemModalVisible(false);
  }, []);

  return (
    <>
      <ItemModal
        defaultValues={{ notes: item.notes }}
        visible={itemModalVisible}
        onSave={handleSaveNotes}
        onClose={handleCloseModal}
      />
      <TouchableHighlight
        activeOpacity={1}
        underlayColor="rgba(0,0,0,0.25)"
        style={[styles.box, { width: dayWidth, height: dayWidth }, getStyle(item.status)]}
        onPress={updateStatus}
        onLongPress={handleLongPress}
      >
        <View style={styles.dateContainer} testID="scrollable-item-container">
          <Text style={[styles.dayOfWeekWord, getStyle(item.status)]}>{dayOfWeekWord}</Text>
          <Text style={[styles.dayOfMonthNumber, getStyle(item.status)]}>{dayOfMonthNumber}</Text>
          {notesExist ? <Text style={styles.notesDot}>{`.`}</Text> : null}
        </View>
      </TouchableHighlight>
    </>
  );
});

ScrollableDayItem.displayName = "ScrollableDayItem";

