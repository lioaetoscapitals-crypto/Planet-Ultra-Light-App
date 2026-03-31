export const qrService = {
  buildEntryPayload(entryId: string) {
    return JSON.stringify({ entry_id: entryId, type: "gate_entry" });
  },
  parseEntryPayload(raw: string): { entryId: string | null } {
    try {
      const parsed = JSON.parse(raw) as { entry_id?: string };
      return { entryId: parsed.entry_id ?? null };
    } catch {
      return { entryId: null };
    }
  }
};
