import { StyleSheet, Text } from "react-native";
import { AnimatedPressable } from "./AnimatedPressable";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export function LargeButton({ title, onPress, disabled }: Props) {
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.97}
      animatedStyle={[styles.button, disabled && styles.disabled]}
    >
      <Text style={styles.title}>{title}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#3B82F6",
    minHeight: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  disabled: {
    opacity: 0.5
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700"
  }
});
