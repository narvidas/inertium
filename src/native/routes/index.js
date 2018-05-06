import React from 'react';
import { Scene, Tabs, Stack } from 'react-native-router-flux';
import { Icon } from 'native-base';

import DefaultProps from '../constants/navigation';
import AppConfig from '../../constants/config';

import HabitsContainer from '../../containers/Habits';
import HabitsComponent from '../components/Habits';
import HabitViewComponent from '../components/HabitView';

import SignUpContainer from '../../containers/SignUp';
import SignUpComponent from '../components/SignUp';

import LoginContainer from '../../containers/Login';
import LoginComponent from '../components/Login';

import ForgotPasswordContainer from '../../containers/ForgotPassword';
import ForgotPasswordComponent from '../components/ForgotPassword';

import UpdateProfileContainer from '../../containers/UpdateProfile';
import UpdateProfileComponent from '../components/UpdateProfile';

import AppContainer from '../../containers/App';
import ProfileComponent from '../components/Profile';

import AnalyticsContainer from '../../containers/Analytics';
import AnalyticsComponent from '../components/Analytics';

const Index = (
  <Stack key="root">
    <Scene key="mainscene" hideNavBar>
      <Tabs
        key="tabbar"
        swipeEnabled
        type="replace"
        showLabel={false}
        {...DefaultProps.tabProps}
      >
        <Stack
          key="home"
          title="INERTIUM"
          icon={() => <Icon name="md-done-all" {...DefaultProps.icons} />}
          {...DefaultProps.navbarProps}
        >
          <Scene key="home" component={HabitsContainer} Layout={HabitsComponent} />
        </Stack>

        <Stack
          key="analytics"
          title="ANALYTICS"
          icon={() => <Icon name="ios-stats" {...DefaultProps.icons} />}
          {...DefaultProps.navbarProps}
        >
          <Scene key="analytics" component={AnalyticsContainer} Layout={AnalyticsComponent}/>
        </Stack>

        <Stack
          key="profile"
          title="PROFILE"
          icon={() => <Icon name="md-person" {...DefaultProps.icons} />}
          {...DefaultProps.navbarProps}
        >
          <Scene key="profileHome" component={AppContainer} Layout={ProfileComponent} />
          <Scene
            back
            key="signUp"
            title="SIGN UP"
            {...DefaultProps.navbarProps}
            component={SignUpContainer}
            Layout={SignUpComponent}
          />
          <Scene
            back
            key="login"
            title="LOGIN"
            {...DefaultProps.navbarProps}
            component={LoginContainer}
            Layout={LoginComponent}
          />
          <Scene
            back
            key="forgotPassword"
            title="FORGOT PASSWORD"
            {...DefaultProps.navbarProps}
            component={ForgotPasswordContainer}
            Layout={ForgotPasswordComponent}
          />
          <Scene
            back
            key="updateProfile"
            title="UPDATE PROFILE"
            {...DefaultProps.navbarProps}
            component={UpdateProfileContainer}
            Layout={UpdateProfileComponent}
          />
        </Stack>

      </Tabs>
    </Scene>

    <Scene
      back
      clone
      key="page"
      title="PAGE"
      {...DefaultProps.navbarProps}
      component={HabitsContainer}
      Layout={HabitViewComponent}
    />
  </Stack>
);

export default Index;
