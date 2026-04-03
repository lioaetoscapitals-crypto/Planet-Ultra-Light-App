import { StyleSheet, Text, View } from "react-native";
import { AnimatedPressable } from "./AnimatedPressable";

type Props = {
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
};

export function MultiSelectChips({ items, selected, onToggle }: Props) {
  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <AnimatedPressable
            key={item}
            onPress={() => onToggle(item)}
            scaleTo={0.94}
            animatedStyle={[styles.chip, active && styles.activeChip]}
          >
            <Text style={[styles.text, active && styles.activeText]}>{item}</Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    minHeight: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4B5563",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827"
  },
  activeChip: {
    borderColor: "#3B82F6",
    backgroundColor: "#1E3A8A"
  },
  text: {
    color: "#E5E7EB",
    fontWeight: "600"
  },
  activeText: {
    color: "#FFFFFF"
  }
});
