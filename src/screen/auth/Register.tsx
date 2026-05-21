import React, { useState, useEffect, FC } from 'react';
import { Text, StyleSheet } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';

import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import AuthTextField from '../../components/auth/AuthTextField';
import AuthPrimaryButton from '../../components/auth/AuthPrimaryButton';
import { AUTH_COLORS } from '../../constants/authDesign';
import { RootState } from '../../app/store';
import { registerRequest } from '../../app/actions';
import { ROUTES } from '../../utils';

type RegisterScreenProps = StackScreenProps<any, 'Register'>;

const Register: FC<RegisterScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error, registerSuccessMessage } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (error) {
      Toast.show({ type: 'error', text1: 'Registration failed', text2: error });
    }
  }, [error]);

  useEffect(() => {
    if (registerSuccessMessage) {
      Toast.show({
        type: 'success',
        text1: 'Account created',
        text2: registerSuccessMessage,
        onPress: () => navigation.replace(ROUTES.LOGIN),
      });
      const t = setTimeout(() => navigation.replace(ROUTES.LOGIN), 2500);
      return () => clearTimeout(t);
    }
  }, [registerSuccessMessage, navigation]);

  const validateEmail = (value: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleRegister = (): void => {
    if (!fullName.trim()) {
      Toast.show({ type: 'error', text1: 'Enter your full name' });
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      Toast.show({ type: 'error', text1: 'Enter a valid email address' });
      return;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }
    dispatch(registerRequest({ fullName, email, password }));
  };

  const footer = (
    <Text style={styles.footerText}>
      Already have an account?{' '}
      <Text style={styles.footerLink} onPress={() => navigation.goBack()}>
        Sign in
      </Text>
    </Text>
  );

  return (
    <AuthScreenLayout
      title="Create account"
      subtitle="Join LaRiosa to schedule test drives and track your bookings."
      onBack={() => navigation.goBack()}
      showLogo={false}
      footer={footer}
    >
      <AuthTextField
        label="Full name"
        icon="account-outline"
        placeholder="John Doe"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />

      <AuthTextField
        label="Email"
        icon="email-outline"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <AuthTextField
        label="Password"
        icon="lock-outline"
        placeholder="At least 6 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <AuthTextField
        label="Confirm password"
        icon="lock-check-outline"
        placeholder="Repeat password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Text style={styles.hint}>
        By signing up you agree to receive booking updates about your test drive requests.
      </Text>

      <AuthPrimaryButton
        label="Create account"
        onPress={handleRegister}
        loading={isLoading}
        style={styles.submitBtn}
      />
    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  hint: {
    fontSize: 12,
    color: AUTH_COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 16,
    marginTop: -4,
  },
  submitBtn: { marginTop: 4 },
  footerText: { fontSize: 15, color: AUTH_COLORS.textMuted },
  footerLink: { color: AUTH_COLORS.primary, fontWeight: '700' },
});

export default Register;
