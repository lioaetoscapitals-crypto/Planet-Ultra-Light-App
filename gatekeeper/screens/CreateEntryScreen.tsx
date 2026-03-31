import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { FormInput } from "../components/FormInput";
import { LargeButton } from "../components/LargeButton";
import { MultiSelectChips } from "../components/MultiSelectChips";
import { entryService } from "../modules/entry/entryService";
import type { EntryDraft } from "../modules/entry/types";
import { enqueueAction } from "../services/offlineQueueService";
import { APARTMENTS_BY_TOWER, MAX_APARTMENT_SELECTION, TOWERS } from "../utils/constants";
import { isValidPhone, required } from "../utils/validators";

const initialDraft: EntryDraft = {
  tower: "A",
  apartmentIds: [],
  visitorName: "",
  visitorPhone: "",
  company: "",
  visitorCount: "1",
  vehicleNumber: "",
  vehiclePhotoUrl: "",
  visitorPhotoUrl: "",
  visitorType: "guest"
};

type Props = {
  onBack: () => void;
  onCreated: (entryId: string) => void;
};

export function CreateEntryScreen({ onBack, onCreated }: Props) {
  const [draft, setDraft] = useState<EntryDraft>(initialDraft);
  const [loading, setLoading] = useState(false);
  const apartmentOptions = useMemo(() => APARTMENTS_BY_TOWER[draft.tower] ?? [], [draft.tower]);

  const toggleApartment = (apartmentId: string) => {
    setDraft((prev) => {
      const exists = prev.apartmentIds.includes(apartmentId);
      if (exists) {
        return { ...prev, apartmentIds: prev.apartmentIds.filter((id) => id !== apartmentId) };
      }
      if (prev.apartmentIds.length >= MAX_APARTMENT_SELECTION) {
        Alert.alert("Limit reached", `Maximum ${MAX_APARTMENT_SELECTION} apartments allowed per entry.`);
        return prev;
      }
      return { ...prev, apartmentIds: [...prev.apartmentIds, apartmentId] };
    });
  };

  const pickImage = async (target: "visitorPhotoUrl" | "vehiclePhotoUrl") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.7
    });
    if (result.canceled || !result.assets[0]) return;
    setDraft((prev) => ({ ...prev, [target]: result.assets[0].uri }));
  };

  const validate = () => {
    if (!required(draft.visitorName)) return "Visitor name is required";
    if (!isValidPhone(draft.visitorPhone)) return "Valid visitor phone is required";
    if (draft.apartmentIds.length === 0) return "Select at least one apartment";
    return null;
  };

  const submit = async () => {
    const error = validate();
    if (error) {
      Alert.alert("Validation", error);
      return;
    }
    setLoading(true);
    try {
      const response = await entryService.createEntry(draft);
      onCreated(response.entry.id);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unknown error";
      const isNetworkError =
        message.includes("Network request failed") ||
        message.includes("Failed to fetch") ||
        message.includes("NetworkError");

      if (!isNetworkError) {
        Alert.alert("Submit failed", message);
        return;
      }

      await enqueueAction({
        id: `${Date.now()}`,
        type: "create_entry",
        payload: draft,
        createdAt: new Date().toISOString()
      });
      Alert.alert("Offline-safe", "API unreachable. Entry request queued locally.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Visitor Entry</Text>
      <Text style={styles.step}>1. Select Tower</Text>
      <MultiSelectChips
        items={[...TOWERS]}
        selected={[draft.tower]}
        onToggle={(tower) => setDraft((prev) => ({ ...prev, tower, apartmentIds: [] }))}
      />

      <Text style={styles.step}>2. Select Apartments (Multi, max 15)</Text>
      <MultiSelectChips items={apartmentOptions} selected={draft.apartmentIds} onToggle={toggleApartment} />

      <Text style={styles.step}>3. Visitor Details</Text>
      <FormInput label="Visitor Name" value={draft.visitorName} onChangeText={(v) => setDraft({ ...draft, visitorName: v })} />
      <FormInput
        label="Visitor Phone"
        value={draft.visitorPhone}
        onChangeText={(v) => setDraft({ ...draft, visitorPhone: v })}
        keyboardType="phone-pad"
      />
      <FormInput label="Company" value={draft.company} onChangeText={(v) => setDraft({ ...draft, company: v })} />
      <FormInput
        label="Visitor Count"
        value={draft.visitorCount}
        onChangeText={(v) => setDraft({ ...draft, visitorCount: v })}
        keyboardType="number-pad"
      />
      <FormInput
        label="Vehicle Number"
        value={draft.vehicleNumber}
        onChangeText={(v) => setDraft({ ...draft, vehicleNumber: v })}
      />

      <View style={styles.photoRow}>
        <LargeButton title={draft.visitorPhotoUrl ? "Visitor Photo Selected" : "Capture/Select Visitor Photo"} onPress={() => void pickImage("visitorPhotoUrl")} />
        <LargeButton title={draft.vehiclePhotoUrl ? "Vehicle Photo Selected" : "Capture/Select Vehicle Photo"} onPress={() => void pickImage("vehiclePhotoUrl")} />
      </View>

      <View style={styles.actionRow}>
        <LargeButton title="Back" onPress={onBack} />
        <LargeButton title={loading ? "Submitting..." : "Submit Entry"} onPress={() => void submit()} disabled={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030712"
  },
  content: {
    padding: 16,
    gap: 10
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800"
  },
  step: {
    marginTop: 12,
    color: "#BFDBFE",
    fontSize: 14,
    fontWeight: "700"
  },
  photoRow: {
    gap: 10,
    marginTop: 4
  },
  actionRow: {
    gap: 10,
    marginTop: 8,
    marginBottom: 24
  }
});
