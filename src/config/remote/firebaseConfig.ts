import Constants from "expo-constants";

// Try to load from Expo config (populated via process.env for EAS builds)
const firebaseFromExpo = Constants.expoConfig?.extra?.firebase;

// Try to load local config for development (file is gitignored)
let localConfig: typeof firebaseFromExpo = null;
try {
  // This will fail in production builds where the file doesn't exist
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  localConfig = require("./firebaseConfig.local").localFirebaseConfig;
} catch {
  // Local config not available, will use Expo config
}

// Use Expo config (EAS builds) or fall back to local config (development)
const firebase = firebaseFromExpo?.apiKey ? firebaseFromExpo : localConfig;

export const config = {
  apiKey: firebase?.apiKey ?? "",
  authDomain: firebase?.authDomain ?? "",
  databaseURL: firebase?.databaseURL ?? "",
  projectId: firebase?.projectId ?? "",
  storageBucket: firebase?.storageBucket ?? "",
  messagingSenderId: firebase?.messagingSenderId ?? "",
  appId: firebase?.appId ?? "",
};
