import { NavigationContainer } from "@react-navigation/native";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Root, StyleProvider } from "native-base";
import React, { FC, useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import styles from "../App.styles";
import { fonts, images } from "../assets";
import getTheme from "../native-base-theme/components";
import theme from "../native-base-theme/variables/commonColor";
import { TabNavigation } from "./components/TabNavigation";
import initFirebase, { getFirebaseValues } from "./config/remote/firebase";
import FirebaseContext from "./config/remote/firebaseContext";
import { createSync } from "./config/remote/sync";
import SyncContext from "./config/remote/syncContext";
import { persistor, store } from "./config/rtk/store";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const loadResourcesAsync = async () => {
  const imageAssets = Object.values(images);
  await Asset.loadAsync([...imageAssets]);

  const fontAssets = Object.values(fonts);
  await Font.loadAsync(fontAssets as any);
};

export const Application: FC = () => {
  // persistor.purge(); // Debug to clear persist
  const [isLoadingComplete, setLoadingComplete] = useState(false);
  const [sync, setSync] = useState({});

  useEffect(() => {
    async function prepare() {
      try {
        await loadResourcesAsync();
        await initFirebase();
        const syncInstance = createSync(store, getFirebaseValues);
        setSync(syncInstance);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoadingComplete(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isLoadingComplete) {
      await SplashScreen.hideAsync();
    }
  }, [isLoadingComplete]);

  const isFirebaseInitComplete = !!getFirebaseValues();
  const loading = !isLoadingComplete || !isFirebaseInitComplete;
  if (loading) {
    // Return an empty view while loading - splash screen is still visible
    return <View style={{ flex: 1 }} />;
  }

  return (
    <Root>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <StyleProvider style={getTheme(theme)}>
              <SyncContext.Provider value={sync}>
                <FirebaseContext.Provider value={getFirebaseValues()}>
                  <NavigationContainer>
                    <TabNavigation />
                  </NavigationContainer>
                </FirebaseContext.Provider>
              </SyncContext.Provider>
            </StyleProvider>
          </PersistGate>
        </Provider>
      </View>
    </Root>
  );
};
