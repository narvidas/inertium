import * as SecureStore from "expo-secure-store";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/storage";
import config from "./firebaseConfig";

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
  const storedCurrentUser = await getStoredCurrentUser();
  auth.currentUser = auth.currentUser || storedCurrentUser;

  const db = instance.database();
  const storage = instance.storage();

  const updateStoredCurrentUser = async () => setStoredCurrentUser(instance.auth().currentUser);

  const values = {
    storage,
    auth,
    db,
    updateStoredCurrentUser,
  };

  firebaseValues = values;
  return values;
};

export const getFirebaseValues = () => firebaseValues;
export default initFirebase;
