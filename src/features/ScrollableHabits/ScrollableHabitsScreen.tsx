import { Container, Root, View } from "../../ui";
import React, { FC, useCallback, useContext, useState } from "react";
import { RefreshControl } from "react-native";
import DraggableFlatList, { RenderItemParams, DragEndParams } from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { RoundButton } from "../../components/RoundButton";
import { Spacer } from "../../components/Spacer";
import SyncContext from "../../config/remote/syncContext";
import { successToast } from "../../utils/toast";
import { createNewHabit, habitsSelector, orderSelector, updateHabitOrder } from "../Habits/habits.slice";
import { NewHabitModal } from "../Habits/NewHabitModal";
import { Habit } from "../Habits/types";
import { ScrollableCalendarStrip } from "./components/ScrollableCalendarStrip";
import { ScrollableHabitRow } from "./components/ScrollableHabitRow";
import { ScrollSyncProvider } from "./context";
import { styles } from "./ScrollableHabitsScreen.styles";

export const ScrollableHabitsScreen: FC = () => {
  const dispatch = useDispatch();
  const [syncing, setSyncing] = useState(false);
  const [newHabitModalVisible, setNewHabitModalVisible] = useState(false);
  const order = useSelector(orderSelector);
  const { syncAll, syncHabitOrder } = useContext(SyncContext);

  const habits = useSelector(habitsSelector);
  const habitsExist = !!habits.length;
  const newHabitButtonDirection = habitsExist ? "up" : "down";

  const onRefresh = useCallback(async () => {
    setSyncing(true);
    await syncAll?.();
    setSyncing(false);
    successToast("Sync complete.");
  }, [syncAll]);

  React.useEffect(() => {
    order && syncHabitOrder?.();
  }, [order, syncHabitOrder]);

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Habit>) => (
    <ScrollableHabitRow
      habitId={item.id}
      scrollViewId={`habit-row-${item.id}`}
      isActive={isActive}
      onDrag={drag}
    />
  ), []);

  const onDragEnd = useCallback(({ data }: DragEndParams<Habit>) => {
    const newOrder = data.map(habit => habit.id);
    dispatch(updateHabitOrder({ newOrder }));
  }, [dispatch]);

  const keyExtractor = useCallback((item: Habit) => item.id, []);

  const handleSaveNewHabit = useCallback(async (title: string, goal: number) => {
    dispatch(createNewHabit({ title, goal }));
    await syncAll?.();
  }, [dispatch, syncAll]);

  const handleCloseNewHabitModal = useCallback(() => {
    setNewHabitModalVisible(false);
  }, []);

  const handleOpenNewHabitModal = useCallback(() => {
    setNewHabitModalVisible(true);
  }, []);

  const ListFooter = useCallback(() => (
    <>
      {habitsExist && <Spacer size={50} />}
      <View style={styles.footerContainer}>
        <RoundButton
          title="New habit"
          onPress={handleOpenNewHabitModal}
          direction={newHabitButtonDirection}
        />
      </View>
    </>
  ), [habitsExist, newHabitButtonDirection, handleOpenNewHabitModal]);

  return (
    <Root testID="scrollable-root">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <Container>
            <NewHabitModal
              visible={newHabitModalVisible}
              onSave={handleSaveNewHabit}
              onClose={handleCloseNewHabitModal}
            />
            <ScrollSyncProvider>
              <View style={styles.stickyCalendar}>
                <ScrollableCalendarStrip />
              </View>
              <View style={styles.list} testID="scrollable-habit-list">
                <DraggableFlatList
                  testID="scrollable-sortable-habit-list"
                  data={habits}
                  renderItem={renderItem}
                  keyExtractor={keyExtractor}
                  onDragEnd={onDragEnd}
                  refreshControl={<RefreshControl refreshing={syncing} onRefresh={onRefresh} />}
                  ListFooterComponent={ListFooter}
                />
              </View>
            </ScrollSyncProvider>
          </Container>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Root>
  );
};

export default ScrollableHabitsScreen;
