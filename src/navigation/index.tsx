import { NavigationContainer } from '@react-navigation/native';
import { useEffect, FC } from 'react';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getUserRequest } from '../app/actions';
import { RootState } from '../app/store';

import AuthNav from './AuthNav';
import MainNav from './MainNav';

const RootNavigation: FC = () => {
  const dispatch = useDispatch();
  const isDarkMode = useColorScheme() === 'dark';
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle('dark-content', true);
    }
  }, [isDarkMode]);

  // Load profile when app opens with a saved session
  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(getUserRequest());
    }
  }, [isAuthenticated, token, dispatch]);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNav /> : <AuthNav />}
    </NavigationContainer>
  );
};

export default RootNavigation;
