import { createStackNavigator } from '@react-navigation/stack';

// screens
import HomeScreen from '../screen/HomeScreen';
import ProfileScreen from '../screen/ProfileScreen';

// utils
import { NavigationContainer } from '@react-navigation/native';
import { ROUTES } from '../utils';
import { useEffect } from 'react';
import { Platform, useColorScheme, StatusBar } from 'react-native';

const Stack = createStackNavigator();

const MainNavigation = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.HOME}>
      <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
      <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
    </Stack.Navigator>
  );
};

import AuthNav from './AuthNav';
export default ()  => {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    if(Platform.OS === 'android'){
      StatusBar.setBarStyle('dark-content',true);

    }
  }, [isDarkMode]);
  return (
    <NavigationContainer>
      <AuthNav/>
    </NavigationContainer>
  );
};