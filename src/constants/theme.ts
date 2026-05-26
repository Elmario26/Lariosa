/**
 * App-wide color palette
 * - background: #F5F5F5 (app shell)
 * - card: #FFFFFF (raised content on background)
 * - brand: #303841 (login / dark accents)
 * - primary (buttons): #FF5722
 * - accent (links, icons, highlights): #76ABAE
 */
export const THEME = {
  background: '#F5F5F5',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  brand: '#303841',

  primary: '#FF5722',
  primaryPressed: '#E64A19',
  accent: '#76ABAE',
  accentPressed: '#5F9699',

  text: '#303841',
  textInverse: '#F5F5F5',
  textMuted: '#6B7280',
  textMutedOnDark: '#B8BFC6',

  border: '#E5E7EB',
  cardBorder: '#E8E8E8',
  borderOnDark: '#3D4754',

  white: '#FFFFFF',

  primaryMuted: '#FFE8E0',
  accentMuted: '#E3EFF0',

  error: '#DC2626',
  errorMuted: '#FEE2E2',
  success: '#059669',
  successMuted: '#D1FAE5',
  warning: '#FF5722',
  warningMuted: '#FFE8E0',
} as const;

/** Subtle elevation so cards read clearly on #F5F5F5 */
export const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
} as const;

export type BookingStatusKey = 'pending' | 'approved' | 'rejected' | 'completed' | string;

export function getBookingStatusStyle(status: BookingStatusKey): { bg: string; text: string } {
  switch (status) {
    case 'approved':
      return { bg: THEME.accentMuted, text: THEME.accent };
    case 'pending':
      return { bg: THEME.primaryMuted, text: THEME.primary };
    case 'completed':
      return { bg: THEME.successMuted, text: THEME.success };
    case 'rejected':
      return { bg: THEME.errorMuted, text: THEME.error };
    default:
      return { bg: '#EEEEEE', text: THEME.textMuted };
  }
}
