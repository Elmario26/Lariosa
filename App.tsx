
import { StatusBar, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useEffect } from 'react';
import { store, persistor } from './src/app/store';
import Navigation from './src/navigation';
// import { GET_USER_REQUEST } from './src/app/actions';

function AppContent() {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector(state => state.auth);

  // Check auth state on app load
  useEffect(() => {
    if (token && isAuthenticated) {
      // Optionally fetch user profile if token exists
      dispatch({
        //type: GET_USER_REQUEST,
        payload: token,
      });
    }
  }, [token, isAuthenticated, dispatch]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <Navigation />
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;

