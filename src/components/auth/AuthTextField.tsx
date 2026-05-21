import React, { useState, FC } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { AUTH_COLORS, AUTH_SPACING } from '../../constants/authDesign';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface AuthTextFieldProps extends TextInputProps {
  label: string;
  icon?: string;
  error?: string;
}

const AuthTextField: FC<AuthTextFieldProps> = ({
  label,
  icon = 'form-textbox',
  error,
  secureTextEntry,
  ...inputProps
}) => {
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, error ? styles.fieldError : null]}>
        <View style={styles.iconBox}>
          <Icon name={icon} size={20} color={AUTH_COLORS.textMuted} />
        </View>
        <TextInput
          style={styles.input}
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
  fieldError: { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
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
