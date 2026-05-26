import { ROUTES } from '../utils';
import { THEME } from './theme';

export const HOME_COLORS = {
  background: THEME.background,
  card: THEME.card,
  text: THEME.text,
  textOnCard: THEME.text,
  textMuted: THEME.textMuted,
  textMutedOnCard: THEME.textMuted,
  accent: THEME.accent,
  primary: THEME.primary,
};

export type HomeServiceAction =
  | { type: 'route'; route: string; params?: Record<string, unknown> }
  | { type: 'tab'; tab: string };

export interface HomeServiceTile {
  id: string;
  title: string;
  icon: string;
  color: string;
  action: HomeServiceAction;
}

/** Large service tiles on home (2-column grid) */
export const HOME_SERVICE_TILES: HomeServiceTile[] = [
  {
    id: 'test-drive',
    title: 'Test drive',
    icon: 'car-clock',
    color: THEME.accent,
    action: { type: 'route', route: ROUTES.TEST_DRIVE },
  },
  {
    id: 'inventory',
    title: 'Browse inventory',
    icon: 'car-multiple',
    color: '#8BC4C7',
    action: { type: 'tab', tab: ROUTES.INVENTORY },
  },
  {
    id: 'service',
    title: 'Book service',
    icon: 'wrench-clock',
    color: THEME.primary,
    action: { type: 'route', route: ROUTES.BOOK_APPOINTMENT, params: { intent: 'service' } },
  },
  {
    id: 'financing',
    title: 'Financing',
    icon: 'calculator-variant',
    color: '#FF8A65',
    action: { type: 'route', route: ROUTES.BOOK_APPOINTMENT, params: { intent: 'financing' } },
  },
  {
    id: 'trade-in',
    title: 'Trade-in',
    icon: 'swap-horizontal',
    color: THEME.brand,
    action: { type: 'route', route: ROUTES.BOOK_APPOINTMENT, params: { intent: 'trade-in' } },
  },
];

export const SIDE_MENU_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home-outline', tab: ROUTES.HOME },
  { id: 'inventory', label: 'Inventory', icon: 'car-outline', tab: ROUTES.INVENTORY },
  { id: 'appointments', label: 'My appointments', icon: 'calendar-check-outline', tab: ROUTES.MY_APPOINTMENTS },
  { id: 'profile', label: 'My profile', icon: 'account-outline', tab: ROUTES.PROFILE },
] as const;
