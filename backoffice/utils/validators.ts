export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isRequired(value: string) {
  return value.trim().length > 0;
}

export function minLength(value: string, length: number) {
  return value.trim().length >= length;
}
