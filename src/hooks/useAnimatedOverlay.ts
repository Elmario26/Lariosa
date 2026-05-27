import { useEffect, useLayoutEffect, useState } from 'react';
import {
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';
import { MOTION } from '../constants/motion';

type OverlayDriver = 'timing' | 'spring';

interface UseAnimatedOverlayOptions {
  visible: boolean;
  driver?: OverlayDriver;
  openConfig?: WithTimingConfig | WithSpringConfig;
  closeConfig?: WithTimingConfig | WithSpringConfig;
}

const defaultOpenTiming: WithTimingConfig = {
  duration: MOTION.duration.normal,
  easing: MOTION.easing.out,
};

const defaultCloseTiming: WithTimingConfig = {
  duration: MOTION.duration.fast,
  easing: MOTION.easing.in,
};

/**
 * Keeps the modal mounted while the close animation runs; exposes 0→1 progress.
 */
export function useAnimatedOverlay({
  visible,
  driver = 'timing',
  openConfig,
  closeConfig,
}: UseAnimatedOverlayOptions) {
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(visible ? 1 : 0);

  useLayoutEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  useEffect(() => {
    if (visible) {
      if (driver === 'spring') {
        progress.value = withSpring(1, (openConfig as WithSpringConfig) ?? MOTION.spring.overlay);
      } else {
        progress.value = withTiming(1, (openConfig as WithTimingConfig) ?? defaultOpenTiming);
      }
      return;
    }

    const onClosed = (): void => {
      setMounted(false);
    };

    if (driver === 'spring') {
      progress.value = withSpring(
        0,
        (closeConfig as WithSpringConfig) ?? MOTION.spring.overlay,
        (finished) => {
          if (finished) runOnJS(onClosed)();
        }
      );
    } else {
      progress.value = withTiming(
        0,
        (closeConfig as WithTimingConfig) ?? defaultCloseTiming,
        (finished) => {
          if (finished) runOnJS(onClosed)();
        }
      );
    }
  }, [visible, driver, openConfig, closeConfig, progress]);

  return { mounted, progress };
}
