import { NavigationContainer } from "@react-navigation/native";
import { AppLoading } from "expo";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import { Root, StyleProvider } from "native-base";
import React, { FC, useEffect, useState } from "react";
import { View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import styles from "../App.styles";
import { fonts, images } from "../assets";
import getTheme from "../native-base-theme/components";
import theme from "../native-base-theme/variables/commonColor";
import { TabNavigation } from "./components/TabNavigation";
import initFirebase from "./config/firebase";
import FirebaseContext from "./config/firebaseContext";
import { persistor, store } from "./config/rtk/store";

// Disable React Native in-app warnings
console.disableYellowBox = true;

const loadResourcesAsync = async () => {
  const imageAssets = Object.values(images);
  await Asset.loadAsync([...imageAssets]);

  const fontAssets = Object.values(fonts);
  await Font.loadAsync(fontAssets as any);

  return;
};

const handleLoadingError = error => {
  // Report to Sentry here
  console.warn(error);
};

export const Application: FC = () => {
  // persistor.purge(); // Debug to clear persist
  const [isLoadingComplete, setLoadingComplete] = useState(false);
  const [firebaseValues, setFirebaseValues] = useState();
  const isFirebaseInitComplete = !!firebaseValues;

  useEffect(() => {
    initFirebase().then(values => setFirebaseValues(values));
  }, []);

  const loading = !isLoadingComplete || !isFirebaseInitComplete;
  if (loading)
    return (
      <AppLoading
        startAsync={loadResourcesAsync}
        onError={handleLoadingError}
        onFinish={() => setLoadingComplete(true)}
      />
    );

  return (
    <Root>
      <View style={styles.container}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <StyleProvider style={getTheme(theme)}>
              <FirebaseContext.Provider value={firebaseValues}>
                <NavigationContainer>
                  <TabNavigation />
                </NavigationContainer>
              </FirebaseContext.Provider>
            </StyleProvider>
          </PersistGate>
        </Provider>
      </View>
    </Root>
  );
};
