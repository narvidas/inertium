import Constants from "expo-constants";

const firebase = Constants.expoConfig?.extra?.firebase;

export const config = {
  apiKey: firebase?.apiKey ?? "",
  authDomain: firebase?.authDomain ?? "",
  databaseURL: firebase?.databaseURL ?? "",
  projectId: firebase?.projectId ?? "",
  storageBucket: firebase?.storageBucket ?? "",
  messagingSenderId: firebase?.messagingSenderId ?? "",
  appId: firebase?.appId ?? "",
};
