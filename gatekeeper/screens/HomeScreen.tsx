import { StyleSheet, Text, View } from "react-native";
import { LargeButton } from "../components/LargeButton";

type Props = {
  onCreateEntry: () => void;
  onStatus: () => void;
  onGate: () => void;
};

export function HomeScreen({ onCreateEntry, onStatus, onGate }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gatekeeper Console</Text>
      <Text style={styles.subtitle}>Fast visitor execution layer</Text>
      <View style={styles.actions}>
        <LargeButton title="Create Visitor Entry" onPress={onCreateEntry} />
        <LargeButton title="Track Approval Status" onPress={onStatus} />
        <LargeButton title="Check-In / Check-Out" onPress={onGate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#030712",
    gap: 10
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800"
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 14
  },
  actions: {
    marginTop: 16,
    gap: 12
  }
});
