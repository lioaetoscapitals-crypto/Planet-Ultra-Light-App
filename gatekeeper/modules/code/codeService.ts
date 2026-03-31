export const codeService = {
  generateEntryCode(entryId: string) {
    return `GK-${entryId.slice(0, 8).toUpperCase()}`;
  },
  validateEntryCode(value: string) {
    return /^GK-[A-Z0-9]{8}$/.test(value.trim());
  }
};
