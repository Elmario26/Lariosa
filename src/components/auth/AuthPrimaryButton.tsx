import React, { FC } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { AUTH_COLORS, AUTH_SPACING } from '../../constants/authDesign';

interface AuthPrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
  style?: ViewStyle;
}

const AuthPrimaryButton: FC<AuthPrimaryButtonProps> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.btn,
        isPrimary ? styles.primary : styles.outline,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : AUTH_COLORS.primary} />
      ) : (
        <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textOutline]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: AUTH_SPACING.fieldRadius,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AUTH_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primary: { backgroundColor: AUTH_COLORS.primary },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: AUTH_COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabled: { opacity: 0.65 },
  text: { fontSize: 16, fontWeight: '700' },
  textPrimary: { color: '#fff' },
  textOutline: { color: AUTH_COLORS.text },
});

export default AuthPrimaryButton;
