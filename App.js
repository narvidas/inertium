import { Ionicons } from "@expo/vector-icons";
import AnimatedTabBar from "@gorhom/animated-tabbar";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { AppLoading } from "expo";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import { Root, StyleProvider } from "native-base";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import styles from "./App.styles";
import images from "./assets/images";
import getTheme from "./native-base-theme/components";
import theme from "./native-base-theme/variables/commonColor";
import initFirebase from "./src/config/firebase";
import FirebaseContext from "./src/config/firebaseContext";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { SampleScreen } from "./src/screens/SampleScreen";

const tabs = {
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

const Tab = createBottomTabNavigator();

// Disable React Native in-app warnings
console.disableYellowBox = true;

const imageAssets = Object.values(images);
const assets = [].concat(imageAssets);

const loadResourcesAsync = async () =>
  Promise.all([
    Asset.loadAsync(assets),
    Font.loadAsync({
      // This is the font that we are using for our tab bar
      ...Ionicons.font,
      "space-mono": require("./assets/fonts/SpaceMono-Regular.ttf"),
      FatFrank: require("./assets/fonts/FatFrank.otf"),
      "FuturaPT-Book": require("./assets/fonts/FuturaPT-Book.otf"),
      "FuturaPT-Demi": require("./assets/fonts/FuturaPT-Demi.otf"),
      MaterialIcons: require("./assets/fonts/MaterialIcons.ttf"),
    }),
  ]);

const handleLoadingError = error => {
  // In this case, you might want to report the error to your error reporting
  // service, for example Sentry
  console.warn(error);
};

const handleFinishLoading = setLoadingComplete => setLoadingComplete(true);

const Application = () => {
  const [isLoadingComplete, setLoadingComplete] = useState(false);
  const [firebaseValues, setFirebaseValues] = useState();
  const isFirebaseInitComplete = !!firebaseValues;
  useEffect(() => {
    initFirebase().then(values => setFirebaseValues(values));
  }, []);

  if (!isLoadingComplete || !isFirebaseInitComplete) {
    return (
      <AppLoading
        startAsync={loadResourcesAsync}
        onError={handleLoadingError}
        onFinish={() => handleFinishLoading(setLoadingComplete)}
      />
    );
  }

  return (
    <Root>
      <View style={styles.container}>
        <StyleProvider style={getTheme(theme)}>
          <FirebaseContext.Provider value={firebaseValues}>
            <NavigationContainer>
              <Tab.Navigator
                tabBar={props => <AnimatedTabBar animation="iconWithLabel" preset="material" tabs={tabs} {...props} />}
              >
                <Tab.Screen name="Habits" component={SampleScreen} />
                <Tab.Screen name="Profile" component={ProfileScreen} />
              </Tab.Navigator>
            </NavigationContainer>
          </FirebaseContext.Provider>
        </StyleProvider>
      </View>
    </Root>
  );
};

export default Application;
