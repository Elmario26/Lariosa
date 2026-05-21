import { ROUTES } from '../utils';

export const HOME_COLORS = {
  background: '#EEF2F6',
  card: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
  accent: '#2563EB',
};

export type HomeServiceAction =
  | { type: 'route'; route: string }
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
    color: '#5BB8E8',
    action: { type: 'route', route: ROUTES.TEST_DRIVE },
  },
  {
    id: 'inventory',
    title: 'Browse inventory',
    icon: 'car-multiple',
    color: '#34D399',
    action: { type: 'tab', tab: ROUTES.INVENTORY },
  },
  {
    id: 'service',
    title: 'Book service',
    icon: 'wrench-clock',
    color: '#FBBF24',
    action: { type: 'route', route: ROUTES.BOOK_APPOINTMENT },
  },
  {
    id: 'financing',
    title: 'Financing',
    icon: 'calculator-variant',
    color: '#FB923C',
    action: { type: 'route', route: ROUTES.BOOK_APPOINTMENT },
  },
  {
    id: 'trade-in',
    title: 'Trade-in',
    icon: 'swap-horizontal',
    color: '#1E3A5F',
    action: { type: 'route', route: ROUTES.BOOK_APPOINTMENT },
  },
];

export const SIDE_MENU_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home-outline', tab: ROUTES.HOME },
  { id: 'inventory', label: 'Inventory', icon: 'car-outline', tab: ROUTES.INVENTORY },
  { id: 'appointments', label: 'My appointments', icon: 'calendar-check-outline', tab: ROUTES.MY_APPOINTMENTS },
  { id: 'profile', label: 'My profile', icon: 'account-outline', tab: ROUTES.PROFILE },
] as const;
