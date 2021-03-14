import dateFnsStartOfWeek from "date-fns/startOfWeek";
import { Container, Content, Root, View } from "native-base";
import React, { FC, useContext, useEffect, useState } from "react";
import { RefreshControl } from "react-native";
import SortableList from "react-native-sortable-list";
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
    if (order) syncHabitOrder();
  }, [order]);

  return (
    <Root testID="root">
      <Container>
        <NewHabitModal
          visible={newHabitModalVisible}
          onSave={async (title, goal) => {
            dispatch(createNewHabit({ title, goal }));
            await syncAll();
          }}
          onClose={() => setNewHabitModalVisible(false)}
        />
        <Content contentContainerStyle={styles.list} scrollEnabled={false}>
          <CalendarStripComponent onWeekChanged={setStartOfWeek} />
          <View testID="habit-list">
            <SortableList
              data={habits}
              renderRow={({ data, active }) => <AnimatedRow habit={data} active={active} startOfWeek={startOfWeek} />}
              onReleaseRow={(_, newOrderByIndex: Array<number>) => {
                const newOrder = newOrderByIndex.map(index => habits[index].id);
                dispatch(updateHabitOrder({ newOrder }));
              }}
              refreshControl={<RefreshControl refreshing={syncing} onRefresh={onRefresh} />}
              renderFooter={() => (
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
              )}
            />
          </View>
        </Content>
      </Container>
    </Root>
  );
};
