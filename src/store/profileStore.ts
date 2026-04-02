import { create } from "zustand";
import { AvatarFileInput, ProfileFieldErrors, ResidentProfile, ResidentProfilePatch } from "../types/profile";
import { validateAvatarFile, validateProfilePatch } from "../utils/profileValidation";
import {
  createMediaUploadApi,
  fetchProfileApi,
  patchProfileApi,
  uploadFileToPresignedUrl,
  withSingleRetryOnNetwork
} from "../services/profileApi";

const DEFAULT_RESIDENT_ID = "usr-res-001";

type ProfileStoreState = {
  profile: ResidentProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fieldErrors: ProfileFieldErrors;
  pendingPatch: ResidentProfilePatch | null;
  fetchProfile: (residentId?: string) => Promise<void>;
  updateProfile: (patch: ResidentProfilePatch, residentId?: string) => Promise<boolean>;
  retryLastUpdate: (residentId?: string) => Promise<boolean>;
  uploadAvatar: (file: AvatarFileInput, residentId?: string) => Promise<boolean>;
  clearError: () => void;
};

export const useProfileStore = create<ProfileStoreState>((set, get) => ({
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,
  fieldErrors: {},
  pendingPatch: null,

  async fetchProfile(residentId = DEFAULT_RESIDENT_ID) {
    set({ isLoading: true, error: null });
    try {
      const profile = await withSingleRetryOnNetwork(() => fetchProfileApi(residentId));
      set({ profile, isLoading: false, error: null, fieldErrors: {} });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load profile."
      });
    }
  },

  async updateProfile(patch, residentId = DEFAULT_RESIDENT_ID) {
    const validation = validateProfilePatch(patch);
    if (Object.keys(validation).length > 0) {
      set({ fieldErrors: validation });
      return false;
    }

    const previousProfile = get().profile;
    if (!previousProfile) {
      set({ error: "Profile is not loaded yet." });
      return false;
    }

    const optimisticProfile: ResidentProfile = {
      ...previousProfile,
      ...patch,
      updated_at: new Date().toISOString()
    };

    set({
      profile: optimisticProfile,
      isSaving: true,
      error: null,
      fieldErrors: {},
      pendingPatch: patch
    });

    try {
      const updated = await withSingleRetryOnNetwork(() => patchProfileApi(residentId, patch));
      set({
        profile: updated,
        isSaving: false,
        error: null,
        fieldErrors: {},
        pendingPatch: null
      });
      return true;
    } catch (error) {
      set({
        profile: previousProfile,
        isSaving: false,
        error: error instanceof Error ? error.message : "Failed to save profile.",
        pendingPatch: patch
      });
      return false;
    }
  },

  async retryLastUpdate(residentId = DEFAULT_RESIDENT_ID) {
    const pendingPatch = get().pendingPatch;
    if (!pendingPatch) {
      return true;
    }
    return get().updateProfile(pendingPatch, residentId);
  },

  async uploadAvatar(file, residentId = DEFAULT_RESIDENT_ID) {
    const avatarError = validateAvatarFile(file);
    if (avatarError) {
      set({
        fieldErrors: { ...get().fieldErrors, avatar: avatarError }
      });
      return false;
    }

    set({
      isSaving: true,
      error: null,
      fieldErrors: { ...get().fieldErrors, avatar: undefined }
    });

    try {
      const uploadMeta = await withSingleRetryOnNetwork(() =>
        createMediaUploadApi({
          filename: file.name,
          content_type: file.type,
          content_length: file.size
        })
      );

      await withSingleRetryOnNetwork(() =>
        uploadFileToPresignedUrl(uploadMeta.presigned_url, {
          uri: file.uri,
          name: file.name,
          type: file.type
        })
      );

      const result = await get().updateProfile({ avatar_url: uploadMeta.public_url }, residentId);
      set({ isSaving: false });
      return result;
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : "Avatar upload failed."
      });
      return false;
    }
  },

  clearError() {
    set({ error: null });
  }
}));

