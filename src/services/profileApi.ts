import { Platform } from "react-native";
import { MediaUploadRequest, MediaUploadResponse, ResidentProfile, ResidentProfilePatch } from "../types/profile";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Platform.OS === "android" ? "http://10.0.2.2:4000/api/v1" : "http://localhost:4000/api/v1");

const API_HEADERS = {
  "Content-Type": "application/json",
  "x-role": "Resident",
  "x-user-id": "usr-res-001"
};

const USE_MOCKS = process.env.EXPO_PUBLIC_USE_PROFILE_MOCKS !== "false";

export const MOCK_PROFILE_RESPONSE: ResidentProfile = {
  id: "usr-res-001",
  display_name: "Andrea Buciuman",
  unit_number: "A-102",
  block: "A",
  move_in_date: "2024-08-12",
  phone: "+919762006688",
  email: "andrea@planet.app",
  avatar_url: null,
  updated_at: "2026-04-02T06:00:00.000Z"
};

export const MOCK_UPLOAD_RESPONSE: MediaUploadResponse = {
  presigned_url: "mock://upload/avatar",
  public_url: "https://dummy-docs.com/avatars/usr-res-001-latest.webp"
};

function isNetworkFailure(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return message.includes("network") || message.includes("failed to fetch") || message.includes("timeout");
}

export async function fetchProfileApi(residentId: string): Promise<ResidentProfile> {
  if (USE_MOCKS) {
    await wait(220);
    return { ...MOCK_PROFILE_RESPONSE, id: residentId };
  }

  const response = await fetch(`${API_BASE_URL}/residents/${residentId}/profile`, {
    method: "GET",
    headers: API_HEADERS
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profile (${response.status}).`);
  }
  return (await response.json()) as ResidentProfile;
}

export async function patchProfileApi(residentId: string, patch: ResidentProfilePatch): Promise<ResidentProfile> {
  if (USE_MOCKS) {
    await wait(260);
    return {
      ...MOCK_PROFILE_RESPONSE,
      id: residentId,
      ...patch,
      updated_at: new Date().toISOString()
    };
  }

  const response = await fetch(`${API_BASE_URL}/residents/${residentId}/profile`, {
    method: "PATCH",
    headers: API_HEADERS,
    body: JSON.stringify(patch)
  });

  if (!response.ok) {
    throw new Error(`Failed to update profile (${response.status}).`);
  }
  return (await response.json()) as ResidentProfile;
}

export async function createMediaUploadApi(payload: MediaUploadRequest): Promise<MediaUploadResponse> {
  if (USE_MOCKS) {
    await wait(180);
    return {
      ...MOCK_UPLOAD_RESPONSE,
      public_url: `https://dummy-docs.com/avatars/${Date.now()}-${payload.filename}`
    };
  }

  const response = await fetch(`${API_BASE_URL}/media/upload`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to get upload URL (${response.status}).`);
  }

  return (await response.json()) as MediaUploadResponse;
}

export async function uploadFileToPresignedUrl(
  presignedUrl: string,
  file: { uri: string; type: string; name: string }
): Promise<void> {
  if (presignedUrl.startsWith("mock://")) {
    await wait(220);
    return;
  }

  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type
    },
    body: (await (await fetch(file.uri)).blob()) as unknown as BodyInit
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status}).`);
  }
}

export async function withSingleRetryOnNetwork<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isNetworkFailure(error)) {
      throw error;
    }
    await wait(500);
    return operation();
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
