import React, { useEffect, useState, FC } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';

import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import AuthTextField from '../../components/auth/AuthTextField';
import AuthPrimaryButton from '../../components/auth/AuthPrimaryButton';
import { ROUTES } from '../../utils';
import { AUTH_COLORS } from '../../constants/authDesign';
import { RootState } from '../../app/store';
import { userLoginRequest } from '../../app/actions';
import { AuthNavProps } from '../../navigation/AuthNav';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type LoginScreenProps = StackScreenProps<any, 'Login'>;

const Login: FC<LoginScreenProps> = () => {
  const navigation = useNavigation<AuthNavProps>();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (error) {
      Toast.show({ type: 'error', text1: 'Login failed', text2: error });
    }
  }, [error]);

  const validateEmail = (value: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const userData = userInfo as { user?: { email?: string }; email?: string; idToken?: string; serverAuthCode?: string };
      dispatch(
        userLoginRequest({
          email: userData.user?.email || userData.email || '',
          password: '',
          googleToken: userData.idToken || userData.serverAuthCode || '',
        })
      );
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Toast.show({ type: 'error', text1: 'Google Play Services unavailable' });
        return;
      }
      Toast.show({ type: 'error', text1: 'Sign-in error', text2: error.message || 'Try again' });
    }
  };

  const handleLogin = (): void => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Enter your email' });
      return;
    }
    if (!validateEmail(email)) {
      Toast.show({ type: 'error', text1: 'Enter a valid email address' });
      return;
    }
    if (!password.trim()) {
      Toast.show({ type: 'error', text1: 'Enter your password' });
      return;
    }
    dispatch(userLoginRequest({ email, password }));
  };

  const footer = (
    <Text style={styles.footerText}>
      Don&apos;t have an account?{' '}
      <Text style={styles.footerLink} onPress={() => navigation.navigate(ROUTES.REGISTER)}>
        Sign up
      </Text>
    </Text>
  );

  return (
    <AuthScreenLayout
      title="Welcome back"
      subtitle="Sign in to browse cars, book test drives, and manage appointments."
      footer={footer}
    >
      <AuthTextField
        label="Email"
        icon="email-outline"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <AuthTextField
        label="Password"
        icon="lock-outline"
        placeholder="Your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <AuthPrimaryButton
        label="Sign in"
        onPress={handleLogin}
        loading={isLoading}
        style={styles.primaryBtn}
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={styles.googleBtn}
        onPress={handleGoogleSignIn}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        <Icon name="google" size={22} color="#4285F4" />
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>
    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  primaryBtn: { marginTop: 4 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: AUTH_COLORS.border },
  dividerText: { fontSize: 12, color: AUTH_COLORS.textMuted, fontWeight: '600' },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AUTH_COLORS.border,
    backgroundColor: '#fff',
    gap: 10,
  },
  googleText: { fontSize: 15, fontWeight: '600', color: AUTH_COLORS.text },
  footerText: { fontSize: 15, color: AUTH_COLORS.textMuted },
  footerLink: { color: AUTH_COLORS.primary, fontWeight: '700' },
});

export default Login;
