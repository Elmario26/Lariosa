import React, { useEffect, useState, FC } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleSignin, statusCodes, GoogleSigninButton } from '@react-native-google-signin/google-signin';

import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import { ROUTES } from '../../utils';
import { RootState } from '../../app/store';
import { userLoginRequest } from '../../app/actions';
import { AuthNavProps } from '../../navigation/AuthNav';

type LoginScreenProps = StackScreenProps<any, 'Login'>;

const Login: FC<LoginScreenProps> = () => {
  const navigation = useNavigation<AuthNavProps>();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error);
    }
  }, [error]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('[GOOGLE SIGNIN] User Info:', userInfo);
      
      const userData = userInfo as any;
      
      // Dispatch Redux action with Google sign-in data
      dispatch(
        userLoginRequest({
          email: userData.user?.email || userData.email || '',
          password: '', // Google sign-in doesn't use password
          googleToken: userData.idToken || userData.serverAuthCode || '',
        })
      );
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('[GOOGLE SIGNIN] Sign-in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('[GOOGLE SIGNIN] Sign-in in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services is not available');
      } else {
        console.log('[GOOGLE SIGNIN] Error:', error);
        Alert.alert('Sign-in Error', error.message || 'An error occurred during sign-in');
      }
    }
  };

  const handleLogin = (): void => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter your password');
      return;
    }

    // Log credentials to console
    console.log('[LOGIN SCREEN] Email:', email);
    console.log('[LOGIN SCREEN] Password:', password);

    // Dispatch Redux action
    dispatch(
      userLoginRequest({
        email,
        password,
      })
    );
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
        <Image
          source={require('../../../assets/LOGO2.png')}
          style={{
            width: 250,
            height: 250,
            alignSelf: 'center',
            marginBottom: 30,
            resizeMode: 'contain',
          }}
        />

        <CustomTextInput
          label={'Email address'}
          placeholder={'Enter email address'}
          value={email}
          onChangeText={setEmail}
          containerStyle={{
            padding: 5,
          }}
          textStyle={{
            borderRadius: 10,
            color: 'black',
            marginLeft: 10,
          }}
        />

        <CustomTextInput
          label={'Enter password'}
          placeholder={'Enter password'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          containerStyle={{
            padding: 5,
            marginTop: 10,
          }}
          textStyle={{
            borderRadius: 10,
            color: 'black',
            marginLeft: 10,
          }}
        />

        <CustomButton
          label={isLoading ? 'Logging in...' : 'Login'}
          onPress={handleLogin}
          containerStyle={{
            marginTop: 30,
            borderRadius: 10,
            backgroundColor: '#2563EB',
            padding: 5,
          }}
          textStyle={{
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
          }}
        />

        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          style={{ marginTop: 15, alignSelf: 'center' }}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.REGISTER)}
          style={{ marginTop: 15, alignItems: 'center' }}
        >
          <Text style={{ color: '#2563EB', fontWeight: 'bold' }}>
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Login;
