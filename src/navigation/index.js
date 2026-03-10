import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

import AuthNav from './AuthNav';
import MainNav from './MainNav';

const RootNavigation = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle('dark-content', true);
    }
  }, [isDarkMode]);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNav /> : <AuthNav />}
    </NavigationContainer>
  );
};

export default RootNavigation;