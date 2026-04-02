import React, { useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from "react-native";
import ProfileEditForm from "../components/profile/ProfileEditForm";
import ProfileViewCard from "../components/profile/ProfileViewCard";
import { useProfileStore } from "../store/profileStore";
import { AvatarFileInput, ResidentProfilePatch } from "../types/profile";
import { useThemeStore } from "../store/themeStore";
import { profileThemes } from "../theme/profileTheme";

type ProfileScreenProps = {
  residentId?: string;
  onBack: () => void;
};

export default function ProfileScreen({ residentId = "usr-res-001", onBack }: ProfileScreenProps) {
  const themeMode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleMode);
  const theme = profileThemes[themeMode];

  const {
    profile,
    isLoading,
    isSaving,
    error,
    fieldErrors,
    pendingPatch,
    fetchProfile,
    updateProfile,
    retryLastUpdate,
    uploadAvatar,
    clearError
  } = useProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ResidentProfilePatch>({});

  useEffect(() => {
    fetchProfile(residentId);
  }, [fetchProfile, residentId]);

  useEffect(() => {
    if (profile && !isEditing) {
      setDraft({
        display_name: profile.display_name,
        unit_number: profile.unit_number,
        block: profile.block,
        move_in_date: profile.move_in_date,
        phone: profile.phone,
        email: profile.email
      });
    }
  }, [isEditing, profile]);

  const headerTitle = useMemo(() => (isEditing ? "Edit Profile" : "Profile"), [isEditing]);

  const handleSave = async () => {
    const saved = await updateProfile(draft, residentId);
    if (saved) {
      setIsEditing(false);
    }
  };

  const handleAvatarPress = () => {
    const actions = ["Camera", "Gallery", "Remove", "Cancel"];
    const onSelect = (index: number) => {
      if (index === 0) {
        void pickAndUploadAvatar("camera");
      } else if (index === 1) {
        void pickAndUploadAvatar("gallery");
      } else if (index === 2) {
        void removeAvatar();
      }
    };

    if (ActionSheetIOS) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: actions,
          cancelButtonIndex: 3,
          destructiveButtonIndex: 2,
          title: "Profile photo"
        },
        onSelect
      );
      return;
    }

    Alert.alert("Profile photo", "Choose an option", [
      { text: "Camera", onPress: () => onSelect(0) },
      { text: "Gallery", onPress: () => onSelect(1) },
      { text: "Remove", style: "destructive", onPress: () => onSelect(2) },
      { text: "Cancel", style: "cancel" }
    ]);
  };

  const pickAndUploadAvatar = async (source: "camera" | "gallery") => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", `Allow ${source} access to update your profile photo.`);
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
            allowsEditing: true,
            aspect: [1, 1]
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
            allowsEditing: true,
            aspect: [1, 1]
          });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const file: AvatarFileInput = {
      uri: asset.uri,
      name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
      type: resolveMimeType(asset.mimeType),
      size: asset.fileSize ?? 0
    };

    await uploadAvatar(file, residentId);
  };

  const removeAvatar = async () => {
    await updateProfile({ avatar_url: null }, residentId);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBg }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={[styles.backButton, { backgroundColor: theme.elevatedBg, borderColor: theme.cardBorder }]}>
          <Text style={[styles.backButtonText, { color: theme.textSecondary }]}>‹</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{headerTitle}</Text>
      </View>

      <View style={[styles.themeRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View>
          <Text style={[styles.themeRowTitle, { color: theme.textPrimary }]}>Theme</Text>
          <Text style={[styles.themeRowSubtitle, { color: theme.textMuted }]}>
            {themeMode === "dark" ? "Dark mode" : "Light mode"}
          </Text>
        </View>
        <Switch
          value={themeMode === "light"}
          onValueChange={toggleTheme}
          trackColor={{ false: theme.switchTrackFalse, true: theme.switchTrackTrue }}
          thumbColor={theme.switchThumb}
          ios_backgroundColor={theme.switchTrackFalse}
        />
      </View>

      {isLoading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color="#A1C5F8" size="small" />
          <Text style={[styles.loaderText, { color: theme.textMuted }]}>Loading profile...</Text>
        </View>
      ) : profile ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
          {profile.avatar_url ? (
            <View style={styles.avatarPreviewWrap}>
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarPreview} />
            </View>
          ) : null}

          {isEditing ? (
            <ProfileEditForm
              values={draft}
              errors={fieldErrors}
              onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
              onAvatarPress={handleAvatarPress}
              onSave={handleSave}
              onCancel={() => {
                setIsEditing(false);
                clearError();
              }}
              isSaving={isSaving}
              theme={theme}
            />
          ) : (
            <ProfileViewCard profile={profile} onEditPress={() => setIsEditing(true)} theme={theme} />
          )}

          {error ? <Text style={[styles.errorText, { color: theme.errorText }]}>{error}</Text> : null}
          {pendingPatch ? (
            <Pressable
              style={[styles.retryButton, { borderColor: theme.errorText }]}
              onPress={() => void retryLastUpdate(residentId)}
              disabled={isSaving}
            >
              <Text style={[styles.retryButtonText, { color: theme.errorText }]}>Retry Save</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      ) : (
        <View style={styles.loaderWrap}>
          <Text style={[styles.errorText, { color: theme.errorText }]}>Profile not available.</Text>
        </View>
      )}
    </View>
  );
}

function resolveMimeType(mimeType?: string | null): "image/jpeg" | "image/png" | "image/webp" {
  if (mimeType === "image/png" || mimeType === "image/webp") {
    return mimeType;
  }
  return "image/jpeg";
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#060B1D"
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#101B3A",
    borderWidth: 1,
    borderColor: "rgba(117,130,244,0.3)",
    alignItems: "center",
    justifyContent: "center"
  },
  backButtonText: {
    color: "#E7EBFA",
    fontSize: 24,
    lineHeight: 26
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800"
  },
  themeRow: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  themeRowTitle: {
    fontSize: 16,
    fontWeight: "800"
  },
  themeRowSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
    gap: 14
  },
  loaderWrap: {
    marginTop: 80,
    alignItems: "center",
    gap: 10
  },
  loaderText: {
    fontSize: 15,
    fontWeight: "600"
  },
  avatarPreviewWrap: {
    alignItems: "center"
  },
  avatarPreview: {
    width: 72,
    height: 72,
    borderRadius: 36
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700"
  },
  retryButton: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245,106,106,0.7)",
    alignItems: "center",
    justifyContent: "center"
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: "800"
  }
});
