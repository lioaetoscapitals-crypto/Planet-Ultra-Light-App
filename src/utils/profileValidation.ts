import { AvatarFileInput, ProfileFieldErrors, ResidentProfilePatch } from "../types/profile";

const E164_REGEX = /^\+[1-9]\d{7,14}$/;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function sanitizePhoneInput(input: string): string {
  if (!input) {
    return "";
  }
  const leadingPlus = input.trim().startsWith("+") ? "+" : "";
  const digits = input.replace(/\D/g, "");
  return `${leadingPlus}${digits}`;
}

export function maskPhoneInput(input: string): string {
  const sanitized = sanitizePhoneInput(input);
  const hasPlus = sanitized.startsWith("+");
  const digits = sanitized.replace("+", "");
  if (!digits) {
    return hasPlus ? "+" : "";
  }

  const country = digits.slice(0, Math.min(2, digits.length));
  const rest = digits.slice(country.length);
  const chunks = rest.match(/.{1,3}/g) ?? [];
  return `${hasPlus ? "+" : ""}${country}${chunks.length > 0 ? ` ${chunks.join(" ")}` : ""}`;
}

export function validatePhoneE164(phone: string): boolean {
  return E164_REGEX.test(phone);
}

export function validateProfilePatch(patch: ResidentProfilePatch): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};

  if ("display_name" in patch) {
    if (!patch.display_name || patch.display_name.trim().length === 0) {
      errors.display_name = "Name is required.";
    }
  }

  if ("phone" in patch) {
    if (!patch.phone || patch.phone.trim().length === 0) {
      errors.phone = "Phone is required.";
    } else if (!validatePhoneE164(patch.phone)) {
      errors.phone = "Phone must be in E.164 format (example: +919876543210).";
    }
  }

  return errors;
}

export function validateAvatarFile(file: AvatarFileInput): string | null {
  if (!IMAGE_TYPES.has(file.type)) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "Image must be 5MB or smaller.";
  }
  return null;
}

