import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { FC } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useEffect } from 'react';
import { store, persistor } from './src/app/store';
import type { RootState } from './src/app/store';
import Navigation from './src/navigation';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import { GET_USER_REQUEST } from './src/app/actions';

const AppContent: FC = () => {
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <Navigation />
    </SafeAreaProvider>
  );
};

const App: FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
};

GoogleSignin.configure({
  webClientId: '220287836624-tm0ep198jig2bvdt2mtv4fom64uksqa5.apps.googleusercontent.com',
  offlineAccess: true,
});

export default App;

