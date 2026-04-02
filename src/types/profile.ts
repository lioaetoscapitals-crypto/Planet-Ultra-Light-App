export type ResidentProfile = {
  id: string;
  display_name: string;
  unit_number: string;
  block: string;
  move_in_date: string;
  phone: string;
  email: string;
  avatar_url: string | null;
  updated_at: string;
};

export type ResidentProfilePatch = Partial<
  Pick<
    ResidentProfile,
    "display_name" | "unit_number" | "block" | "move_in_date" | "phone" | "email" | "avatar_url"
  >
>;

export type MediaUploadRequest = {
  filename: string;
  content_type: "image/jpeg" | "image/png" | "image/webp";
  content_length: number;
};

export type MediaUploadResponse = {
  presigned_url: string;
  public_url: string;
};

export type AvatarFileInput = {
  uri: string;
  name: string;
  type: "image/jpeg" | "image/png" | "image/webp";
  size: number;
};

export type ProfileFieldErrors = Partial<
  Record<"display_name" | "unit_number" | "block" | "move_in_date" | "phone" | "email" | "avatar", string>
>;
