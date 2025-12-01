import formatISO from "date-fns/formatISO";
import isSameDay from "date-fns/isSameDay";
import parseISO from "date-fns/parseISO";
import React, { FC, useCallback, useMemo, useState } from "react";
import { Text, TouchableHighlight, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../config/rtk/rootReducer";
import { updateOrCreateItem } from "../../../Habits/habits.slice";
import { Item, Status } from "../../../Habits/types";
import { ItemModal } from "../../../Habits/HabitComponent/ItemComponent/ItemModal";
import { generatePushID } from "../../../../utils/generatePushID";
import { styles } from "./MonthDayCell.styles";

interface Props {
  habitId: string;
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const getStatusStyle = (status: Status | undefined) => {
  if (status === "done") return styles.cellDone;
  if (status === "fail") return styles.cellFail;
  return styles.cellDefault;
};

const getTextStyle = (status: Status | undefined) => {
  if (status === "done") return styles.dayNumberDone;
  if (status === "fail") return styles.dayNumberFail;
  return null;
};

const getNotesStyle = (status: Status | undefined) => {
  if (status === "done") return styles.notesDotDone;
  if (status === "fail") return styles.notesDotFail;
  return null;
};

// Selector to get just the item for this specific date - memoized per cell
const makeSelectItemForDate = () => (state: RootState, habitId: string, date: Date): Item | undefined => {
  const habit = state.habitsState.habits[habitId];
  if (!habit) return undefined;
  return habit.items.find((item) => isSameDay(parseISO(item.date), date));
};

// Empty placeholder for days outside current month - extracted to avoid re-renders
const EmptyDayCellComponent: FC<{ dayOfMonth: number }> = ({ dayOfMonth }) => (
  <View style={styles.cellContainer}>
    <View style={[styles.cell, styles.cellEmpty]}>
      <Text style={[styles.dayNumber, styles.dayNumberOutside]}>{dayOfMonth}</Text>
    </View>
  </View>
);

const EmptyDayCell = React.memo(EmptyDayCellComponent);
EmptyDayCell.displayName = "EmptyDayCell";

const MonthDayCellComponent: FC<Props> = ({ habitId, date, dayOfMonth, isCurrentMonth, isToday }) => {
  const dispatch = useDispatch();
  const [itemModalVisible, setItemModalVisible] = useState(false);

  // Create selector once per component instance
  const selectItemForDate = useMemo(makeSelectItemForDate, []);

  // Subscribe to just this cell's item - only re-renders when THIS item changes
  const item = useSelector((state: RootState) => selectItemForDate(state, habitId, date));

  // For days outside current month, render empty placeholder
  if (!isCurrentMonth) {
    return <EmptyDayCell dayOfMonth={dayOfMonth} />;
  }

  const status = item?.status ?? "default";
  const notesExist = item?.notes && item.notes !== "";

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

  const handleSaveNotes = useCallback(
    (notes: string) => {
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
    },
    [item, habitId, dispatch, date]
  );

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
      <View style={styles.cellContainer}>
        <TouchableHighlight
          activeOpacity={1}
          underlayColor="rgba(0,0,0,0.25)"
          style={[
            styles.cell,
            getStatusStyle(status),
            isToday && styles.cellToday,
          ]}
          onPress={updateStatus}
          onLongPress={handleLongPress}
          testID="month-day-cell"
        >
          <View style={styles.dateContainer}>
            <Text style={[styles.dayNumber, getTextStyle(status)]}>{dayOfMonth}</Text>
            {notesExist && (
              <Text style={[styles.notesDot, getNotesStyle(status)]}>.</Text>
            )}
          </View>
        </TouchableHighlight>
      </View>
    </>
  );
};

export const MonthDayCell = React.memo(MonthDayCellComponent);
MonthDayCell.displayName = "MonthDayCell";

