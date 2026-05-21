import React, { FC, ReactNode } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AUTH_COLORS, AUTH_SPACING } from '../../constants/authDesign';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface AuthScreenLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  onBack?: () => void;
  showLogo?: boolean;
}

const AuthScreenLayout: FC<AuthScreenLayoutProps> = ({
  title,
  subtitle,
  children,
  footer,
  onBack,
  showLogo = true,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={AUTH_COLORS.hero} />

      <View style={styles.hero}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        {showLogo && (
          <Image source={require('../../../assets/LOGO2.png')} style={styles.logo} resizeMode="contain" />
        )}
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSubtitle}>{subtitle}</Text>
        <View style={styles.heroDecor} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH_COLORS.background,
  },
  flex: { flex: 1 },
  hero: {
    backgroundColor: AUTH_COLORS.hero,
    paddingHorizontal: AUTH_SPACING.screen,
    paddingBottom: 36,
    paddingTop: 8,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 88,
    height: 88,
    alignSelf: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    lineHeight: 22,
    fontWeight: '500',
  },
  heroDecor: {
    position: 'absolute',
    right: -40,
    top: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(37, 99, 235, 0.35)',
  },
  scroll: {
    paddingHorizontal: AUTH_SPACING.screen,
    marginTop: -20,
  },
  card: {
    backgroundColor: AUTH_COLORS.card,
    borderRadius: AUTH_SPACING.cardRadius,
    padding: AUTH_SPACING.screen,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
});

export default AuthScreenLayout;
