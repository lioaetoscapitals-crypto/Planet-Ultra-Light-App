import { ThemeMode } from "../types/theme";

export type ProfileThemeTokens = {
  mode: ThemeMode;
  screenBg: string;
  cardBg: string;
  cardBorder: string;
  elevatedBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  errorText: string;
  primaryButtonBg: string;
  primaryButtonText: string;
  secondaryButtonBorder: string;
  secondaryButtonText: string;
  switchTrackFalse: string;
  switchTrackTrue: string;
  switchThumb: string;
};

export const profileThemes: Record<ThemeMode, ProfileThemeTokens> = {
  dark: {
    mode: "dark",
    screenBg: "#060B1D",
    cardBg: "#20253D",
    cardBorder: "rgba(117,130,244,0.25)",
    elevatedBg: "#0D1328",
    textPrimary: "#FFFFFF",
    textSecondary: "#E7EBFA",
    textMuted: "#B8C2E0",
    errorText: "#F56A6A",
    primaryButtonBg: "#55BEE9",
    primaryButtonText: "#061531",
    secondaryButtonBorder: "rgba(161,197,248,0.55)",
    secondaryButtonText: "#DDE8FF",
    switchTrackFalse: "#647499",
    switchTrackTrue: "#55BEE9",
    switchThumb: "#FFFFFF"
  },
  light: {
    mode: "light",
    screenBg: "#F3F6FF",
    cardBg: "#FFFFFF",
    cardBorder: "#C9D3EC",
    elevatedBg: "#F8FAFF",
    textPrimary: "#101A35",
    textSecondary: "#1E2C54",
    textMuted: "#3D4F7A",
    errorText: "#B1132A",
    primaryButtonBg: "#0F62FE",
    primaryButtonText: "#FFFFFF",
    secondaryButtonBorder: "#34508E",
    secondaryButtonText: "#1E2C54",
    switchTrackFalse: "#7D8FB8",
    switchTrackTrue: "#0F62FE",
    switchThumb: "#FFFFFF"
  }
};

