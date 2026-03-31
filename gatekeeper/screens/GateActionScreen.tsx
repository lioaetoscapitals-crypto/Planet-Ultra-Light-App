import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { FormInput } from "../components/FormInput";
import { LargeButton } from "../components/LargeButton";
import { gateService } from "../modules/gate/gateService";

type Props = {
  onBack: () => void;
};

export function GateActionScreen({ onBack }: Props) {
  const [entryId, setEntryId] = useState("");
  const [loading, setLoading] = useState(false);

  const runAction = async (type: "checkIn" | "checkOut") => {
    if (!entryId.trim()) {
      Alert.alert("Entry ID required", "Please enter an entry ID.");
      return;
    }
    setLoading(true);
    try {
      if (type === "checkIn") {
        await gateService.checkIn(entryId.trim());
        Alert.alert("Success", "Visitor checked in.");
      } else {
        await gateService.checkOut(entryId.trim());
        Alert.alert("Success", "Visitor checked out.");
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gate Operations</Text>
      <Text style={styles.subtitle}>Check-in / Check-out by Entry ID</Text>
      <FormInput label="Entry ID" value={entryId} onChangeText={setEntryId} placeholder="Paste entry id" />
      <LargeButton title={loading ? "Processing..." : "Check-In Visitor"} onPress={() => void runAction("checkIn")} disabled={loading} />
      <LargeButton title={loading ? "Processing..." : "Check-Out Visitor"} onPress={() => void runAction("checkOut")} disabled={loading} />
      <LargeButton title="Back" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030712",
    padding: 16,
    gap: 12
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800"
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 14
  }
});
