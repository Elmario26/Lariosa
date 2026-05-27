import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { FC } from 'react';
import { ROUTES } from '../utils';
import { authStackScreenOptions } from './screenTransitions';

// screens
import Login from '../screen/auth/Login';
import Register from '../screen/auth/Register';

export type AuthStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;
};

export type AuthNavProps = StackNavigationProp<AuthStackParamList>;

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigation: FC = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.LOGIN} screenOptions={authStackScreenOptions}>
      <Stack.Screen name={ROUTES.LOGIN} component={Login} />
      <Stack.Screen name={ROUTES.REGISTER} component={Register} />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
