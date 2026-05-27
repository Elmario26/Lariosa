import { TransitionPresets } from '@react-navigation/stack';
import { THEME } from '../constants/theme';

/** Opaque scene background — prevents card shadows bleeding through during transitions */
export const opaqueSceneStyle = {
  backgroundColor: THEME.background,
} as const;

/** Stack screens: slide in from the right (iOS-style) */
export const stackScreenOptions = {
  headerShown: false,
  gestureEnabled: true,
  ...TransitionPresets.SlideFromRightIOS,
  cardStyle: opaqueSceneStyle,
};

/**
 * Bottom tabs: no cross-fade (fade stacks both screens and card elevations "ghost").
 * Instant cut keeps one scene visible at a time.
 */
export const tabScreenOptions = {
  headerShown: false,
  animation: 'none' as const,
  sceneStyle: opaqueSceneStyle,
  lazy: true,
};

/** Auth stack: same motion language as main app */
export const authStackScreenOptions = {
  headerShown: false,
  gestureEnabled: true,
  ...TransitionPresets.SlideFromRightIOS,
  cardStyle: { backgroundColor: THEME.background },
};
