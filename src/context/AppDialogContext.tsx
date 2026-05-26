import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  FC,
  ReactNode,
} from 'react';
import AppDialog, {
  type AppDialogConfig,
  type AppDialogButton,
  type AppDialogVariant,
} from '../components/AppDialog';

interface ConfirmOptions {
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface AppDialogContextValue {
  show: (config: AppDialogConfig) => void;
  hide: () => void;
  alert: (title: string, message?: string, onOk?: () => void, variant?: AppDialogVariant) => void;
  confirm: (options: ConfirmOptions) => void;
}

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

export const AppDialogProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AppDialogConfig | null>(null);

  const hide = useCallback(() => {
    setVisible(false);
    setTimeout(() => setConfig(null), 200);
  }, []);

  const show = useCallback((next: AppDialogConfig) => {
    setConfig(next);
    setVisible(true);
  }, []);

  const alert = useCallback(
    (title: string, message?: string, onOk?: () => void, variant: AppDialogVariant = 'info') => {
      show({
        title,
        message,
        variant,
        buttons: [{ text: 'OK', style: 'primary', onPress: onOk }],
      });
    },
    [show]
  );

  const confirm = useCallback(
    (options: ConfirmOptions) => {
      const buttons: AppDialogButton[] = [
        {
          text: options.cancelText ?? 'Cancel',
          style: 'cancel',
          onPress: options.onCancel,
        },
        {
          text: options.confirmText ?? 'Confirm',
          style: options.destructive ? 'destructive' : 'primary',
          onPress: options.onConfirm,
        },
      ];
      show({
        title: options.title,
        message: options.message,
        variant: options.destructive ? 'danger' : 'warning',
        buttons,
      });
    },
    [show]
  );

  const value = useMemo(
    () => ({ show, hide, alert, confirm }),
    [show, hide, alert, confirm]
  );

  return (
    <AppDialogContext.Provider value={value}>
      {children}
      <AppDialog visible={visible} config={config} onClose={hide} />
    </AppDialogContext.Provider>
  );
};

export function useAppDialog(): AppDialogContextValue {
  const ctx = useContext(AppDialogContext);
  if (!ctx) {
    throw new Error('useAppDialog must be used within AppDialogProvider');
  }
  return ctx;
}
