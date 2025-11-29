import * as SecureStore from "expo-secure-store";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/storage";
import { config } from "./firebaseConfig";

const getStoredCurrentUser = async () => {
  try {
    const currentUser = await SecureStore.getItemAsync("storedCurrentUser");
    return currentUser ? JSON.parse(currentUser) : null;
  } catch {
    return null;
  }
};

const setStoredCurrentUser = async auth => {
  try {
    await SecureStore.setItemAsync("storedCurrentUser", JSON.stringify(auth));
  } catch {}
};

let firebaseValues;
const initFirebase = async () => {
  const firebaseAlreadyInitialised = firebase.apps.length;
  const instance = firebaseAlreadyInitialised ? firebase.apps[0] : firebase.initializeApp(config);

  const auth = instance.auth();
  const db = instance.database();
  const storage = instance.storage();

  // Note: auth.currentUser is read-only in Firebase v10+
  // The stored user is used for UI hints only; actual auth state comes from Firebase
  const storedCurrentUser = await getStoredCurrentUser();

  const updateStoredCurrentUser = async () => setStoredCurrentUser(auth.currentUser);

  const values = {
    storage,
    auth,
    db,
    storedCurrentUser, // Provide stored user separately for initial UI state
    updateStoredCurrentUser,
  };

  firebaseValues = values;
  return values;
};

export const getFirebaseValues = () => firebaseValues;
export default initFirebase;
