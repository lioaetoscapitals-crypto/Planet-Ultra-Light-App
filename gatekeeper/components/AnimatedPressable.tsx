import React, { useRef } from "react";
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

type Props = Omit<PressableProps, "children"> & {
  children: React.ReactNode;
  scaleTo?: number;
  animatedStyle?: StyleProp<ViewStyle>;
};

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export function AnimatedPressable({
  children,
  scaleTo = 0.96,
  animatedStyle,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      speed: 22,
      bounciness: 4,
      useNativeDriver: true
    }).start();
  };

  return (
    <AnimatedPressableBase
      {...rest}
      style={[animatedStyle, { transform: [{ scale }] }]}
      onPressIn={(event) => {
        animateTo(scaleTo);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1);
        onPressOut?.(event);
      }}
    >
      {children}
    </AnimatedPressableBase>
  );
}
