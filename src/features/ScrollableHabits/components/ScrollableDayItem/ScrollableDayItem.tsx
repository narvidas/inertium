import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import React, { FC, useCallback, useMemo, useState } from "react";
import { Animated, TouchableHighlight, View } from "react-native";
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
  /** Animated value (0-1) for scroll state - text fades when scrolling */
  scrollAnimValue?: Animated.Value;
}

export const ScrollableDayItem: FC<Props> = React.memo(({ habitId, item, dayWidth, scrollAnimValue }) => {
  const dispatch = useDispatch();
  const [itemModalVisible, setItemModalVisible] = useState(false);

  const date = parseISO(item.date);
  const dayOfWeekWord = format(date, "EEE"); // E.g. 'SUN' for Sunday
  const dayOfMonthNumber = format(date, "d"); // E.g. '14' for 14th December
  const notesExist = item.notes && item.notes !== "";

  // Interpolate: when scrollAnimValue is 1 (scrolling), text fades to 20% opacity
  const textOpacity = useMemo(() =>
    scrollAnimValue?.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.20],
    }),
    [scrollAnimValue]);

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
        <Animated.View
          style={[styles.dateContainer, textOpacity && { opacity: textOpacity }]}
          testID="scrollable-item-container"
        >
          <Animated.Text style={[styles.dayOfWeekWord, getStyle(item.status)]}>{dayOfWeekWord}</Animated.Text>
          <Animated.Text style={[styles.dayOfMonthNumber, getStyle(item.status)]}>{dayOfMonthNumber}</Animated.Text>
          {notesExist ? <Animated.Text style={styles.notesDot}>{`.`}</Animated.Text> : null}
        </Animated.View>
      </TouchableHighlight>
    </>
  );
});

ScrollableDayItem.displayName = "ScrollableDayItem";

