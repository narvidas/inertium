import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { FC } from "react";
import { HabitsScreen } from "../../features/Habits";
import { ProfileStackNavigation } from "../../features/Profile/ProfileStackNavigation";

const Tab = createBottomTabNavigator();

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
      component={HabitsScreen}
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
