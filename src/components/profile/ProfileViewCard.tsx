import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ResidentProfile } from "../../types/profile";
import { ProfileThemeTokens } from "../../theme/profileTheme";

type ProfileViewCardProps = {
  profile: ResidentProfile;
  onEditPress: () => void;
  theme: ProfileThemeTokens;
};

export default function ProfileViewCard({ profile, onEditPress, theme }: ProfileViewCardProps) {
  const isLight = theme.mode === "light";
  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <Pressable onPress={onEditPress} style={[styles.editButton, { backgroundColor: theme.elevatedBg }]}>
        <Text style={[styles.editButtonText, { color: theme.textSecondary }]}>Edit</Text>
      </Pressable>

      {profile.avatar_url ? (
        <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
      ) : (
        <View style={[styles.avatarCircle, { backgroundColor: isLight ? "#E1E8FA" : "#E7EBFA" }]}>
          <Text style={[styles.avatarText, { color: isLight ? "#1F2D54" : "#263157" }]}>
            {profile.display_name.slice(0, 1).toUpperCase()}
          </Text>
        </View>
      )}

      <Text style={[styles.name, { color: theme.textPrimary }]}>{profile.display_name}</Text>

      <View style={styles.metaList}>
        <ProfileLine label="Unit" value={profile.unit_number} theme={theme} />
        <ProfileLine label="Block" value={profile.block} theme={theme} />
        <ProfileLine label="Move-in Date" value={profile.move_in_date} theme={theme} />
        <ProfileLine label="Phone" value={profile.phone} theme={theme} />
        <ProfileLine label="Email" value={profile.email} theme={theme} />
      </View>
    </View>
  );
}

function ProfileLine({ label, value, theme }: { label: string; value: string; theme: ProfileThemeTokens }) {
  return (
    <View style={[styles.metaRow, { backgroundColor: theme.elevatedBg, borderColor: theme.cardBorder }]}>
      <Text style={[styles.metaLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#20253D",
    borderWidth: 1,
    borderColor: "rgba(117,130,244,0.25)",
    borderRadius: 24,
    padding: 20
  },
  editButton: {
    alignSelf: "flex-end",
    backgroundColor: "#2E3659",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  editButtonText: {
    color: "#E7EBFA",
    fontSize: 14,
    fontWeight: "700"
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E7EBFA",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 8
  },
  avatarText: {
    color: "#263157",
    fontSize: 30,
    fontWeight: "800"
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: "center",
    marginTop: 8
  },
  name: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12
  },
  metaList: {
    marginTop: 20,
    gap: 10
  },
  metaRow: {
    backgroundColor: "rgba(12,16,34,0.8)",
    borderWidth: 1,
    borderColor: "rgba(117,130,244,0.22)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  metaLabel: {
    color: "#9EA7C4",
    fontSize: 12,
    fontWeight: "600"
  },
  metaValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2
  }
});
