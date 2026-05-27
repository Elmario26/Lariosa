import React, { FC } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MOTION } from '../../constants/motion';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

/** Subtle press scale — use on cards and primary tappable rows */
const AnimatedPressable: FC<AnimatedPressableProps> = ({
  children,
  style,
  scaleTo = 0.98,
  onPressIn,
  onPressOut,
  ...rest
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableBase
      {...rest}
      style={[style, animatedStyle]}
      onPressIn={(e) => {
        scale.value = withTiming(scaleTo, { duration: MOTION.duration.fast });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: MOTION.duration.fast });
        onPressOut?.(e);
      }}
    >
      {children}
    </AnimatedPressableBase>
  );
};

export default AnimatedPressable;
