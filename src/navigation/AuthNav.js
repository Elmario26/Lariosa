import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from '../utils';

// screens
import HomeScreen from '../screen/HomeScreen';
import Login from '../screen/auth/Login';

const Stack = createStackNavigator();

const AuthNavigation = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.LOGIN}>
      <Stack.Screen name={ROUTES.LOGIN} component={Login} />
      
    </Stack.Navigator>
  );
};

export default AuthNavigation;