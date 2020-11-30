import firebase from "firebase";
import config from "./firebaseConfig";

const initFirebase = () => {
  const instance = firebase.initializeApp(config);
  const auth = firebase.auth();
  const db = firebase.database();
  const storage = firebase.storage();

  return {
    instance,
    storage,
    auth,
    db,
  };
};

export default initFirebase;
