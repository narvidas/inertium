import format from "date-fns/format";
import formatISO from "date-fns/formatISO";
import isSameDay from "date-fns/isSameDay";
import parseISO from "date-fns/parseISO";
import React, { FC, useCallback, useMemo, useState } from "react";
import { Animated, TouchableHighlight, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../config/rtk/rootReducer";
import { generatePushID } from "../../../../utils/generatePushID";
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
  date: Date;
  dayWidth: number;
  /** Animated value (0-1) for scroll state - text fades when scrolling */
  scrollAnimValue?: Animated.Value;
}

// Selector to get just the item for this specific date - memoized per cell
const makeSelectItemForDate = () => (state: RootState, habitId: string, date: Date): Item | undefined => {
  const habit = state.habitsState.habits[habitId];
  if (!habit) return undefined;
  return habit.items.find((item) => isSameDay(parseISO(item.date), date));
};

const ScrollableDayItemComponent: FC<Props> = ({ habitId, date, dayWidth, scrollAnimValue }) => {
  const dispatch = useDispatch();
  const [itemModalVisible, setItemModalVisible] = useState(false);

  // Create selector once per component instance
  const selectItemForDate = useMemo(makeSelectItemForDate, []);

  // Subscribe to just this cell's item - only re-renders when THIS item changes
  const item = useSelector((state: RootState) => selectItemForDate(state, habitId, date));

  const dayOfWeekWord = format(date, "EEE"); // E.g. 'SUN' for Sunday
  const dayOfMonthNumber = format(date, "d"); // E.g. '14' for 14th December

  const status = item?.status ?? "default";
  const notesExist = item?.notes && item.notes !== "";

  // Interpolate: when scrollAnimValue is 1 (scrolling), text fades to 20% opacity
  const textOpacity = useMemo(() =>
    scrollAnimValue?.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.20],
    }),
    [scrollAnimValue]);

  const updateStatus = useCallback(() => {
    let newStatus: Status = "default";
    const currentStatus = item?.status ?? "default";
    if (currentStatus === "default") newStatus = "done";
    if (currentStatus === "done") newStatus = "fail";
    if (currentStatus === "fail") newStatus = "default";

    // Create item only when needed (not on every render)
    const newItem: Item = item
      ? { ...item, status: newStatus }
      : {
        id: generatePushID(),
        date: formatISO(date),
        notes: "",
        status: newStatus,
        meta: {
          isDeleted: false,
          lastUpdatedOn: formatISO(new Date()),
          createdOn: formatISO(new Date()),
        },
      };
    dispatch(updateOrCreateItem({ habitId, item: newItem }));
  }, [item, habitId, dispatch, date]);

  const handleSaveNotes = useCallback((notes: string) => {
    const newItem: Item = item
      ? { ...item, notes }
      : {
        id: generatePushID(),
        date: formatISO(date),
        notes,
        status: "default",
        meta: {
          isDeleted: false,
          lastUpdatedOn: formatISO(new Date()),
          createdOn: formatISO(new Date()),
        },
      };
    dispatch(updateOrCreateItem({ habitId, item: newItem }));
  }, [item, habitId, dispatch, date]);

  const handleLongPress = useCallback(() => {
    setItemModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setItemModalVisible(false);
  }, []);

  return (
    <>
      <ItemModal
        defaultValues={{ notes: item?.notes || "" }}
        visible={itemModalVisible}
        onSave={handleSaveNotes}
        onClose={handleCloseModal}
      />
      <TouchableHighlight
        activeOpacity={1}
        underlayColor="rgba(0,0,0,0.25)"
        style={[styles.box, { width: dayWidth, height: dayWidth }, getStyle(status)]}
        onPress={updateStatus}
        onLongPress={handleLongPress}
      >
        <Animated.View
          style={[styles.dateContainer, textOpacity && { opacity: textOpacity }]}
          testID="scrollable-item-container"
        >
          <Animated.Text style={[styles.dayOfWeekWord, getStyle(status)]}>{dayOfWeekWord}</Animated.Text>
          <Animated.Text style={[styles.dayOfMonthNumber, getStyle(status)]}>{dayOfMonthNumber}</Animated.Text>
          {notesExist ? <Animated.Text style={styles.notesDot}>{`.`}</Animated.Text> : null}
        </Animated.View>
      </TouchableHighlight>
    </>
  );
};

export const ScrollableDayItem = React.memo(ScrollableDayItemComponent);
ScrollableDayItem.displayName = "ScrollableDayItem";
