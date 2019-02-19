import React from 'react';
import { Scene, Tabs, Stack } from 'react-native-router-flux';
import { Icon } from 'native-base';

import DefaultProps from '../constants/navigation';
import HabitsContainer from '../containers/Habits';
import SignUpContainer from '../containers/SignUp';
import LoginContainer from '../containers/Login';
import ForgotPasswordContainer from '../containers/ForgotPassword';
import UpdateProfileContainer from '../containers/UpdateProfile';
import ProfileContainer from '../containers/Profile';
import AnalyticsContainer from '../containers/Analytics';

const Routes = (
  <Stack key="root" hideNavBar>
    <Scene key="mainscene" hideNavBar>
      <Tabs key="tabbar" swipeEnabled type="replace" showLabel={false} {...DefaultProps.tabProps}>
        <Stack
          key="home"
          title="INERTIUM"
          icon={() => <Icon name="md-done-all" {...DefaultProps.icons} />}
          {...DefaultProps.navbarProps}
        >
          <Scene key="home" component={HabitsContainer} />
        </Stack>

        {/* <Stack
          key="analytics"
          title="ANALYTICS"
          icon={() => <Icon name="ios-stats" {...DefaultProps.icons} />}
          {...DefaultProps.navbarProps}
        >
          <Scene key="analytics" component={AnalyticsContainer} />
        </Stack> */}

        <Stack
          key="profile"
          title="PROFILE"
          icon={() => <Icon name="md-person" {...DefaultProps.icons} />}
          {...DefaultProps.navbarProps}
        >
          <Scene key="profileHome" component={ProfileContainer} />
          <Scene back key="signUp" title="SIGN UP" {...DefaultProps.navbarProps} component={SignUpContainer} />
          <Scene back key="login" title="LOGIN" {...DefaultProps.navbarProps} component={LoginContainer} />
          <Scene
            back
            key="forgotPassword"
            title="FORGOT PASSWORD"
            {...DefaultProps.navbarProps}
            component={ForgotPasswordContainer}
          />
          <Scene
            back
            key="updateProfile"
            title="UPDATE PROFILE"
            {...DefaultProps.navbarProps}
            component={UpdateProfileContainer}
          />
        </Stack>
      </Tabs>
    </Scene>
  </Stack>
);

export default Routes;
