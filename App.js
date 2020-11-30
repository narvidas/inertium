import { Ionicons } from "@expo/vector-icons";
import { AppLoading } from "expo";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import { Root, StyleProvider } from "native-base";
import React, { useState } from "react";
import { View } from "react-native";
import { Router, Stack } from "react-native-router-flux";
import styles from "./App.styles";
import images from "./assets/images";
import getTheme from "./native-base-theme/components";
import theme from "./native-base-theme/variables/commonColor";
import initFirebase from "./src/config/firebase";
import FirebaseContext from "./src/config/firebaseContext";
import Routes from "./src/config/routes";

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

const Application = ({ skipLoadingScreen }) => {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  if (!isLoadingComplete && !skipLoadingScreen) {
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
          <FirebaseContext.Provider value={initFirebase()}>
            <Router>
              <Stack key="root">{Routes}</Stack>
            </Router>
          </FirebaseContext.Provider>
        </StyleProvider>
      </View>
    </Root>
  );
};

export default Application;
