import React, { FC } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { THEME } from '../constants/theme';
import AnimatedModalShell from './animated/AnimatedModalShell';

export type AppDialogVariant = 'info' | 'success' | 'warning' | 'danger';

export type AppDialogButtonStyle = 'default' | 'cancel' | 'destructive' | 'primary';

export interface AppDialogButton {
  text: string;
  onPress?: () => void;
  style?: AppDialogButtonStyle;
}

export interface AppDialogConfig {
  title: string;
  message?: string;
  variant?: AppDialogVariant;
  buttons?: AppDialogButton[];
  /** Tap outside to close (default: false when destructive confirm) */
  dismissOnBackdrop?: boolean;
}

interface AppDialogProps {
  visible: boolean;
  config: AppDialogConfig | null;
  onClose: () => void;
}

const VARIANT_META: Record<
  AppDialogVariant,
  { icon: string; iconColor: string; iconBg: string }
> = {
  info: { icon: 'information-outline', iconColor: THEME.accent, iconBg: THEME.accentMuted },
  success: { icon: 'check-circle-outline', iconColor: THEME.success, iconBg: THEME.successMuted },
  warning: { icon: 'alert-circle-outline', iconColor: THEME.primary, iconBg: THEME.primaryMuted },
  danger: { icon: 'trash-can-outline', iconColor: THEME.error, iconBg: THEME.errorMuted },
};

const CARD_WIDTH = Math.min(Dimensions.get('window').width - 48, 360);

const AppDialog: FC<AppDialogProps> = ({ visible, config, onClose }) => {
  if (!config) return null;

  const variant = config.variant ?? 'info';
  const meta = VARIANT_META[variant];
  const buttons =
    config.buttons && config.buttons.length > 0
      ? config.buttons
      : [{ text: 'OK', style: 'primary' as const }];

  const runButton = (btn: AppDialogButton): void => {
    onClose();
    btn.onPress?.();
  };

  const isRow = buttons.length === 2;
  const hasDestructive = buttons.some((b) => b.style === 'destructive');
  const dismissOnBackdrop = config.dismissOnBackdrop ?? !hasDestructive;

  return (
    <AnimatedModalShell
      visible={visible}
      onClose={onClose}
      dismissOnBackdrop={dismissOnBackdrop}
      placement="center"
      animation="scale"
      backdropOpacity={0.55}
      panelStyle={styles.card}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconWrap, { backgroundColor: meta.iconBg }]}>
          <Icon name={meta.icon} size={32} color={meta.iconColor} />
        </View>

        <Text style={styles.title}>{config.title}</Text>
        {config.message ? <Text style={styles.message}>{config.message}</Text> : null}

        <View style={[styles.actions, isRow && styles.actionsRow]}>
          {buttons.map((btn, index) => {
            const style = btn.style ?? (index === 0 && buttons.length > 1 ? 'cancel' : 'primary');
            return (
              <TouchableOpacity
                key={`${btn.text}-${index}`}
                style={[
                  styles.btn,
                  !isRow && styles.btnFull,
                  isRow && styles.btnHalf,
                  style === 'primary' && styles.btnPrimary,
                  style === 'destructive' && styles.btnDestructive,
                  style === 'cancel' && styles.btnCancel,
                  style === 'default' && styles.btnCancel,
                ]}
                onPress={() => runButton(btn)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.btnText,
                    style === 'primary' && styles.btnTextPrimary,
                    style === 'destructive' && styles.btnTextPrimary,
                    (style === 'cancel' || style === 'default') && styles.btnTextCancel,
                  ]}
                >
                  {btn.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </AnimatedModalShell>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    maxWidth: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  cardContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    width: '100%',
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    width: '100%',
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 4,
  },
  actions: {
    width: '100%',
    marginTop: 24,
    gap: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnFull: {
    alignSelf: 'stretch',
    width: '100%',
  },
  btnHalf: { flex: 1 },
  btnPrimary: { backgroundColor: THEME.primary },
  btnDestructive: { backgroundColor: '#DC2626' },
  btnCancel: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  btnText: { fontSize: 16, fontWeight: '700' },
  btnTextPrimary: { color: '#fff' },
  btnTextCancel: { color: '#374151' },
});

export default AppDialog;
