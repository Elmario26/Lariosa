import { Easing } from 'react-native-reanimated';

/** Shared motion tokens for overlays and navigation */
export const MOTION = {
  duration: {
    fast: 200,
    normal: 280,
    slow: 340,
  },
  easing: {
    out: Easing.out(Easing.cubic),
    in: Easing.in(Easing.cubic),
    inOut: Easing.inOut(Easing.cubic),
  },
  spring: {
    overlay: { damping: 24, stiffness: 260, mass: 0.85 },
    dialog: { damping: 20, stiffness: 300, mass: 0.8 },
  },
} as const;
