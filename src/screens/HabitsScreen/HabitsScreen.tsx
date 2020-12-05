import startOfWeek from "date-fns/startOfWeek";
import { Container, Content } from "native-base";
import React, { FC } from "react";
import { useSelector } from "react-redux";
import { RoundButton } from "../../components/RoundButton";
import { Spacer } from "../../components/Spacer";
import { HabitComponent } from "./HabitComponent";
import { habitsSelector } from "./habits.slice";

export const HabitsScreen: FC = () => {
  const mondayOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const habits = useSelector(habitsSelector);
  const newHabitButtonDirection = habits.length < 1 ? "down" : "up";

  return (
    <Container>
      <Content>
        <Spacer />
        {habits.map(habit => (
          <HabitComponent habitId={habit.id} startOfWeek={mondayOfCurrentWeek} {...habit} />
        ))}
        <Spacer size={50} />
        <RoundButton title="New habit" onPress={() => {}} direction={newHabitButtonDirection} />
      </Content>
    </Container>
  );
};
