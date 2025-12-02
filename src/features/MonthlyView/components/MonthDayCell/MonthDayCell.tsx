import formatISO from "date-fns/formatISO";
import isSameDay from "date-fns/isSameDay";
import parseISO from "date-fns/parseISO";
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../config/rtk/rootReducer";
import { updateOrCreateItem } from "../../../ScrollableHabits/habits.slice";
import { Item, Status } from "../../../ScrollableHabits/types";
import { ItemModal } from "../../../ScrollableHabits/components/ItemModal";
import { generatePushID } from "../../../../utils/generatePushID";
import { styles } from "./MonthDayCell.styles";

// Helper to cycle through statuses
const getNextStatus = (current: Status): Status => {
  if (current === "default") return "done";
  if (current === "done") return "fail";
  return "default";
};

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

  // OPTIMISTIC UPDATE: Local state for immediate visual feedback
  // null means "use Redux state", otherwise use the optimistic value
  const [optimisticStatus, setOptimisticStatus] = useState<Status | null>(null);

  // Track pending dispatch to avoid double-dispatches
  const pendingDispatchRef = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(null);

  // Sync optimistic state with Redux when Redux catches up
  useEffect(() => {
    if (optimisticStatus !== null && item?.status === optimisticStatus) {
      // Redux has caught up, clear optimistic state
      setOptimisticStatus(null);
    }
  }, [item?.status, optimisticStatus]);

  // For days outside current month, render empty placeholder
  if (!isCurrentMonth) {
    return <EmptyDayCell dayOfMonth={dayOfMonth} />;
  }

  // Use optimistic status if set, otherwise fall back to Redux state
  const status = optimisticStatus ?? item?.status ?? "default";
  const notesExist = item?.notes && item.notes !== "";

  const updateStatus = useCallback(() => {
    // Cancel any pending dispatch from rapid taps
    if (pendingDispatchRef.current) {
      pendingDispatchRef.current.cancel();
    }

    // Calculate next status from current displayed status (optimistic or Redux)
    const currentStatus = optimisticStatus ?? item?.status ?? "default";
    const newStatus = getNextStatus(currentStatus);

    // IMMEDIATE: Update UI optimistically
    setOptimisticStatus(newStatus);

    // DEFERRED: Dispatch to Redux after interactions complete
    pendingDispatchRef.current = InteractionManager.runAfterInteractions(() => {
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
      pendingDispatchRef.current = null;
    });
  }, [item, habitId, dispatch, date, optimisticStatus]);

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
        <TouchableOpacity
          activeOpacity={0.6}
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
        </TouchableOpacity>
      </View>
    </>
  );
};

export const MonthDayCell = React.memo(MonthDayCellComponent);
MonthDayCell.displayName = "MonthDayCell";

