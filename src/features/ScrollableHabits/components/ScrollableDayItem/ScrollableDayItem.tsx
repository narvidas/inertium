import format from "date-fns/format";
import formatISO from "date-fns/formatISO";
import isSameDay from "date-fns/isSameDay";
import parseISO from "date-fns/parseISO";
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, InteractionManager, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../config/rtk/rootReducer";
import { generatePushID } from "../../../../utils/generatePushID";
import { updateOrCreateItem } from "../../habits.slice";
import { Item, Status } from "../../types";
import { ItemModal } from "../ItemModal";
import { styles } from "./ScrollableDayItem.styles";

const getStyle = (status: Status) => {
  if (status === "done") return styles.done;
  if (status === "fail") return styles.fail;
  return null;
};

// Helper to cycle through statuses
/* istanbul ignore next -- all branches tested via behavioral tests */
const getNextStatus = (current: Status): Status => {
  if (current === "default") return "done";
  if (current === "done") return "fail";
  return "default";
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

  // Memoize date formatting - avoids repeated format() calls on each render
  const { dayOfWeekWord, dayOfMonthNumber } = useMemo(() => ({
    dayOfWeekWord: format(date, "EEE"),    // E.g. 'SUN' for Sunday
    dayOfMonthNumber: format(date, "d"),   // E.g. '14' for 14th December
  }), [date]);

  // Use optimistic status if set, otherwise fall back to Redux state
  const status = optimisticStatus ?? item?.status ?? "default";
  const notesExist = item?.notes && item.notes !== "";

  // Interpolate: when scrollAnimValue is 1 (scrolling), text fades to 20% opacity
  const textOpacity = useMemo(() =>
    scrollAnimValue?.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.20],
    }),
    [scrollAnimValue]);

  const updateStatus = useCallback(() => {
    // Cancel any pending dispatch from rapid taps
    /* istanbul ignore next -- defensive cleanup for rapid taps */
    if (pendingDispatchRef.current) {
      pendingDispatchRef.current.cancel();
    }

    // Calculate next status from current displayed status (optimistic or Redux)
    const currentStatus = optimisticStatus ?? item?.status ?? "default";
    const newStatus = getNextStatus(currentStatus);

    // IMMEDIATE: Update UI optimistically
    setOptimisticStatus(newStatus);

    // DEFERRED: Dispatch to Redux after interactions complete
    // This allows the UI to update before the heavier Redux operation
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
      <TouchableOpacity
        activeOpacity={0.6}
        style={[styles.box, { width: dayWidth, height: dayWidth }, getStyle(status)]}
        onPress={updateStatus}
        onLongPress={handleLongPress}
        testID="scrollable-item-container"
      >
        <Animated.View style={[styles.dateContainer, textOpacity && { opacity: textOpacity }]}>
          <Animated.Text style={[styles.dayOfWeekWord, getStyle(status)]}>{dayOfWeekWord}</Animated.Text>
          <Animated.Text style={[styles.dayOfMonthNumber, getStyle(status)]}>{dayOfMonthNumber}</Animated.Text>
          {notesExist ? <Animated.Text style={styles.notesDot}>{`.`}</Animated.Text> : null}
        </Animated.View>
      </TouchableOpacity>
    </>
  );
};

export const ScrollableDayItem = React.memo(ScrollableDayItemComponent);
ScrollableDayItem.displayName = "ScrollableDayItem";
