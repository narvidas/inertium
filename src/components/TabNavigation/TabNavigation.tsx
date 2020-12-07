import AnimatedTabBar from "@gorhom/animated-tabbar";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { FC } from "react";
import { HabitsScreen } from "../../features/Habits";
import { ProfileStackNavigation } from "../../features/Profile/ProfileStackNavigation";
import { tabs } from "./tabs";

const Tab = createBottomTabNavigator();

export const TabNavigation: FC = () => (
  <Tab.Navigator
    tabBar={props => <AnimatedTabBar animation="iconWithLabel" preset="material" tabs={tabs} {...props} />}
  >
    <Tab.Screen name="Habits" component={HabitsScreen} />
    <Tab.Screen name="Profile" component={ProfileStackNavigation} />
  </Tab.Navigator>
);
