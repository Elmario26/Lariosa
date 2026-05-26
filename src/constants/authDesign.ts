import { THEME } from './theme';

export const AUTH_COLORS = {
  background: THEME.background,
  hero: THEME.brand,
  heroAccent: THEME.accent,
  card: THEME.card,
  text: THEME.text,
  textMuted: THEME.textMuted,
  border: THEME.border,
  inputBg: THEME.surface,
  primary: THEME.primary,
  primaryPressed: THEME.primaryPressed,
  error: THEME.error,
  success: THEME.success,
};

export const AUTH_SPACING = {
  screen: 24,
  cardRadius: 24,
  fieldRadius: 14,
};

/** Login split layout: brand background + light form panel */
export const LOGIN_THEME = {
  backdrop: THEME.brand,
  panel: THEME.surface,
  panelBorder: THEME.border,
  input: THEME.white,
  inputBorder: THEME.border,
  title: THEME.text,
  text: THEME.text,
  textMuted: THEME.textMuted,
  button: THEME.primary,
  divider: THEME.border,
  footer: THEME.textMuted,
  footerLink: THEME.accent,
  googleBtn: THEME.white,
  googleBorder: THEME.border,
} as const;
