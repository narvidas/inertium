import dateFnsStartOfWeek from "date-fns/startOfWeek";
import { Container, Root, View } from "../../ui";
import React, { FC, useContext, useEffect, useState } from "react";
import { RefreshControl } from "react-native";
import DraggableFlatList, { RenderItemParams, DragEndParams } from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { RoundButton } from "../../components/RoundButton";
import { Spacer } from "../../components/Spacer";
import SyncContext from "../../config/remote/syncContext";
import { successToast } from "../../utils/toast";
import { AnimatedRow } from "./AnimatedRow";
import { CalendarStripComponent } from "./CalendarStripComponent";
import { createNewHabit, habitsSelector, orderSelector, updateHabitOrder } from "./habits.slice";
import { styles } from "./HabitsScreen.styles";
import { NewHabitModal } from "./NewHabitModal";
import { Habit } from "./types";

export const HabitsScreen: FC = () => {
  const dispatch = useDispatch();
  const [syncing, setSyncing] = useState(false);
  const [newHabitModalVisible, setNewHabitModalVisible] = useState(false);
  const order = useSelector(orderSelector);
  const { syncAll, syncHabitOrder } = useContext(SyncContext);

  const mondayOfCurrentWeek = dateFnsStartOfWeek(new Date(), { weekStartsOn: 1 });
  const [startOfWeek, setStartOfWeek] = useState(mondayOfCurrentWeek);

  const habits = Object.values(useSelector(habitsSelector));
  const habitsExist = !!Object.values(habits).length;
  const newHabitButtonDirection = habitsExist ? "up" : "down";

  const onRefresh = async () => {
    setSyncing(true);
    await syncAll();
    setSyncing(false);
    successToast("Sync complete.");
  };

  useEffect(() => {
    order && syncHabitOrder();
  }, [order]);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Habit>) => (
    <AnimatedRow habit={item} active={isActive} startOfWeek={startOfWeek} onDrag={drag} />
  );

  const onDragEnd = ({ data }: DragEndParams<Habit>) => {
    const newOrder = data.map(habit => habit.id);
    dispatch(updateHabitOrder({ newOrder }));
  };

  const ListHeader = () => (
    <CalendarStripComponent onWeekChanged={setStartOfWeek} />
  );

  const ListFooter = () => (
    <>
      {habitsExist && <Spacer size={50} />}
      <View style={{ paddingBottom: 100 }}>
        <RoundButton
          title="New habit"
          onPress={() => setNewHabitModalVisible(true)}
          direction={newHabitButtonDirection}
        />
      </View>
    </>
  );

  return (
    <Root testID="root">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <Container>
            <NewHabitModal
              visible={newHabitModalVisible}
              onSave={async (title, goal) => {
                dispatch(createNewHabit({ title, goal }));
                await syncAll();
              }}
              onClose={() => setNewHabitModalVisible(false)}
            />
            <View style={styles.list} testID="habit-list">
              <DraggableFlatList
                testID="sortable-habit-list"
                data={habits}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                onDragEnd={onDragEnd}
                refreshControl={<RefreshControl refreshing={syncing} onRefresh={onRefresh} />}
                ListHeaderComponent={ListHeader}
                ListFooterComponent={ListFooter}
              />
            </View>
          </Container>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Root>
  );
};
