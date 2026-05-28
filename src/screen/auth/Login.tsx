import React, { useEffect, useState, FC } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';

import AuthTextField from '../../components/auth/AuthTextField';
import AuthPrimaryButton from '../../components/auth/AuthPrimaryButton';
import { ROUTES } from '../../utils';
import { LOGIN_THEME } from '../../constants/authDesign';
import { LOGIN_LOGO } from '../../constants/assets';
import { RootState } from '../../app/store';
import { userLoginRequest } from '../../app/actions';
import { AuthNavProps } from '../../navigation/AuthNav';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type LoginScreenProps = StackScreenProps<any, 'Login'>;

const Login: FC<LoginScreenProps> = () => {
  const navigation = useNavigation<AuthNavProps>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const logoWidth = Math.min(screenWidth * 0.72, 280);
  const logoHeight = Math.min(logoWidth * 0.58, 150);

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
      const response = await GoogleSignin.signIn();
      if (response.type === 'cancelled') return;

      const { user, idToken, serverAuthCode } = response.data;
      let googleToken = idToken ?? serverAuthCode ?? '';
      if (!googleToken) {
        const tokens = await GoogleSignin.getTokens();
        googleToken = tokens.idToken ?? '';
      }
      if (!googleToken) {
        Toast.show({
          type: 'error',
          text1: 'Google sign-in failed',
          text2: 'Could not get a Google token. Check webClientId in App.tsx.',
        });
        return;
      }

      dispatch(
        userLoginRequest({
          email: user.email,
          password: '',
          googleToken,
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

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={LOGIN_THEME.backdrop} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.flex}>
          <View style={[styles.logoSection, { paddingTop: insets.top + 8 }]}>
            <Image
              source={LOGIN_LOGO}
              style={[styles.logo, { width: logoWidth, height: logoHeight }]}
              resizeMode="contain"
              accessibilityLabel="RW Trading logo"
            />
          </View>

          <ScrollView
            style={styles.panelScroll}
            contentContainerStyle={styles.panelScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.authPanel}>
            <Text style={styles.title}>Login to your account</Text>

            <AuthTextField
              variant="loginMono"
              placeholder="Email"
              placeholderTextColor={LOGIN_THEME.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AuthTextField
              variant="loginMono"
              placeholder="Password"
              placeholderTextColor={LOGIN_THEME.textMuted}
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
              <Text style={styles.dividerText}>Or sign in with</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Icon name="google" size={24} color="#5F5F5F" />
            </TouchableOpacity>

            <Text style={styles.footer}>
              Don&apos;t have an account?{' '}
              <Text style={styles.footerLink} onPress={() => navigation.navigate(ROUTES.REGISTER)}>
                Sign up
              </Text>
            </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LOGIN_THEME.backdrop,
  },
  flex: { flex: 1 },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 4,
    backgroundColor: LOGIN_THEME.backdrop,
  },
  logo: {
    maxHeight: 150,
  },
  panelScroll: {
    flex: 1,
    marginTop: -12,
  },
  panelScrollContent: {
    flexGrow: 1,
  },
  authPanel: {
    flex: 1,
    backgroundColor: LOGIN_THEME.panel,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: LOGIN_THEME.panelBorder,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: LOGIN_THEME.title,
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: LOGIN_THEME.button,
    shadowColor: '#000',
    shadowOpacity: 0.15,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: LOGIN_THEME.divider,
  },
  dividerText: {
    fontSize: 13,
    color: LOGIN_THEME.textMuted,
    fontWeight: '500',
  },
  googleBtn: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: LOGIN_THEME.googleBtn,
    borderWidth: 1,
    borderColor: LOGIN_THEME.googleBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 15,
    color: LOGIN_THEME.footer,
  },
  footerLink: {
    color: LOGIN_THEME.footerLink,
    fontWeight: '700',
  },
});

export default Login;
