import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { FC } from "react";
import { MonthlyViewScreen } from "../../MonthlyView";
import { ScrollableHabitsScreen } from "../../ScrollableHabits";

export type HabitsStackParamList = {
  HabitsList: undefined;
  MonthlyView: {
    habitId: string;
    habitTitle: string;
  };
};

const Stack = createNativeStackNavigator<HabitsStackParamList>();

const screenOptionStyle = {
  headerStyle: {
    backgroundColor: "#F5FCFF",
  },
};

export const HabitsStackNavigation: FC = () => (
  <Stack.Navigator initialRouteName="HabitsList" screenOptions={screenOptionStyle}>
    <Stack.Screen
      name="HabitsList"
      component={ScrollableHabitsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MonthlyView"
      component={MonthlyViewScreen}
      options={({ route }) => ({
        title: route.params.habitTitle,
        headerBackTitle: "Back",
      })}
    />
  </Stack.Navigator>
);
