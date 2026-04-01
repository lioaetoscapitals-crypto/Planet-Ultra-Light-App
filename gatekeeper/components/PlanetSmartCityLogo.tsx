import { StyleSheet, Text, View } from "react-native";

type Props = {
  compact?: boolean;
  width?: number;
};

function Dot({ color, size }: { color: string; size: number }) {
  return <View style={[styles.dot, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]} />;
}

export function PlanetSmartCityLogo({ compact = false, width }: Props) {
  const baseWidth = compact ? 176 : 248;
  const resolvedWidth = width ?? baseWidth;
  const scale = resolvedWidth / 248;
  const dotSize = Math.max(4, 7 * scale);
  const titleSize = Math.max(16, 26 * scale);
  const subtitleSize = Math.max(11, 16 * scale);

  return (
    <View style={[styles.row, { width: resolvedWidth }]}>
      <View style={styles.iconWrap}>
        <View style={styles.iconRow}>
          <Dot color="#FF6B6B" size={dotSize} />
        </View>
        <View style={styles.iconRow}>
          <Dot color="#E93A56" size={dotSize} />
          <Dot color="#FF4D6D" size={dotSize} />
          <Dot color="#F5B041" size={dotSize} />
        </View>
        <View style={styles.iconRow}>
          <Dot color="#35B7EA" size={dotSize} />
          <Dot color="#2EA8DF" size={dotSize} />
          <Dot color="#F4D03F" size={dotSize} />
          <Dot color="#D4AC0D" size={dotSize} />
        </View>
        <View style={styles.iconRow}>
          <Dot color="#1594CC" size={dotSize} />
          <Dot color="#4BC27D" size={dotSize} />
        </View>
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { fontSize: titleSize }]}>PLANET</Text>
        <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>smart city</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconRow: {
    flexDirection: "row",
    gap: 3,
    marginVertical: 1,
  },
  dot: {
  },
  textWrap: {
    flexShrink: 1,
  },
  title: {
    color: "#F8FAFF",
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  subtitle: {
    color: "#AEBBD2",
    fontWeight: "700",
    marginTop: -2,
  },
});
