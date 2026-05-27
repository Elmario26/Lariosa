import React, { FC, ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useAnimatedOverlay } from '../../hooks/useAnimatedOverlay';

export type OverlayAnimation = 'slide-left' | 'slide-up' | 'scale' | 'fade';
export type OverlayPlacement = 'left' | 'bottom' | 'center';

interface AnimatedModalShellProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  placement?: OverlayPlacement;
  animation?: OverlayAnimation;
  slideDistance?: number;
  backdropOpacity?: number;
  panelStyle?: StyleProp<ViewStyle>;
  /** When false, tapping the backdrop does not close (e.g. destructive dialogs) */
  dismissOnBackdrop?: boolean;
}

interface AnimatedPanelProps {
  progress: SharedValue<number>;
  animation: OverlayAnimation;
  slideDistance: number;
  panelStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const AnimatedPanel: FC<AnimatedPanelProps> = ({
  progress,
  animation,
  slideDistance,
  panelStyle,
  children,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value;

    switch (animation) {
      case 'slide-left':
        return {
          transform: [{ translateX: interpolate(t, [0, 1], [-slideDistance, 0]) }],
        };
      case 'slide-up':
        return {
          transform: [{ translateY: interpolate(t, [0, 1], [slideDistance, 0]) }],
        };
      case 'scale':
        return {
          opacity: interpolate(t, [0, 1], [0, 1]),
          transform: [{ scale: interpolate(t, [0, 1], [0.92, 1]) }],
        };
      case 'fade':
      default:
        return { opacity: t };
    }
  });

  return <Animated.View style={[panelStyle, animatedStyle]}>{children}</Animated.View>;
};

const AnimatedModalShell: FC<AnimatedModalShellProps> = ({
  visible,
  onClose,
  children,
  placement = 'center',
  animation,
  slideDistance = 320,
  backdropOpacity = 0.4,
  panelStyle,
  dismissOnBackdrop = true,
}) => {
  const resolvedAnimation: OverlayAnimation =
    animation ??
    (placement === 'left' ? 'slide-left' : placement === 'bottom' ? 'slide-up' : 'scale');

  const { mounted, progress } = useAnimatedOverlay({
    visible,
    driver: resolvedAnimation === 'scale' ? 'spring' : 'timing',
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * backdropOpacity,
  }));

  if (!mounted) return null;

  const renderPanel = (): ReactNode => (
    <AnimatedPanel
      progress={progress}
      animation={resolvedAnimation}
      slideDistance={slideDistance}
      panelStyle={panelStyle}
    >
      {children}
    </AnimatedPanel>
  );

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="none" />

        {placement === 'left' && (
          <View style={styles.row}>
            <Pressable onPress={(e) => e.stopPropagation()}>{renderPanel()}</Pressable>
            <Pressable
              style={styles.flexFill}
              onPress={dismissOnBackdrop ? onClose : undefined}
              accessibilityRole="button"
            />
          </View>
        )}

        {placement === 'bottom' && (
          <View style={styles.columnEnd}>
            <Pressable
              style={styles.flexFill}
              onPress={dismissOnBackdrop ? onClose : undefined}
              accessibilityRole="button"
            />
            <View style={styles.bottomHost} pointerEvents="box-none">
              {renderPanel()}
            </View>
          </View>
        )}

        {placement === 'center' && (
          <Pressable style={styles.center} onPress={dismissOnBackdrop ? onClose : undefined}>
            <View style={styles.centerPanelHost} pointerEvents="box-none">
              {renderPanel()}
            </View>
          </Pressable>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  columnEnd: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  flexFill: {
    flex: 1,
  },
  bottomHost: {
    width: '100%',
  },
  centerPanelHost: {
    width: '100%',
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnimatedModalShell;
