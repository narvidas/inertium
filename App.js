import React from 'react';
import Root from './src/native/index';
import configureStore from './src/store/index';

const { persistor, store } = configureStore();
persistor.purge(); // Debug to clear persist
console.ignoredYellowBox = ['Remote debugger'];

export default function App() {
  return <Root store={store} persistor={persistor} />;
}
