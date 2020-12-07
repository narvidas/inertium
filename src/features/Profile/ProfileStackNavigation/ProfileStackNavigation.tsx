import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { ForgotPasswordScreen } from "../ForgotPasswordScreen";
import { LogInScreen } from "../LogInScreen";
import { ProfileScreen } from "../ProfileScreen";
import { SignUpScreen } from "../SignUpScreen";
import { UpdateProfileScreen } from "../UpdateProfileScreen";

const Stack = createStackNavigator();

const screenOptionStyle = {
  headerStyle: {
    backgroundColor: "#F5FCFF",
  },
};

export const ProfileStackNavigation = () => (
  <Stack.Navigator initialRouteName="Profile" screenOptions={screenOptionStyle}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Register" component={SignUpScreen} />
    <Stack.Screen name="Login" component={LogInScreen} />
    <Stack.Screen name="Update Profile" component={UpdateProfileScreen} />
    <Stack.Screen name="Forgot Password" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);
