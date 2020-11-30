import { Icon } from "native-base";
import React from "react";
import { Scene, Stack, Tabs } from "react-native-router-flux";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { LogInScreen } from "../screens/LogInScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SampleScreen } from "../screens/SampleScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { UpdateProfileScreen } from "../screens/UpdateProfileScreen";
import DefaultProps from "./navigation";

const Routes = (
  <Stack key="root" hideNavBar>
    <Scene key="mainscene" hideNavBar>
      <Tabs key="tabbar" swipeEnabled type="replace" showLabel={false} {...DefaultProps.tabProps}>
        <Stack
          key="sampleScreen"
          title="SAMPLE SCREEN"
          icon={() => <Icon name="md-add-circle" {...DefaultProps.icons} />}
          {...DefaultProps.navbarProps}
        >
          <Scene key="sampleScreen" component={SampleScreen} />
        </Stack>

        <Stack
          key="profile"
          title="PROFILE"
          icon={() => <Icon name="md-person" {...DefaultProps.icons} />}
          {...DefaultProps.navbarProps}
        >
          <Scene key="profileHome" component={ProfileScreen} />
          <Scene back key="signUp" title="SIGN UP" {...DefaultProps.navbarProps} component={SignUpScreen} />
          <Scene back key="logIn" title="LOGIN" {...DefaultProps.navbarProps} component={LogInScreen} />
          <Scene
            back
            key="forgotPassword"
            title="FORGOT PASSWORD"
            {...DefaultProps.navbarProps}
            component={ForgotPasswordScreen}
          />
          <Scene
            back
            key="updateProfile"
            title="UPDATE PROFILE"
            {...DefaultProps.navbarProps}
            component={UpdateProfileScreen}
          />
        </Stack>
      </Tabs>
    </Scene>
  </Stack>
);

export default Routes;
