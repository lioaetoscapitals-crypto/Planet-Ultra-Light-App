import { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { LargeButton } from "../components/LargeButton";
import { entryService } from "../modules/entry/entryService";
import type { EntryApiItem } from "../modules/entry/types";

type Props = {
  onBack: () => void;
};

export function ApprovalStatusScreen({ onBack }: Props) {
  const [entries, setEntries] = useState<EntryApiItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const response = await entryService.listEntries();
    setEntries(response.items);
  };

  useEffect(() => {
    void load();
    const poll = setInterval(() => {
      void load();
    }, 4000);
    return () => clearInterval(poll);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Approval Status Tracker</Text>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load().finally(() => setRefreshing(false));
            }}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.visitor}>{item.visitorName}</Text>
            <Text style={styles.meta}>Phone: {item.visitorPhone}</Text>
            <Text style={styles.meta}>Status: {item.overallStatus}</Text>
            <Text style={styles.meta}>Entry ID: {item.id}</Text>
          </View>
        )}
      />
      <LargeButton title="Back" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030712",
    padding: 16,
    gap: 10
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800"
  },
  card: {
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#111827",
    marginBottom: 10
  },
  visitor: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700"
  },
  meta: {
    color: "#9CA3AF",
    marginTop: 4
  }
});
