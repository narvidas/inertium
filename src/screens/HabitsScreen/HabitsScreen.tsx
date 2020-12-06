import startOfWeek from "date-fns/startOfWeek";
import { Container, Content } from "native-base";
import React, { FC, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RoundButton } from "../../components/RoundButton";
import { Spacer } from "../../components/Spacer";
import { CalendarStripComponent } from "./CalendarStripComponent";
import { HabitComponent } from "./HabitComponent";
import { createNewHabit, habitsSelector } from "./habits.slice";
import { NewHabitModal } from "./NewHabitModal";

export const HabitsScreen: FC = () => {
  const dispatch = useDispatch();
  const [newHabitModalVisible, setNewHabitModalVisible] = useState(false);

  const mondayOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const habits = useSelector(habitsSelector);
  const newHabitButtonDirection = habits.length < 1 ? "down" : "up";

  return (
    <Container>
      <NewHabitModal
        visible={newHabitModalVisible}
        onSave={(title, goal) => dispatch(createNewHabit({ title, goal }))}
        onClose={() => setNewHabitModalVisible(false)}
      />
      <Content>
        <Spacer />
        <CalendarStripComponent />
        <Spacer size={30} />
        {habits.map(habit => (
          <HabitComponent habitId={habit.id} startOfWeek={mondayOfCurrentWeek} {...habit} />
        ))}
        <Spacer size={50} />
        <RoundButton
          title="New habit"
          onPress={() => setNewHabitModalVisible(true)}
          direction={newHabitButtonDirection}
        />
      </Content>
    </Container>
  );
};
