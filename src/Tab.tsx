import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

export const Tab = createBottomTabNavigator();

export const tabs = {
  Habits: {
    labelStyle: {
      color: "#ffffff",
    },
    icon: {
      component: () => <Ionicons name="md-done-all" size={32} color="#ffffff" />,
      activeColor: "#48914d",
      inactiveColor: "rgba(0,0,0,1)",
    },
    background: {
      activeColor: "#48914d",
      inactiveColor: "rgba(223,215,243,0)",
    },
    ripple: {
      color: "#48914d",
    },
  },
  Profile: {
    labelStyle: {
      color: "#ffffff",
    },
    icon: {
      component: () => <Ionicons name="md-person" size={32} color="#ffffff" />,
      activeColor: "#555555",
      inactiveColor: "rgba(0,0,0,1)",
    },
    background: {
      activeColor: "#555555",
      inactiveColor: "rgba(207,235,239,0)",
    },
    ripple: {
      color: "#555555",
    },
  },
};
