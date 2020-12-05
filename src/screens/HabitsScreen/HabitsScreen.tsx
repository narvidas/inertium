import startOfWeek from "date-fns/startOfWeek";
import { Container, Content } from "native-base";
import React, { FC } from "react";
import { useSelector } from "react-redux";
import { HabitComponent } from "./HabitComponent";
import { habitsSelector } from "./habits.slice";

export const HabitsScreen: FC = () => {
  const mondayOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const habits = useSelector(habitsSelector);

  return (
    <Container>
      <Content>
        {habits.map(habit => (
          <HabitComponent startOfWeek={mondayOfCurrentWeek} {...habit} />
        ))}
      </Content>
    </Container>
  );
};
