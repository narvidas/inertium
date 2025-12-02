import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { InteractionManager, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { updateOrCreateItem } from "../../habits.slice";
import { Item, Status } from "../../types";
import { styles } from "./ItemComponent.styles";
import { ItemModal } from "./ItemModal";

const getStyle = (status: Status) => {
  if (status === "done") return styles.done;
  if (status === "fail") return styles.fail;
  return null;
};

// Helper to cycle through statuses
const getNextStatus = (current: Status): Status => {
  if (current === "default") return "done";
  if (current === "done") return "fail";
  return "default";
};

interface OwnProps {
  habitId: string;
}

type Props = Item & OwnProps;

export const ItemComponent: FC<Props> = ({ habitId, ...item }) => {
  const dispatch = useDispatch();
  const [itemModalVisible, setItemModalVisible] = useState(false);

  // OPTIMISTIC UPDATE: Local state for immediate visual feedback
  // null means "use props state", otherwise use the optimistic value
  const [optimisticStatus, setOptimisticStatus] = useState<Status | null>(null);

  // Track pending dispatch to avoid double-dispatches
  const pendingDispatchRef = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(null);

  // Sync optimistic state with props when props catch up
  useEffect(() => {
    if (optimisticStatus !== null && item.status === optimisticStatus) {
      // Props have caught up, clear optimistic state
      setOptimisticStatus(null);
    }
  }, [item.status, optimisticStatus]);

  const date = parseISO(item.date);
  const dayOfWeekWord = format(date, "EEE"); // E.g. 'SUN' for Sunday
  const dayOfMonthNumber = format(date, "d"); // E.g. '14' for 14th December
  const notesExist = item.notes && item.notes !== "";

  // Use optimistic status if set, otherwise fall back to props
  const displayStatus = optimisticStatus ?? item.status;

  const updateStatus = useCallback(() => {
    // Cancel any pending dispatch from rapid taps
    if (pendingDispatchRef.current) {
      pendingDispatchRef.current.cancel();
    }

    // Calculate next status from current displayed status
    const currentStatus = optimisticStatus ?? item.status;
    const newStatus = getNextStatus(currentStatus);

    // IMMEDIATE: Update UI optimistically
    setOptimisticStatus(newStatus);

    // DEFERRED: Dispatch to Redux after interactions complete
    pendingDispatchRef.current = InteractionManager.runAfterInteractions(() => {
      const newItem = { ...item, status: newStatus };
      dispatch(updateOrCreateItem({ habitId, item: newItem }));
      pendingDispatchRef.current = null;
    });
  }, [item, habitId, dispatch, optimisticStatus]);

  const handleLongPress = useCallback(() => {
    setItemModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setItemModalVisible(false);
  }, []);

  const handleSaveNotes = useCallback((notes: string) => {
    dispatch(updateOrCreateItem({ habitId, item: { ...item, notes } }));
  }, [dispatch, habitId, item]);

  return (
    <>
      <ItemModal
        defaultValues={{ notes: item.notes }}
        visible={itemModalVisible}
        onSave={handleSaveNotes}
        onClose={handleCloseModal}
      />
      <TouchableOpacity
        activeOpacity={0.6}
        style={[styles.box, getStyle(displayStatus)]}
        onPress={updateStatus}
        onLongPress={handleLongPress}
        testID="item-container"
      >
        <View style={styles.dateContainer}>
          <Text style={[styles.dayOfWeekWord, getStyle(displayStatus)]}>{dayOfWeekWord}</Text>
          <Text style={[styles.dayOfMonthNumber, getStyle(displayStatus)]}>{dayOfMonthNumber}</Text>
          {notesExist ? <Text style={styles.notesDot}>{`.`}</Text> : null}
        </View>
      </TouchableOpacity>
    </>
  );
};
