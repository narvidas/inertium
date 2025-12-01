import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { FC } from "react";
import { useSelector } from "react-redux";
import { useScrollableViewSelector } from "../../../config/rtk/settings.slice";
import { MonthlyViewScreen } from "../../MonthlyView";
import { ScrollableHabitsScreen } from "../../ScrollableHabits";
import { HabitsScreen } from "../HabitsScreen";

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

// Wrapper component that conditionally renders the appropriate habits view
const HabitsViewSwitch: FC = () => {
  const useScrollableView = useSelector(useScrollableViewSelector);
  return useScrollableView ? <ScrollableHabitsScreen /> : <HabitsScreen />;
};

export const HabitsStackNavigation: FC = () => (
  <Stack.Navigator initialRouteName="HabitsList" screenOptions={screenOptionStyle}>
    <Stack.Screen
      name="HabitsList"
      component={HabitsViewSwitch}
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

