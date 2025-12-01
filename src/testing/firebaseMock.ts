const firebase = jest.genMockFromModule("firebase/compat/app");

firebase.initializeApp = jest.fn();

const data = { name: "data" };
const snapshot = { val: () => data, exportVal: () => data, exists: jest.fn(() => true) };

firebase.database = jest.fn().mockReturnValue({
  ref: jest.fn().mockReturnThis(),
  on: jest.fn((eventType, callback) => callback(snapshot)),
  update: jest.fn(() => Promise.resolve(snapshot)),
  remove: jest.fn(() => Promise.resolve()),
  once: jest.fn(() => Promise.resolve(snapshot)),
});

firebase.auth = jest.fn().mockReturnValue({
  currentUser: null, // Anonymous by default for tests
  signOut() {
    return Promise.resolve();
  },
  signInWithEmailAndPassword(email, password) {
    return new Promise((resolve, reject) => {
      if (password === "sign" || password === "key") {
        resolve({ name: "user" });
      }
      reject(Error("sign in error "));
    });
  },
  createUserWithEmailAndPassword(email, password) {
    return new Promise((resolve, reject) => {
      if (password === "create" || password === "key") {
        resolve({ name: "createUser" });
      }
      reject(Error("create user error "));
    });
  },
  onAuthStateChanged(callback) {
    // Call callback immediately with current user (null = anonymous)
    callback(null);
    // Return unsubscribe function
    return jest.fn();
  },
});

export default firebase;
