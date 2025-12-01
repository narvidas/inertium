import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { FC } from "react";
import { useSelector } from "react-redux";
import { useScrollableViewSelector } from "../../config/rtk/settings.slice";
import { HabitsScreen } from "../../features/Habits";
import { ScrollableHabitsScreen } from "../../features/ScrollableHabits";
import { ProfileStackNavigation } from "../../features/Profile/ProfileStackNavigation";

const Tab = createBottomTabNavigator();

// Wrapper component that conditionally renders the appropriate habits view
const HabitsViewSwitch: FC = () => {
  const useScrollableView = useSelector(useScrollableViewSelector);
  return useScrollableView ? <ScrollableHabitsScreen /> : <HabitsScreen />;
};

export const TabNavigation: FC = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: "#48914d",
      tabBarInactiveTintColor: "#888888",
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="Habits"
      component={HabitsViewSwitch}
      options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-done" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileStackNavigation}
      options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);
