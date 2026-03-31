export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export const TOWERS = ["A", "B", "C", "D"] as const;

export const APARTMENTS_BY_TOWER: Record<string, string[]> = {
  A: ["apt-a-102"],
  B: ["apt-b-203"],
  C: [],
  D: []
};

export const MAX_APARTMENT_SELECTION = 15;
