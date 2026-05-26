import React, { useState, FC } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { AUTH_COLORS, AUTH_SPACING, LOGIN_THEME } from '../../constants/authDesign';
import { THEME } from '../../constants/theme';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface AuthTextFieldProps extends TextInputProps {
  label?: string;
  icon?: string;
  error?: string;
  variant?: 'default' | 'minimal' | 'loginMono';
}

const AuthTextField: FC<AuthTextFieldProps> = ({
  label,
  icon = 'form-textbox',
  error,
  secureTextEntry,
  variant = 'default',
  ...inputProps
}) => {
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const isMinimal = variant === 'minimal' || variant === 'loginMono';
  const isLoginMono = variant === 'loginMono';

  return (
    <View style={styles.wrap}>
      {!isMinimal && label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          isMinimal && styles.fieldMinimal,
          isLoginMono && styles.fieldLoginMono,
          error ? styles.fieldError : null,
        ]}
      >
        {!isMinimal && (
          <View style={styles.iconBox}>
            <Icon name={icon} size={20} color={AUTH_COLORS.textMuted} />
          </View>
        )}
        <TextInput
          style={[styles.input, isMinimal && styles.inputMinimal]}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={hidden}
          {...inputProps}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setHidden((v) => !v)}
            style={styles.eyeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name={hidden ? 'eye-off-outline' : 'eye-outline'} size={22} color={AUTH_COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: AUTH_COLORS.textMuted,
    marginBottom: 8,
    marginLeft: 4,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AUTH_COLORS.inputBg,
    borderRadius: AUTH_SPACING.fieldRadius,
    borderWidth: 1,
    borderColor: AUTH_COLORS.border,
    paddingHorizontal: 4,
    minHeight: 52,
  },
  fieldMinimal: {
    backgroundColor: THEME.surface,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  fieldLoginMono: {
    backgroundColor: LOGIN_THEME.input,
    borderColor: LOGIN_THEME.inputBorder,
    borderWidth: 1,
    paddingHorizontal: 16,
    shadowOpacity: 0,
    elevation: 0,
  },
  fieldError: { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
  inputMinimal: { paddingLeft: 0 },
  iconBox: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: AUTH_COLORS.text,
    paddingVertical: 12,
    paddingRight: 8,
  },
  eyeBtn: { paddingHorizontal: 12 },
  errorText: {
    fontSize: 12,
    color: AUTH_COLORS.error,
    marginTop: 6,
    marginLeft: 4,
  },
});

export default AuthTextField;
