import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ProfileFieldErrors, ResidentProfilePatch } from "../../types/profile";
import { maskPhoneInput, sanitizePhoneInput } from "../../utils/profileValidation";
import { ProfileThemeTokens } from "../../theme/profileTheme";

type ProfileEditFormProps = {
  values: ResidentProfilePatch;
  errors: ProfileFieldErrors;
  onChange: (patch: ResidentProfilePatch) => void;
  onAvatarPress: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  theme: ProfileThemeTokens;
};

export default function ProfileEditForm({
  values,
  errors,
  onChange,
  onAvatarPress,
  onSave,
  onCancel,
  isSaving,
  theme
}: ProfileEditFormProps) {
  const isLight = theme.mode === "light";
  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <Pressable
        style={[styles.avatarCircle, { backgroundColor: isLight ? "#E1E8FA" : "#E7EBFA" }]}
        onPress={onAvatarPress}
      >
        <Text style={[styles.avatarText, { color: isLight ? "#1F2D54" : "#263157" }]}>
          {(values.display_name ?? "A").slice(0, 1).toUpperCase()}
        </Text>
      </Pressable>
      <Text style={[styles.avatarHint, { color: theme.textMuted }]}>Tap avatar to edit</Text>
      <InlineError text={errors.avatar} errorColor={theme.errorText} />

      <FormField
        label="Display Name"
        value={values.display_name ?? ""}
        placeholder="Enter full name"
        onChangeText={(text) => onChange({ display_name: text })}
        error={errors.display_name}
        theme={theme}
      />
      <FormField
        label="Unit Number"
        value={values.unit_number ?? ""}
        placeholder="A-102"
        onChangeText={(text) => onChange({ unit_number: text })}
        error={errors.unit_number}
        theme={theme}
      />
      <FormField
        label="Block"
        value={values.block ?? ""}
        placeholder="A"
        onChangeText={(text) => onChange({ block: text })}
        error={errors.block}
        theme={theme}
      />
      <FormField
        label="Move-in Date"
        value={values.move_in_date ?? ""}
        placeholder="YYYY-MM-DD"
        onChangeText={(text) => onChange({ move_in_date: text })}
        error={errors.move_in_date}
        theme={theme}
      />
      <FormField
        label="Phone"
        value={maskPhoneInput(values.phone ?? "")}
        placeholder="+919876543210"
        onChangeText={(text) => onChange({ phone: sanitizePhoneInput(text) })}
        keyboardType="phone-pad"
        error={errors.phone}
        theme={theme}
      />
      <FormField
        label="Email"
        value={values.email ?? ""}
        placeholder="example@planet.app"
        onChangeText={(text) => onChange({ email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        theme={theme}
      />

      <View style={styles.actionRow}>
        <Pressable
          style={[styles.secondaryButton, { borderColor: theme.secondaryButtonBorder }]}
          onPress={onCancel}
          disabled={isSaving}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.secondaryButtonText }]}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryButton, { backgroundColor: theme.primaryButtonBg }]}
          onPress={onSave}
          disabled={isSaving}
        >
          <Text style={[styles.primaryButtonText, { color: theme.primaryButtonText }]}>
            {isSaving ? "Saving..." : "Save Profile"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function FormField({
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType,
  autoCapitalize,
  error,
  theme
}: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  theme: ProfileThemeTokens;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.elevatedBg, borderColor: theme.cardBorder, color: theme.textPrimary }]}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      <InlineError text={error} errorColor={theme.errorText} />
    </View>
  );
}

function InlineError({ text, errorColor }: { text?: string; errorColor: string }) {
  if (!text) {
    return null;
  }
  return <Text style={[styles.errorText, { color: errorColor }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#20253D",
    borderWidth: 1,
    borderColor: "rgba(117,130,244,0.25)",
    borderRadius: 24,
    padding: 20
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E7EBFA",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  },
  avatarText: {
    color: "#263157",
    fontSize: 30,
    fontWeight: "800"
  },
  avatarHint: {
    color: "#8FA0C7",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8
  },
  fieldGroup: {
    marginTop: 12
  },
  label: {
    color: "#B8C2E0",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6
  },
  input: {
    height: 48,
    backgroundColor: "#0D1328",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(117,130,244,0.28)",
    paddingHorizontal: 12,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600"
  },
  actionRow: {
    marginTop: 20,
    flexDirection: "row",
    gap: 10
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(161,197,248,0.55)",
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700"
  },
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#55BEE9",
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "800"
  }
});
