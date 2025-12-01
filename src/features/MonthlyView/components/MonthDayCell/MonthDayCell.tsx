import React, { FC, useCallback, useState } from "react";
import { Text, TouchableHighlight, View } from "react-native";
import { useDispatch } from "react-redux";
import { updateOrCreateItem } from "../../../Habits/habits.slice";
import { Item, Status } from "../../../Habits/types";
import { ItemModal } from "../../../Habits/HabitComponent/ItemComponent/ItemModal";
import { MonthDayData } from "../../types";
import { styles } from "./MonthDayCell.styles";

interface Props {
  habitId: string;
  dayData: MonthDayData;
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

export const MonthDayCell: FC<Props> = ({ habitId, dayData }) => {
  const dispatch = useDispatch();
  const [itemModalVisible, setItemModalVisible] = useState(false);

  const { dayOfMonth, isCurrentMonth, isToday, item } = dayData;

  // For days outside current month, render empty placeholder
  if (!isCurrentMonth) {
    return (
      <View style={styles.cellContainer}>
        <View style={[styles.cell, styles.cellEmpty]}>
          <Text style={[styles.dayNumber, styles.dayNumberOutside]}>{dayOfMonth}</Text>
        </View>
      </View>
    );
  }

  const status = item?.status;
  const notesExist = item?.notes && item.notes !== "";

  const updateStatus = useCallback(() => {
    if (!item) return;

    let newStatus: Status = "default";
    if (item.status === "default") newStatus = "done";
    if (item.status === "done") newStatus = "fail";
    if (item.status === "fail") newStatus = "default";

    const newItem = { ...item, status: newStatus };
    dispatch(updateOrCreateItem({ habitId, item: newItem }));
  }, [item, habitId, dispatch]);

  const handleSaveNotes = useCallback(
    (notes: string) => {
      if (!item) return;
      dispatch(updateOrCreateItem({ habitId, item: { ...item, notes } }));
    },
    [item, habitId, dispatch]
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

MonthDayCell.displayName = "MonthDayCell";

