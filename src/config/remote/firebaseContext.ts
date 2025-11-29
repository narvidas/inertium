import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/storage";
import React from "react";

interface FirebaseContextValues {
  auth: firebase.auth.Auth;
  db: firebase.database.Database;
  storage: firebase.storage.Storage;
}

const FirebaseContext = React.createContext<FirebaseContextValues>(undefined);

export default FirebaseContext;
