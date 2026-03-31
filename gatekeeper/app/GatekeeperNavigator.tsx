import { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import { CreateEntryScreen } from "../screens/CreateEntryScreen";
import { GateActionScreen } from "../screens/GateActionScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ApprovalStatusScreen } from "../screens/ApprovalStatusScreen";
import type { AppScreen } from "./types";

export function GatekeeperNavigator() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const { isOnline } = useNetworkStatus();
  const { queueCount } = useOfflineQueue();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>Network: {isOnline ? "Online" : "Offline"}</Text>
        <Text style={styles.statusText}>Queued Actions: {queueCount}</Text>
      </View>

      {screen === "home" ? (
        <HomeScreen onCreateEntry={() => setScreen("createEntry")} onStatus={() => setScreen("status")} onGate={() => setScreen("gate")} />
      ) : null}

      {screen === "createEntry" ? (
        <CreateEntryScreen
          onBack={() => setScreen("home")}
          onCreated={() => {
            setScreen("status");
          }}
        />
      ) : null}

      {screen === "status" ? <ApprovalStatusScreen onBack={() => setScreen("home")} /> : null}
      {screen === "gate" ? <GateActionScreen onBack={() => setScreen("home")} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#030712"
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6
  },
  statusText: {
    color: "#60A5FA",
    fontSize: 12,
    fontWeight: "600"
  }
});
