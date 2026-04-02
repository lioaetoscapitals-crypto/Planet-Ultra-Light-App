import React, { useEffect, useMemo, useRef, useState } from "react";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker";
import Svg, { Circle, Path, Rect, SvgProps, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { BookingApiEntity, createBookingApi, listBookingsApi, updateBookingApi } from "../services/bookingsApi";
import { AppNotificationApi, listResidentNotificationsApi, markNotificationReadApi } from "../services/notificationsApi";
import ProfileScreen from "./ProfileScreen";
import planetComponents from "../config/planet-components.json";
import { useThemeStore } from "../store/themeStore";
import { profileThemes } from "../theme/profileTheme";
import ThemedBottomSheet, { BottomSheetOption } from "../components/common/ThemedBottomSheet";
import ThemedInputBottomSheet from "../components/common/ThemedInputBottomSheet";

type ScreenMode = "home" | "notifications" | "spaceList" | "spaceDetail" | "bookingForm" | "activities" | "activityDetail" | "profile";
type ActivityScope = "all" | "my";
type ActivityStatusFilter = "all" | "waiting" | "approved" | "declined";

type ModuleCard = {
  id: string;
  title: string;
  subtitle: string;
  background: string;
  accent: string;
  darkAccent?: string;
  renderArtwork: (props: SvgProps) => React.JSX.Element;
};

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  read?: boolean;
};

type SpaceItem = {
  id: string;
  title: string;
  subtitle: string;
  priceResident?: string;
  priceMember?: string;
  price?: string;
  description: string;
  location: string;
  background: string;
  accent: string;
  imageSource: ImageSourcePropType;
  gallerySources: ImageSourcePropType[];
  renderArtwork: (props: SvgProps) => React.JSX.Element;
};

type ActivityCard = {
  id: string;
  title: string;
  category: string;
  time: string;
  status: "approved" | "declined" | "waiting";
  visibility: "Public" | "Private";
  owner: "my" | "all";
};

const HOME_WEATHER_LOCATION = {
  label: "Salisbury Park, Pune",
  latitude: 18.47786,
  longitude: 73.86117
};

const modules: ModuleCard[] = [
  {
    id: "gate",
    title: "Gate",
    subtitle: "Open gate and manage daily entry flow",
    background: "#C87E74",
    accent: "#F2C4BA",
    darkAccent: "#8B4F48",
    renderArtwork: GateArtwork
  },
  {
    id: "space-booking",
    title: "Space Booking",
    subtitle: "Reserve clubhouse, hall and amenities",
    background: "#737CB5",
    accent: "#AAB0E0",
    darkAccent: "#4D578C",
    renderArtwork: SpaceArtwork
  },
  {
    id: "visitors",
    title: "Visitors",
    subtitle: "Track guests, deliveries and approvals",
    background: "#556B88",
    accent: "#8FA7C7",
    darkAccent: "#364559",
    renderArtwork: VisitorsArtwork
  },
  {
    id: "post",
    title: "Post",
    subtitle: "Society announcements and resident posts",
    background: "#C5C5BB",
    accent: "#E9E8DE",
    darkAccent: "#8A8B82",
    renderArtwork: PostArtwork
  },
  {
    id: "reading-news",
    title: "Reading News",
    subtitle: "Daily updates curated for the residents",
    background: "#CF7569",
    accent: "#E7A18D",
    darkAccent: "#944F46",
    renderArtwork: ReadingArtwork
  },
  {
    id: "market",
    title: "Market",
    subtitle: "Shop essentials and neighborhood offers",
    background: "#4B5268",
    accent: "#8791B4",
    darkAccent: "#2E3447",
    renderArtwork: MarketArtwork
  }
];

const defaultNotifications: NotificationItem[] = [];

const spaces: SpaceItem[] = [
  {
    id: "co-work-space",
    title: "Co-Work Space",
    subtitle: "Shared work desks and meeting corners",
    priceResident: "₹ 130 / Day",
    priceMember: "₹ 90 / Day",
    price: "₹ 400 / Day",
    description:
      "A bright shared workspace for residents who need focused time, small meetings, or flexible desk access throughout the day.",
    location: "Waman Ganesh Height, Behind Cafe Peter, Bavdhan, Pune",
    background: "#737CB5",
    accent: "#AAB0E0",
    imageSource: require("../../assets/local/spaces/co-work-space.png"),
    gallerySources: [
      require("../../assets/local/spaces/details/cowork-main.png"),
      require("../../assets/local/spaces/details/cowork-thumb-1.png"),
      require("../../assets/local/spaces/details/cowork-thumb-2.png"),
      require("../../assets/local/spaces/details/cowork-thumb-3.png"),
      require("../../assets/local/spaces/details/cowork-thumb-1.png")
    ],
    renderArtwork: SpaceArtwork
  },
  {
    id: "community-hall",
    title: "Community Hall",
    subtitle: "Host resident gatherings and celebrations",
    priceResident: "₹ 250 / Day",
    priceMember: "₹ 180 / Day",
    price: "₹ 650 / Day",
    description:
      "A large indoor hall suitable for birthday events, resident meetings, workshops, and private celebrations.",
    location: "Clubhouse Ground Floor, Little Earth, Bavdhan, Pune",
    background: "#8D6D8B",
    accent: "#D5B3D3",
    imageSource: require("../../assets/local/spaces/community-hall.png"),
    gallerySources: [
      require("../../assets/local/spaces/community-hall.png"),
      require("../../assets/local/spaces/community-hall.png"),
      require("../../assets/local/spaces/community-hall.png"),
      require("../../assets/local/spaces/community-hall.png"),
      require("../../assets/local/spaces/community-hall.png")
    ],
    renderArtwork: PostArtwork
  },
  {
    id: "swimming-pool",
    title: "Swimming Pool",
    subtitle: "Lane use and private booking slots",
    priceResident: "₹ 180 / Day",
    priceMember: "₹ 120 / Day",
    price: "₹ 450 / Day",
    description:
      "Book dedicated pool access windows for coaching, family use, or resident-only wellness sessions.",
    location: "Outdoor Recreation Deck, Little Earth, Bavdhan, Pune",
    background: "#3F7890",
    accent: "#8FD2E3",
    imageSource: require("../../assets/local/spaces/swimming-pool.png"),
    gallerySources: [
      require("../../assets/local/spaces/swimming-pool.png"),
      require("../../assets/local/spaces/swimming-pool.png"),
      require("../../assets/local/spaces/swimming-pool.png"),
      require("../../assets/local/spaces/swimming-pool.png"),
      require("../../assets/local/spaces/swimming-pool.png")
    ],
    renderArtwork: VisitorsArtwork
  },
  {
    id: "gym",
    title: "Gym",
    subtitle: "Fitness floor and equipment booking",
    priceResident: "₹ 110 / Day",
    priceMember: "₹ 80 / Day",
    price: "₹ 320 / Day",
    description:
      "Reserve the gym for personal training, small classes, or quiet workout hours during non-peak slots.",
    location: "Fitness Studio, Clubhouse Wing, Bavdhan, Pune",
    background: "#575A69",
    accent: "#AAB2C8",
    imageSource: require("../../assets/local/spaces/gym.png"),
    gallerySources: [
      require("../../assets/local/spaces/gym.png"),
      require("../../assets/local/spaces/gym.png"),
      require("../../assets/local/spaces/gym.png"),
      require("../../assets/local/spaces/gym.png"),
      require("../../assets/local/spaces/gym.png")
    ],
    renderArtwork: MarketArtwork
  },
  {
    id: "infinity-pool",
    title: "Infinity Pool",
    subtitle: "Premium poolside sessions with a view",
    priceResident: "₹ 280 / Day",
    priceMember: "₹ 220 / Day",
    price: "₹ 700 / Day",
    description:
      "Premium infinity pool access for private sessions, family recreation, and special occasions.",
    location: "Sky Deck, Little Earth, Bavdhan, Pune",
    background: "#426B9A",
    accent: "#9EC4F1",
    imageSource: require("../../assets/local/spaces/infinity-pool.png"),
    gallerySources: [
      require("../../assets/local/spaces/infinity-pool.png"),
      require("../../assets/local/spaces/infinity-pool.png"),
      require("../../assets/local/spaces/infinity-pool.png"),
      require("../../assets/local/spaces/infinity-pool.png"),
      require("../../assets/local/spaces/infinity-pool.png")
    ],
    renderArtwork: SpaceArtwork
  },
  {
    id: "basketball-court",
    title: "Basketball Court",
    subtitle: "Reserve the court for games and practice",
    priceResident: "₹ 150 / Day",
    priceMember: "₹ 100 / Day",
    price: "₹ 350 / Day",
    description:
      "Outdoor sports court for resident games, coaching sessions, and community tournaments.",
    location: "Sports Block, Little Earth, Bavdhan, Pune",
    background: "#6F5D4C",
    accent: "#DAB38E",
    imageSource: require("../../assets/local/spaces/basketball-court.png"),
    gallerySources: [
      require("../../assets/local/spaces/basketball-court.png"),
      require("../../assets/local/spaces/basketball-court.png"),
      require("../../assets/local/spaces/basketball-court.png"),
      require("../../assets/local/spaces/basketball-court.png"),
      require("../../assets/local/spaces/basketball-court.png")
    ],
    renderArtwork: GateArtwork
  }
];

const activitiesUi = planetComponents.activities as {
  tabs: Array<{ id: ActivityScope; label: string }>;
  statusFilters: Array<{ id: ActivityStatusFilter; label: string }>;
  dateChips: string[];
  statusBadgeLabels: Record<"waiting" | "approved" | "declined", string>;
};
const ACTIVITY_DATES = activitiesUi.dateChips as Array<string>;
const ACTIVITY_TIME_OPTIONS: BottomSheetOption[] = [
  { id: "10:00 AM", label: "10:00 AM" },
  { id: "2:00 PM", label: "2:00 PM" },
  { id: "6:00 PM", label: "6:00 PM" },
  { id: "7:30 PM", label: "7:30 PM" }
];
const EVENT_TYPE_OPTIONS: BottomSheetOption[] = [
  { id: "Birthday", label: "Birthday" },
  { id: "Meeting", label: "Meeting" },
  { id: "Workshop", label: "Workshop" },
  { id: "Cultural Event", label: "Cultural Event" }
];
const DURATION_OPTIONS: BottomSheetOption[] = [
  { id: "1 Hour", label: "1 Hour" },
  { id: "2 Hours", label: "2 Hours" },
  { id: "Half Day", label: "Half Day" },
  { id: "Full Day", label: "Full Day" }
];
const VISIBILITY_OPTIONS: BottomSheetOption[] = [
  { id: "Public", label: "Public" },
  { id: "Private", label: "Private" }
];
const REPEAT_OPTIONS: BottomSheetOption[] = [
  { id: "None", label: "None" },
  { id: "Daily", label: "Daily" },
  { id: "Weekly", label: "Weekly" },
  { id: "Monthly", label: "Monthly" }
];
const ACTIVITY_STATUS_OPTIONS: BottomSheetOption[] = activitiesUi.statusFilters.map((option) => ({
  id: option.id,
  label: option.label
}));
const DEFAULT_BOOKING_USER = "usr-res-001";
const DEFAULT_BOOKING_APARTMENT = "apt-a-102";
const DEFAULT_BOOKING_SOCIETY = "soc-001";

function mapSpaceToApiSpaceType(spaceId: string): "Community Hall" | "Co-Work Space" | "Gym" | "Pool" | "Court" {
  if (spaceId === "community-hall") return "Community Hall";
  if (spaceId === "co-work-space") return "Co-Work Space";
  if (spaceId === "gym") return "Gym";
  if (spaceId === "swimming-pool" || spaceId === "infinity-pool") return "Pool";
  return "Court";
}

function mapApiSpaceTypeToSpaceId(spaceType: "Community Hall" | "Co-Work Space" | "Gym" | "Pool" | "Court"): string {
  if (spaceType === "Community Hall") return "community-hall";
  if (spaceType === "Co-Work Space") return "co-work-space";
  if (spaceType === "Gym") return "gym";
  if (spaceType === "Pool") return "swimming-pool";
  return "basketball-court";
}

function parseDateForApi(value: string): string {
  if (!value || value === "Select Date") {
    return new Date().toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

function parseTimeRange(value: string): { startTime: string; endTime: string } {
  if (value === "10:00 AM") return { startTime: "10:00", endTime: "11:00" };
  if (value === "2:00 PM") return { startTime: "14:00", endTime: "15:00" };
  if (value === "6:00 PM") return { startTime: "18:00", endTime: "19:00" };
  return { startTime: "10:00", endTime: "11:00" };
}

function formatDateForForm(value: string): string {
  if (!value) {
    return "Select Date";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Select Date";
  }
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatTimeForForm(value: string): string {
  const map: Record<string, string> = {
    "10:00": "10:00 AM",
    "14:00": "2:00 PM",
    "18:00": "6:00 PM"
  };
  return map[value] ?? "10:00 AM";
}

function parseFormDateToDate(value: string): Date {
  if (!value || value === "Select Date") {
    return new Date();
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
}

function toActivityStatus(status: string): "approved" | "declined" | "waiting" {
  if (status === "Pending" || status === "ToCheck" || status === "Draft") return "waiting";
  if (status === "Approved" || status === "Online" || status === "Refunded" || status === "ToPay" || status === "Refund") {
    return "approved";
  }
  if (status === "Rejected" || status === "Cancelled") return "declined";
  return "approved";
}

function isRejectedStatus(status: string) {
  return status === "Rejected" || status === "Cancelled";
}

function formatClockFrom24(value: string): string {
  const [hourRaw, minuteRaw] = value.split(":");
  const hour = Number.parseInt(hourRaw ?? "0", 10);
  const minute = Number.parseInt(minuteRaw ?? "0", 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(normalizedHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function formatRelativeTime(value: string): string {
  const parsed = new Date(value).getTime();
  if (!Number.isFinite(parsed)) {
    return "Just now";
  }
  const diffMs = Math.max(0, Date.now() - parsed);
  const diffMin = Math.floor(diffMs / (60 * 1000));
  if (diffMin < 1) {
    return "Just now";
  }
  if (diffMin < 60) {
    return `${diffMin} min ago`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day ago`;
}

function mapNotificationApiItem(item: AppNotificationApi): NotificationItem {
  return {
    id: item.id,
    title: item.title,
    body: item.body,
    time: formatRelativeTime(item.createdAt),
    read: item.read
  };
}

function buildActivityCards(bookings: BookingApiEntity[]): ActivityCard[] {
  return bookings.map((booking) => ({
    id: booking.id,
    title: booking.eventType,
    category: booking.spaceType,
    time: formatClockFrom24(booking.startTime),
    status: toActivityStatus(booking.status),
    visibility: booking.visibility,
    owner: booking.requesterUserId === DEFAULT_BOOKING_USER ? "my" : "all"
  }));
}

export default function PlanetScreen() {
  const themeMode = useThemeStore((state) => state.mode);
  const theme = profileThemes[themeMode];
  const isLight = themeMode === "light";
  const [screenMode, setScreenMode] = useState<ScreenMode>("home");
  const [selectedSpaceId, setSelectedSpaceId] = useState(spaces[0].id);
  const [selectedSpaceGalleryIndex, setSelectedSpaceGalleryIndex] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [temperature, setTemperature] = useState(26);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [eventType, setEventType] = useState("Select event type");
  const [eventDate, setEventDate] = useState("Select Date");
  const [eventTime, setEventTime] = useState("Select Time");
  const [eventDuration, setEventDuration] = useState("Select Duration");
  const [repeatMode, setRepeatMode] = useState("None");
  const [visibility, setVisibility] = useState<"Select" | "Public" | "Private">("Select");
  const [message, setMessage] = useState("");
  const [bookingItems, setBookingItems] = useState<BookingApiEntity[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [activityScope, setActivityScope] = useState<ActivityScope>("all");
  const [activityStatusFilter, setActivityStatusFilter] = useState<ActivityStatusFilter>("all");
  const [selectedActivityDate, setSelectedActivityDate] = useState<string>("Today");
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<
    null | "statusFilter" | "eventType" | "time" | "duration" | "visibility" | "message"
  >(null);
  const [isIosDatePickerVisible, setIsIosDatePickerVisible] = useState(false);
  const [isVoiceAssistantActive, setIsVoiceAssistantActive] = useState(false);
  const [voiceReply, setVoiceReply] = useState("Tap a command and Planet App will respond.");
  const [selectedIndianVoice, setSelectedIndianVoice] = useState<string | undefined>(undefined);
  const [selectedIndianVoiceName, setSelectedIndianVoiceName] = useState("Default");
  const [selectedIndianVoiceLanguage, setSelectedIndianVoiceLanguage] = useState("en-IN");
  const [availableIndianVoices, setAvailableIndianVoices] = useState<
    Array<{ identifier: string; name: string; language: string }>
  >([]);
  const previousBookingsRef = useRef<Record<string, { status: string; reason?: string; updatedAt: string }>>({});

  const selectedSpace = spaces.find((space) => space.id === selectedSpaceId) ?? spaces[0];
  const selectedSpaceGallery = selectedSpace.gallerySources.length > 0 ? selectedSpace.gallerySources : [selectedSpace.imageSource];
  const selectedSpaceGalleryImage =
    selectedSpaceGallery[
      Math.min(
        selectedSpaceGalleryIndex,
        Math.max(selectedSpaceGallery.length - 1, 0)
      )
    ];
  const activityCards = useMemo(() => buildActivityCards(bookingItems), [bookingItems]);
  const filteredActivities = useMemo(() => {
    const byScope =
      activityScope === "my"
        ? activityCards.filter((item) => item.owner === "my")
        : activityCards.filter((item) => item.visibility === "Public" || item.owner === "my");

    if (activityStatusFilter === "all") {
      return byScope;
    }

    return byScope.filter((item) => item.status === activityStatusFilter);
  }, [activityCards, activityScope, activityStatusFilter]);
  const selectedActivityBooking = useMemo(
    () => bookingItems.find((item) => item.id === selectedActivityId) ?? null,
    [bookingItems, selectedActivityId]
  );
  const activityDetailSpace = useMemo(
    () =>
      spaces.find((space) => {
        if (!selectedActivityBooking) {
          return false;
        }
        return space.id === mapApiSpaceTypeToSpaceId(selectedActivityBooking.spaceType);
      }) ?? spaces[0],
    [selectedActivityBooking]
  );
  const activeBottomSheetOptions = useMemo(() => {
    if (activeSheet === "statusFilter") return ACTIVITY_STATUS_OPTIONS;
    if (activeSheet === "eventType") return EVENT_TYPE_OPTIONS;
    if (activeSheet === "time") return ACTIVITY_TIME_OPTIONS;
    if (activeSheet === "duration") return DURATION_OPTIONS;
    if (activeSheet === "visibility") return VISIBILITY_OPTIONS;
    return [];
  }, [activeSheet]);
  const activeBottomSheetTitle = useMemo(() => {
    if (activeSheet === "statusFilter") return "Filter Activity Status";
    if (activeSheet === "eventType") return "Select Event Type";
    if (activeSheet === "time") return "Select Time";
    if (activeSheet === "duration") return "Select Duration";
    if (activeSheet === "visibility") return "Select Visibility";
    return "";
  }, [activeSheet]);
  const activeBottomSheetSelectedId = useMemo(() => {
    if (activeSheet === "statusFilter") return activityStatusFilter;
    if (activeSheet === "eventType") return eventType;
    if (activeSheet === "time") return eventTime;
    if (activeSheet === "duration") return eventDuration;
    if (activeSheet === "visibility") return visibility;
    return undefined;
  }, [activeSheet, activityStatusFilter, eventDuration, eventTime, eventType, visibility]);
  const unreadNotificationCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  useEffect(() => {
    setSelectedSpaceGalleryIndex(0);
  }, [selectedSpaceId]);

  const greetingText = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return "Good Morning,";
    if (hour < 17) return "Good Afternoon,";
    if (hour < 21) return "Good Evening,";
    return "Good Night,";
  }, [now]);

  const weatherEmoji = useMemo(() => {
    if (temperature >= 32) return "☀️";
    if (temperature >= 25) return "⛅";
    if (temperature >= 18) return "🌤️";
    return "🌥️";
  }, [temperature]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadIndianVoice = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const preferredVoiceName = "tara";
        const femaleHints = [
          "female",
          "woman",
          "samantha",
          "veena",
          "karen",
          "moira",
          "allison",
          "ava",
          "siri female"
        ];

        const indianVoices = voices.filter(
          (voice) =>
            voice.language === "en-IN" ||
            voice.language === "hi-IN" ||
            voice.language?.toLowerCase().includes("-in")
        );

        const taraVoice = indianVoices.find((voice) => {
          const normalized = `${voice.name ?? ""} ${voice.identifier ?? ""}`.toLowerCase();
          return normalized.includes(preferredVoiceName);
        });

        const indianFemaleVoice = indianVoices.find((voice) => {
          const normalized = `${voice.name ?? ""} ${voice.identifier ?? ""}`.toLowerCase();
          return femaleHints.some((hint) => normalized.includes(hint));
        });

        const indianVoice = taraVoice ?? indianFemaleVoice ?? indianVoices[0];
        if (indianVoice?.identifier) {
          setSelectedIndianVoice(indianVoice.identifier);
          setSelectedIndianVoiceName(indianVoice.name ?? indianVoice.identifier);
          setSelectedIndianVoiceLanguage(indianVoice.language ?? "en-IN");
        }

        if (indianVoices.length > 0) {
          setAvailableIndianVoices(
            indianVoices
              .filter((voice) => !!voice.identifier)
              .map((voice) => ({
                identifier: voice.identifier as string,
                name: voice.name ?? voice.identifier ?? "Unknown",
                language: voice.language ?? "en-IN"
              }))
          );
        }
      } catch {
        setSelectedIndianVoice(undefined);
        setSelectedIndianVoiceName("Default");
        setSelectedIndianVoiceLanguage("en-IN");
        setAvailableIndianVoices([]);
      }
    };

    loadIndianVoice();
  }, []);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const speakInIndianVoice = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: selectedIndianVoiceLanguage,
      voice: selectedIndianVoice,
      rate: 0.93,
      pitch: 1.0
    });
  };

  const activateVoiceConversation = () => {
    setIsVoiceAssistantActive(true);
    const greeting =
      "Namaste. I am Planet voice assistant. How can I help with gate, notices, news, payments, or space booking?";
    setVoiceReply(greeting);
    speakInIndianVoice(greeting);
  };

  const handleVoiceCommand = (command: "gate" | "notices" | "news" | "payments" | "booking") => {
    const responses: Record<typeof command, string> = {
      gate: "Gate management is ready. You can approve visitors and check recent entries.",
      notices: "Showing latest community notices for all residents.",
      news: "Opening your society and neighborhood news updates.",
      payments: "Payments module is available. You can review dues and recent transactions.",
      booking: "Space booking is open. I can help you reserve clubhouse and amenities."
    };
    const response = responses[command];
    setVoiceReply(response);
    speakInIndianVoice(response);
  };

  const cycleIndianVoice = () => {
    if (availableIndianVoices.length === 0) {
      const fallback = "No Indian voice list found. Using default voice.";
      setVoiceReply(fallback);
      speakInIndianVoice(fallback);
      return;
    }

    const currentIndex = availableIndianVoices.findIndex((voice) => voice.identifier === selectedIndianVoice);
    const nextIndex = currentIndex === -1 || currentIndex === availableIndianVoices.length - 1 ? 0 : currentIndex + 1;
    const nextVoice = availableIndianVoices[nextIndex];

    setSelectedIndianVoice(nextVoice.identifier);
    setSelectedIndianVoiceName(nextVoice.name);
    setSelectedIndianVoiceLanguage(nextVoice.language);

    const msg = `Switched voice to ${nextVoice.name}.`;
    setVoiceReply(msg);
    speakInIndianVoice(msg);
  };

  useEffect(() => {
    let isMounted = true;

    const loadWeather = async () => {
      try {
        setIsWeatherLoading(true);
        setWeatherError(null);
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${HOME_WEATHER_LOCATION.latitude}&longitude=${HOME_WEATHER_LOCATION.longitude}&current=temperature_2m`
        );

        if (!weatherResponse.ok) {
          throw new Error(`Weather request failed with ${weatherResponse.status}`);
        }

        const weatherJson = await weatherResponse.json();
        const liveTemperature = weatherJson?.current?.temperature_2m;

        if (typeof liveTemperature !== "number") {
          throw new Error("Temperature missing from weather response");
        }

        if (isMounted) {
          setTemperature(Math.round(liveTemperature));
          setIsWeatherLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setWeatherError("Weather unavailable");
          setIsWeatherLoading(false);
        }
      }
    };

    loadWeather();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadActivities = async () => {
    try {
      setIsActivitiesLoading(true);
      const response = await listBookingsApi();
      const generatedNotifications: NotificationItem[] = [];
      response.forEach((booking) => {
        if (booking.requesterUserId !== DEFAULT_BOOKING_USER) {
          return;
        }
        const previous = previousBookingsRef.current[booking.id];
        if (!previous) {
          return;
        }
        const changedToRejected = !isRejectedStatus(previous.status) && isRejectedStatus(booking.status);
        const rejectReason = booking.rejectedReason?.trim();
        if (changedToRejected && rejectReason) {
          Alert.alert("Activity Rejected", `Your activity "${booking.eventType}" was rejected.\nReason: ${rejectReason}`);
        }
        const statusChanged = previous.status !== booking.status;
        if (statusChanged) {
          generatedNotifications.push({
            id: `local-${booking.id}-${booking.updatedAt}`,
            title: `Activity ${booking.status}`,
            body:
              booking.status === "Rejected" && rejectReason
                ? `${booking.eventType} was rejected. Reason: ${rejectReason}`
                : `${booking.eventType} status changed to ${booking.status}.`,
            time: "Just now",
            read: false
          });
        }
      });
      previousBookingsRef.current = response.reduce<Record<string, { status: string; reason?: string; updatedAt: string }>>(
        (accumulator, booking) => {
          accumulator[booking.id] = {
            status: booking.status,
            reason: booking.rejectedReason,
            updatedAt: booking.updatedAt
          };
          return accumulator;
        },
        {}
      );
      setBookingItems(response);
      if (generatedNotifications.length > 0) {
        setNotifications((previous) => {
          const existingIds = new Set(previous.map((item) => item.id));
          const incoming = generatedNotifications.filter((item) => !existingIds.has(item.id));
          return incoming.length > 0 ? [...incoming, ...previous] : previous;
        });
      }
    } catch (error) {
      Alert.alert("Activities unavailable", error instanceof Error ? error.message : "Unable to load activities.");
    } finally {
      setIsActivitiesLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setIsNotificationsLoading(true);
      const response = await listResidentNotificationsApi();
      const apiItems = response.map(mapNotificationApiItem);
      setNotifications((previous) => {
        const merged = [...apiItems];
        const existingIds = new Set(apiItems.map((item) => item.id));
        previous.forEach((item) => {
          if (!existingIds.has(item.id)) {
            merged.push(item);
          }
        });
        return merged;
      });
    } catch {
      // Keep existing notification state if API is temporarily unavailable.
    } finally {
      setIsNotificationsLoading(false);
    }
  };

  useEffect(() => {
    void loadActivities();
    const timer = setInterval(() => {
      void loadActivities();
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, []);

  useEffect(() => {
    if (screenMode !== "notifications") {
      return;
    }
    void loadNotifications();
  }, [screenMode]);

  const startEditActivity = (activityId: string) => {
    const source = bookingItems.find((item) => item.id === activityId);
    if (!source) {
      Alert.alert("Unable to edit", "Activity record not found.");
      return;
    }
    if (toActivityStatus(source.status) !== "waiting" || source.requesterUserId !== DEFAULT_BOOKING_USER) {
      Alert.alert("Edit blocked", "Only your waiting activities can be edited.");
      return;
    }

    setEditingBookingId(source.id);
    setSelectedSpaceId(mapApiSpaceTypeToSpaceId(source.spaceType));
    setEventType(source.eventType);
    setEventDate(formatDateForForm(source.bookingDate));
    setEventTime(formatTimeForForm(source.startTime));
    setEventDuration("1 Hour");
    setVisibility(source.visibility);
    setMessage(source.message ?? "");
    setScreenMode("bookingForm");
  };

  const openActivityDetails = (activityId: string) => {
    setSelectedActivityId(activityId);
    setScreenMode("activityDetail");
  };

  const onNativeDateSelected = (selectedDate: Date) => {
    const formatted = selectedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    setEventDate(formatted);
  };

  const openNativeDatePicker = () => {
    const pickerValue = parseFormDateToDate(eventDate);
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: pickerValue,
        mode: "date",
        onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
          if (event.type !== "set" || !selectedDate) {
            return;
          }
          onNativeDateSelected(selectedDate);
        }
      });
      return;
    }
    setIsIosDatePickerVisible(true);
  };

  const handleBookSpace = async () => {
    if (eventType === "Select event type" || eventDate === "Select Date" || eventTime === "Select Time" || eventDuration === "Select Duration") {
      Alert.alert("Incomplete form", "Please select event type, date, time, and duration.");
      return;
    }
    if (visibility === "Select") {
      Alert.alert("Visibility required", "Please select Public or Private visibility.");
      return;
    }
    setIsBookingSubmitting(true);
    try {
      const timeRange = parseTimeRange(eventTime);
      if (editingBookingId) {
        const existing = bookingItems.find((item) => item.id === editingBookingId);
        if (!existing) {
          throw new Error("Activity to edit was not found.");
        }
        const updated = await updateBookingApi(editingBookingId, {
          societyId: DEFAULT_BOOKING_SOCIETY,
          requesterUserId: DEFAULT_BOOKING_USER,
          apartmentId: DEFAULT_BOOKING_APARTMENT,
          eventType,
          spaceType: mapSpaceToApiSpaceType(selectedSpace.id),
          visibility,
          message: message.trim() || undefined,
          bookingDate: parseDateForApi(eventDate),
          startTime: timeRange.startTime,
          endTime: timeRange.endTime,
          status: existing.status
        });
        setBookingItems((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createBookingApi({
          societyId: DEFAULT_BOOKING_SOCIETY,
          requesterUserId: DEFAULT_BOOKING_USER,
          apartmentId: DEFAULT_BOOKING_APARTMENT,
          eventType,
          spaceType: mapSpaceToApiSpaceType(selectedSpace.id),
          visibility,
          message: message.trim() || undefined,
          bookingDate: parseDateForApi(eventDate),
          startTime: timeRange.startTime,
          endTime: timeRange.endTime,
          status: "Pending"
        });
        setBookingItems((previous) => [created, ...previous]);
      }

      setEditingBookingId(null);
      setActivityScope("my");
      setSelectedActivityDate("Today");
      setScreenMode("activities");
    } catch (error) {
      Alert.alert("Booking failed", error instanceof Error ? error.message : "Unable to submit booking request.");
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.screenBg }]}>
      <StatusBar style={isLight ? "dark" : "light"} />
      <View style={[styles.screen, { backgroundColor: theme.screenBg }]}>
        <View style={screenMode === "home" ? styles.pageInsetHome : styles.pageInset}>
          {screenMode === "home" ? (
            <View style={[styles.homeFrame, { backgroundColor: theme.screenBg }]}>
              <View style={styles.figmaHeader}>
                <View style={styles.figmaHeaderLeft}>
                  <Text style={[styles.figmaGreeting, { color: theme.textMuted }]}>{greetingText}</Text>
                  <Text style={[styles.figmaName, { color: theme.textPrimary }]}>Andrea</Text>
                  <View style={styles.figmaAddressRow}>
                    <Text style={[styles.figmaAddress, { color: theme.textMuted }]}>A-102, Tanishq, Pune, India</Text>
                    <ArrowDownIcon width={16} height={16} color={theme.textSecondary} />
                  </View>
                </View>

                <View style={styles.figmaHeaderRight}>
                  <View style={[styles.figmaWeatherChip, { borderColor: theme.cardBorder, backgroundColor: theme.cardBg }]}>
                    <Text style={styles.weatherEmoji}>{weatherEmoji}</Text>
                    <Text style={[styles.figmaWeatherText, { color: theme.textPrimary }]}>
                      {isWeatherLoading ? "..." : `${temperature} °C`}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => setScreenMode("notifications")}
                    style={[styles.figmaBellWrap, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
                  >
                    <BellIcon width={24} height={24} color={theme.textSecondary} />
                    <View style={styles.figmaBadge}>
                      <Text style={styles.figmaBadgeText}>{unreadNotificationCount}</Text>
                    </View>
                  </Pressable>

                  <Pressable style={styles.figmaAvatar} onPress={() => setScreenMode("profile")}>
                    <Text style={styles.figmaAvatarInitial}>A</Text>
                  </Pressable>
                </View>
              </View>

              <Pressable style={styles.cardGate} onPress={() => {}}>
                <GateArtwork width={129.28} height={130} style={styles.cardGateArt} />
                <Text style={styles.cardTitleCream}>Gate</Text>
              </Pressable>

              <Pressable style={styles.cardSpaceBooking} onPress={() => setScreenMode("spaceList")}>
                <SpaceArtwork width={140.56} height={65} style={styles.cardSpaceArt} />
                <Text style={styles.cardTitleLight}>Space Booking</Text>
              </Pressable>

              <Pressable style={styles.cardVisitors} onPress={() => {}}>
                <VisitorsArtwork width={148} height={91.45} style={styles.cardVisitorsArt} />
                <Text style={styles.cardTitleCream}>Notices</Text>
              </Pressable>

              <Pressable style={styles.cardPost} onPress={() => {}}>
                <PostArtwork width={117.8} height={113.27} style={styles.cardPostArt} />
                <Text style={styles.cardTitleLight}>Post</Text>
              </Pressable>

              <Pressable style={styles.cardReading} onPress={() => {}}>
                <ReadingArtwork width={119} height={130.95} style={styles.cardReadingArt} />
                <Text style={styles.cardTitleCream}>Reading News</Text>
              </Pressable>

              <Pressable style={styles.cardXyz} onPress={() => {}}>
                <View style={styles.cardXyzTopBand} />
                <MarketArtwork width={160} height={90} />
                <Text style={styles.cardTitleXyz}>XYZ</Text>
              </Pressable>
            </View>
          ) : screenMode === "spaceList" ? (
            <View style={styles.flowScreen}>
              <FlowHeader title="Space Booking" onBack={() => setScreenMode("home")} />
              <View style={[styles.listCardWrap, isLight && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <View style={styles.spaceGrid}>
                  {spaces.map((space) => (
                    <Pressable
                      key={space.id}
                      onPress={() => {
                        setSelectedSpaceId(space.id);
                        setSelectedSpaceGalleryIndex(0);
                        setScreenMode("spaceDetail");
                      }}
                      style={styles.spaceTile}
                    >
                      <View style={[styles.spaceTileImageWrap, { backgroundColor: space.background }]}>
                        <Image source={space.imageSource} style={styles.spaceTileImage} resizeMode="cover" />
                      </View>
                      <Text style={styles.spaceTileText}>{space.title}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <Text style={[styles.helpCopy, { color: theme.textMuted }]}>
                Press the mic and mention all your booking details like event date, time, duration,
                repeat and occasion.
              </Text>
              <Pressable style={styles.activitiesQuickButton} onPress={() => setScreenMode("activities")}>
                <Text style={styles.activitiesQuickButtonText}>View Activities</Text>
              </Pressable>
            </View>
          ) : screenMode === "spaceDetail" ? (
            <ScrollView
              style={[styles.flowScreen, { backgroundColor: theme.screenBg }]}
              contentContainerStyle={styles.detailScrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <FlowHeader title="Select Space" onBack={() => setScreenMode("spaceList")} />

              <View style={[styles.detailHeroCard, isLight && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <View style={[styles.detailHeroImage, { backgroundColor: selectedSpace.background }]}>
                  <Image source={selectedSpaceGalleryImage} style={styles.detailHeroImageAsset} resizeMode="cover" />
                </View>
                <View style={styles.detailThumbRow}>
                  {selectedSpaceGallery.map((galleryImage, imageIndex) => (
                    <Pressable
                      key={`${selectedSpace.id}-gallery-${imageIndex}`}
                      onPress={() => setSelectedSpaceGalleryIndex(imageIndex)}
                      style={[
                        styles.detailThumb,
                        selectedSpaceGalleryIndex === imageIndex && styles.detailThumbSelected,
                        { backgroundColor: selectedSpace.background }
                      ]}
                    >
                      <Image source={galleryImage} style={styles.detailThumbImage} resizeMode="cover" />
                    </Pressable>
                  ))}
                </View>
                <Text style={[styles.detailSpaceTitle, { color: theme.textPrimary }]}>{selectedSpace.title}</Text>
              </View>

              <View style={[styles.detailPriceCard, isLight && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <Text style={[styles.detailSectionTitle, { color: theme.textPrimary }]}>Prezzo come per profilo utente</Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Residente:</Text>
                  <Text style={[styles.priceValue, { color: theme.textPrimary }]}>{selectedSpace.priceResident ?? "₹ 130 / Day"}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Membro:</Text>
                  <Text style={[styles.priceValue, { color: theme.textPrimary }]}>{selectedSpace.priceMember ?? "₹ 90 / Day"}</Text>
                </View>
                <Text style={[styles.detailMutedText, { color: theme.textMuted }]}>{selectedSpace.subtitle}</Text>
              </View>

              <View style={[styles.detailInfoCard, isLight && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <Text style={[styles.detailInfoTitle, { color: theme.textPrimary }]}>Multi Purpose Room</Text>
                <Text style={[styles.detailLocation, { color: theme.textMuted }]}>{selectedSpace.location}</Text>
                <Text style={[styles.detailLargePrice, { color: theme.textPrimary }]}>{selectedSpace.price ?? "₹ 400 / Day"}</Text>
                <Text style={[styles.detailDescription, { color: theme.textSecondary }]}>{selectedSpace.description}</Text>
              </View>
            </ScrollView>
          ) : screenMode === "bookingForm" ? (
            <ScrollView
              style={[styles.flowScreen, { backgroundColor: theme.screenBg }]}
              contentContainerStyle={styles.formScrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <FlowHeader title="Select Space" onBack={() => {
                setEditingBookingId(null);
                setScreenMode("spaceDetail");
              }} />

              <View style={[styles.bookingSelectedCard, isLight && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <View style={[styles.bookingSelectedImage, { backgroundColor: selectedSpace.background }]}>
                  <Image source={selectedSpaceGalleryImage} style={styles.bookingSelectedImageAsset} resizeMode="cover" />
                </View>
                <View style={styles.bookingSelectedRow}>
                  <Text style={[styles.bookingSelectedTitle, { color: theme.textPrimary }]}>{selectedSpace.title}</Text>
                  <Text style={[styles.bookingSelectedPrice, { color: theme.textPrimary }]}>{selectedSpace.price ?? "₹ 400 / Day"}</Text>
                </View>
                <Text style={[styles.bookingSelectedLocation, { color: theme.textMuted }]}>{selectedSpace.location}</Text>
              </View>

              <View style={[styles.bookingFormCard, isLight && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <FormPickerRow
                  label="Event type"
                  value={eventType}
                  onPress={() => setActiveSheet("eventType")}
                />
                <FormPickerRow
                  label="On"
                  value={eventDate}
                  onPress={openNativeDatePicker}
                />
                <FormPickerRow
                  label="At"
                  value={eventTime}
                  onPress={() => setActiveSheet("time")}
                />
                <FormPickerRow
                  label="Duration"
                  value={eventDuration}
                  onPress={() => setActiveSheet("duration")}
                />

                <View style={styles.repeatSection}>
                  <Text style={[styles.formFieldLabel, { color: theme.textSecondary }]}>Repeat</Text>
                  <View style={styles.repeatGrid}>
                    {REPEAT_OPTIONS.map((option) => (
                      <Pressable
                        key={option.id}
                        onPress={() => setRepeatMode(option.id)}
                        style={[
                          styles.repeatGridItem,
                          {
                            backgroundColor: repeatMode === option.id ? theme.primaryButtonBg : theme.elevatedBg,
                            borderColor: repeatMode === option.id ? theme.primaryButtonBg : theme.cardBorder
                          }
                        ]}
                      >
                        <Text
                          style={[
                            styles.repeatGridItemText,
                            { color: repeatMode === option.id ? theme.primaryButtonText : theme.textPrimary }
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <FormPickerRow
                  label="Visibility"
                  value={visibility}
                  onPress={() => setActiveSheet("visibility")}
                />

                <FormPickerRow
                  label="Message"
                  value={message.trim() ? "Message added" : "Add message"}
                  onPress={() => setActiveSheet("message")}
                />
              </View>
            </ScrollView>
          ) : screenMode === "activities" ? (
            <View style={[styles.activitiesScreen, { backgroundColor: theme.screenBg }]}>
              <View style={styles.flowHeader}>
                <Pressable onPress={() => setScreenMode("spaceList")} style={styles.flowBackButton}>
                  <Text style={styles.flowBackButtonText}>‹</Text>
                </Pressable>
                <Text style={styles.flowHeaderTitle}>Activities</Text>
              </View>

              <View style={styles.activitiesToolbar}>
                <View style={styles.activitiesSegmented}>
                  {activitiesUi.tabs.map((tab) => (
                    <Pressable
                      key={tab.id}
                      style={[styles.activitiesSegmentButton, activityScope === tab.id && styles.activitiesSegmentButtonActive]}
                      onPress={() => setActivityScope(tab.id)}
                    >
                      <Text style={[styles.activitiesSegmentText, activityScope === tab.id && styles.activitiesSegmentTextActive]}>
                        {tab.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable
                  style={styles.activitiesFilterButton}
                  onPress={() => setActiveSheet("statusFilter")}
                >
                  <FilterIcon width={20} height={20} color={theme.textSecondary} />
                </Pressable>
              </View>

              <View style={styles.activitiesDatesRow}>
                <ClockFastForwardIcon width={24} height={24} color={theme.textSecondary} />
                {ACTIVITY_DATES.map((dateItem) => (
                  <Pressable
                    key={dateItem}
                    onPress={() => setSelectedActivityDate(dateItem)}
                    style={[
                      styles.activityDateChip,
                      selectedActivityDate === dateItem && styles.activityDateChipActive
                    ]}
                  >
                    <Text
                      style={[
                        styles.activityDateText,
                        selectedActivityDate === dateItem && styles.activityDateTextActive
                      ]}
                    >
                      {dateItem}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={[styles.activitiesPanel, isLight && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                {isActivitiesLoading ? (
                  <View style={styles.activitiesLoaderWrap}>
                    <ActivityIndicator size="small" color="#A1C5F8" />
                    <Text style={[styles.activitiesLoaderText, { color: theme.textSecondary }]}>Loading activities...</Text>
                  </View>
                ) : filteredActivities.length === 0 ? (
                  <View style={styles.activitiesEmptyWrap}>
                    <Text style={[styles.activitiesEmptyTitle, { color: theme.textPrimary }]}>No activities found</Text>
                    <Text style={[styles.activitiesEmptyText, { color: theme.textMuted }]}>Book a space to create your first activity request.</Text>
                  </View>
                ) : (
                  <ScrollView
                    contentContainerStyle={styles.activitiesListContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                  >
                    {filteredActivities.map((activity) => (
                      <Pressable
                        key={activity.id}
                        style={[styles.activityCard, isLight && { backgroundColor: theme.elevatedBg, borderColor: theme.cardBorder }]}
                        onPress={() => openActivityDetails(activity.id)}
                      >
                        <View style={styles.activityIconCircle}>
                          <Text style={styles.activityIconText}>{activity.category.slice(0, 1)}</Text>
                        </View>
                        <View style={styles.activityBody}>
                          <View style={styles.activityTopRow}>
                            <Text style={[styles.activityTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                              {activity.title}
                            </Text>
                            <ActivityStatusBadge status={activity.status} />
                          </View>
                          <View style={styles.activityBottomRow}>
                            <Text style={[styles.activityCategory, { color: theme.textMuted }]}>{activity.category}</Text>
                            <View style={styles.activityTimeRow}>
                              <ClockIcon width={16} height={16} />
                              <Text style={[styles.activityTime, { color: theme.textPrimary }]}>{activity.time}</Text>
                            </View>
                          </View>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
          ) : screenMode === "activityDetail" ? (
            <View style={[styles.flowScreen, { backgroundColor: theme.screenBg }]}>
              <FlowHeader title="Activity Details" onBack={() => setScreenMode("activities")} />
              {selectedActivityBooking ? (
                <View style={[styles.activityDetailCard, isLight && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={styles.activityDetailHeroWrap}>
                    <Image
                      source={activityDetailSpace.imageSource}
                      style={styles.activityDetailHeroImage}
                      resizeMode="cover"
                    />
                    <Text style={[styles.activityDetailTitle, { color: theme.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
                      {selectedActivityBooking.eventType}
                    </Text>
                  </View>
                  <Text style={[styles.activityDetailMeta, { color: theme.textSecondary }]}>Space: {selectedActivityBooking.spaceType}</Text>
                  <Text style={[styles.activityDetailMeta, { color: theme.textSecondary }]}>Date: {selectedActivityBooking.bookingDate}</Text>
                  <Text style={[styles.activityDetailMeta, { color: theme.textSecondary }]}>
                    Time: {formatClockFrom24(selectedActivityBooking.startTime)} - {formatClockFrom24(selectedActivityBooking.endTime)}
                  </Text>
                  <Text style={[styles.activityDetailMeta, { color: theme.textSecondary }]}>Visibility: {selectedActivityBooking.visibility}</Text>
                  <Text style={[styles.activityDetailMeta, { color: theme.textSecondary }]}>Status: {selectedActivityBooking.status}</Text>
                  {selectedActivityBooking.status === "Rejected" && selectedActivityBooking.rejectedReason ? (
                    <View style={styles.activityRejectedReasonWrap}>
                      <Text style={styles.activityRejectedReasonTitle}>Rejected Reason</Text>
                      <Text style={styles.activityRejectedReasonText}>{selectedActivityBooking.rejectedReason}</Text>
                    </View>
                  ) : null}
                  {selectedActivityBooking.requesterUserId === DEFAULT_BOOKING_USER &&
                  toActivityStatus(selectedActivityBooking.status) === "waiting" ? (
                    <Pressable style={styles.activityDetailEditButton} onPress={() => startEditActivity(selectedActivityBooking.id)}>
                      <Text style={styles.activityDetailEditButtonText}>Edit Activity</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : (
                <View style={styles.activitiesEmptyWrap}>
                  <Text style={[styles.activitiesEmptyTitle, { color: theme.textPrimary }]}>Activity not found</Text>
                </View>
              )}
            </View>
          ) : screenMode === "profile" ? (
            <ProfileScreen onBack={() => setScreenMode("home")} />
          ) : (
            <View style={[styles.notificationScreen, { backgroundColor: theme.screenBg }]}>
              <View style={styles.notificationHeader}>
                <Text style={[styles.notificationTitle, { color: theme.textPrimary }]}>Notifications</Text>
                <Pressable onPress={() => setScreenMode("home")} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Done</Text>
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={styles.notificationList}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {isNotificationsLoading ? (
                  <View style={styles.activitiesLoaderWrap}>
                    <ActivityIndicator size="small" color="#A1C5F8" />
                    <Text style={[styles.activitiesLoaderText, { color: theme.textSecondary }]}>Loading notifications...</Text>
                  </View>
                ) : notifications.length === 0 ? (
                  <View style={styles.activitiesEmptyWrap}>
                    <Text style={[styles.activitiesEmptyTitle, { color: theme.textPrimary }]}>No notifications yet</Text>
                    <Text style={[styles.activitiesEmptyText, { color: theme.textMuted }]}>
                      You will see admin action updates here.
                    </Text>
                  </View>
                ) : (
                  notifications.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        if (item.read) {
                          return;
                        }
                        void markNotificationReadApi(item.id);
                        setNotifications((previous) =>
                          previous.map((record) => (record.id === item.id ? { ...record, read: true } : record))
                        );
                      }}
                      style={[
                        styles.notificationCard,
                        isLight && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
                        !item.read && styles.notificationCardUnread
                      ]}
                    >
                      <View style={[styles.notificationIconWrap, isLight && { backgroundColor: theme.elevatedBg }]}>
                        <BellIcon width={18} height={18} color={theme.textSecondary} />
                      </View>
                      <View style={styles.notificationCopy}>
                        <Text style={[styles.notificationCardTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                        <Text style={[styles.notificationCardBody, { color: theme.textMuted }]}>{item.body}</Text>
                        <Text style={[styles.notificationCardTime, { color: theme.textSecondary }]}>{item.time}</Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {screenMode === "spaceDetail" ? (
          <View style={styles.bottomCtaWrap}>
            <Pressable style={styles.primaryCta} onPress={() => setScreenMode("bookingForm")}>
              <Text style={styles.primaryCtaText}>Select & Continue</Text>
            </Pressable>
          </View>
        ) : screenMode === "bookingForm" ? (
          <View style={styles.bottomCtaWrap}>
            <Pressable style={styles.primaryCta} onPress={handleBookSpace} disabled={isBookingSubmitting}>
              {isBookingSubmitting ? <ActivityIndicator size="small" color="#101114" /> : null}
              <Text style={styles.primaryCtaText}>{editingBookingId ? "Update Booking" : "Book Space"}</Text>
            </Pressable>
          </View>
        ) : null}

        {screenMode === "home" || screenMode === "spaceList" || screenMode === "activities" ? (
          <View style={styles.footerWrap} pointerEvents="box-none">
            <View style={styles.footerBase}>
              <BlurView intensity={18} tint={isLight ? "light" : "dark"} style={styles.footerBlurUnderlay} />
              <FooterBaseSvg light={isLight} />
            </View>

            <Pressable
              onPress={() => setScreenMode("home")}
              style={[styles.footerIconButton, styles.footerLeftButton]}
            >
              <LockIcon width={28} height={28} color={isLight ? "#1E2C54" : "#FFFFFF"} />
            </Pressable>

            <Pressable style={styles.centerDock} onPress={activateVoiceConversation}>
              <MicBgSvg />
              <View style={styles.micButtonWrap}>
                <MicButtonAsset />
              </View>
            </Pressable>

            <Pressable
              onPress={() => setScreenMode("activities")}
              style={[styles.footerIconButton, styles.footerRightButton]}
            >
              <ClockFastForwardIcon width={28} height={28} color={isLight ? "#1E2C54" : "#FFFFFF"} />
            </Pressable>
          </View>
        ) : null}

        <ThemedBottomSheet
          visible={activeSheet !== null && activeSheet !== "message"}
          title={activeBottomSheetTitle}
          options={activeBottomSheetOptions}
          selectedId={activeBottomSheetSelectedId}
          onClose={() => setActiveSheet(null)}
          onSelect={(option) => {
            if (activeSheet === "statusFilter") {
              setActivityStatusFilter(option.id as ActivityStatusFilter);
            }
            if (activeSheet === "eventType") {
              setEventType(option.id);
            }
            if (activeSheet === "time") {
              setEventTime(option.id);
            }
            if (activeSheet === "duration") {
              setEventDuration(option.id);
            }
            if (activeSheet === "visibility") {
              setVisibility(option.id as "Public" | "Private");
            }
            setActiveSheet(null);
          }}
          theme={theme}
        />

        <ThemedInputBottomSheet
          visible={activeSheet === "message"}
          title="Activity Message"
          initialValue={message}
          placeholder="Add notes for residents and admins"
          onClose={() => setActiveSheet(null)}
          onSave={(value) => {
            setMessage(value);
            setActiveSheet(null);
          }}
          theme={theme}
        />

        {Platform.OS === "ios" ? (
          <Modal visible={isIosDatePickerVisible} transparent animationType="slide" onRequestClose={() => setIsIosDatePickerVisible(false)}>
            <Pressable style={styles.datePickerBackdrop} onPress={() => setIsIosDatePickerVisible(false)} />
            <View style={[styles.datePickerSheet, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={styles.datePickerHeader}>
                <Text style={[styles.datePickerTitle, { color: theme.textPrimary }]}>Select Date</Text>
                <Pressable onPress={() => setIsIosDatePickerVisible(false)}>
                  <Text style={[styles.datePickerDone, { color: theme.primaryButtonBg }]}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                mode="date"
                value={parseFormDateToDate(eventDate)}
                display="inline"
                onChange={(_event, selectedDate) => {
                  if (!selectedDate) {
                    return;
                  }
                  onNativeDateSelected(selectedDate);
                }}
              />
            </View>
          </Modal>
        ) : null}

        {isVoiceAssistantActive ? (
          <LinearGradient colors={["#242937", "#232536"]} style={styles.voiceAssistantPanel}>
            <View style={styles.voiceSheetGripWrap}>
              <View style={styles.voiceSheetGrip} />
            </View>
            <View style={styles.voiceAssistantHeader}>
              <Text style={styles.voiceAssistantTitle}>Planet Assistant</Text>
              <Pressable onPress={() => setIsVoiceAssistantActive(false)}>
                <Text style={styles.voiceAssistantClose}>Close</Text>
              </Pressable>
            </View>
            <View style={styles.voiceMetaRow}>
              <Text style={styles.voiceMetaText}>Voice: {selectedIndianVoiceName}</Text>
              <Pressable style={styles.voiceSwitchButton} onPress={cycleIndianVoice}>
                <Text style={styles.voiceSwitchButtonText}>Switch Voice</Text>
              </Pressable>
            </View>
            <Text style={styles.voiceAssistantReply}>{voiceReply}</Text>
            <View style={styles.voiceCommandRow}>
              <Pressable style={styles.voiceCommandChip} onPress={() => handleVoiceCommand("gate")}>
                <Text style={styles.voiceCommandText}>Gate</Text>
              </Pressable>
              <Pressable style={styles.voiceCommandChip} onPress={() => handleVoiceCommand("notices")}>
                <Text style={styles.voiceCommandText}>Notices</Text>
              </Pressable>
              <Pressable style={styles.voiceCommandChip} onPress={() => handleVoiceCommand("news")}>
                <Text style={styles.voiceCommandText}>News</Text>
              </Pressable>
              <Pressable style={styles.voiceCommandChip} onPress={() => handleVoiceCommand("payments")}>
                <Text style={styles.voiceCommandText}>Payments</Text>
              </Pressable>
              <Pressable style={styles.voiceCommandChip} onPress={() => handleVoiceCommand("booking")}>
                <Text style={styles.voiceCommandText}>Booking</Text>
              </Pressable>
            </View>
          </LinearGradient>
        ) : null}
      </View>
    </View>
  );
}

function ModuleTile({ module, onPress }: { module: ModuleCard; onPress?: () => void }) {
  const Artwork = module.renderArtwork;

  return (
    <Pressable onPress={onPress} style={[styles.moduleCard, { backgroundColor: module.background }]}>
      <View style={[styles.moduleArtworkShell, { backgroundColor: module.accent }]}>
        <View style={[styles.moduleArtworkShadow, { backgroundColor: module.darkAccent ?? module.accent }]} />
        <Artwork width={124} height={112} />
      </View>
      <View style={styles.moduleLabelWrap}>
        <Text style={styles.moduleTitle}>{module.title}</Text>
        <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
      </View>
    </Pressable>
  );
}

function FlowHeader({ title, onBack }: { title: string; onBack: () => void }) {
  const theme = profileThemes[useThemeStore((state) => state.mode)];
  return (
    <View style={styles.flowHeader}>
      <Pressable onPress={onBack} style={[styles.flowBackButton, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <Text style={[styles.flowBackButtonText, { color: theme.textSecondary }]}>‹</Text>
      </Pressable>
      <Text style={[styles.flowHeaderTitle, { color: theme.textPrimary }]}>{title}</Text>
    </View>
  );
}

function FormPickerRow({
  label,
  value,
  onPress
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  const theme = profileThemes[useThemeStore((state) => state.mode)];
  return (
    <View style={styles.formRow}>
      <Text style={[styles.formFieldLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Pressable onPress={onPress} style={[styles.formValueChip, { backgroundColor: theme.elevatedBg, borderColor: theme.cardBorder }]}>
        <Text style={[styles.formValueText, { color: theme.textPrimary }]}>{value}</Text>
      </Pressable>
    </View>
  );
}

function ActivityStatusBadge({ status }: { status: "approved" | "declined" | "waiting" }) {
  const label = activitiesUi.statusBadgeLabels[status];
  return (
    <View
      style={[
        styles.activityStatusBadge,
        status === "approved"
          ? styles.activityStatusApproved
          : status === "declined"
          ? styles.activityStatusDeclined
          : styles.activityStatusWaiting
      ]}
    >
      <Text
        style={[
          styles.activityStatusText,
          status === "approved"
            ? styles.activityStatusTextApproved
            : status === "declined"
            ? styles.activityStatusTextDeclined
            : styles.activityStatusTextWaiting
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function nextOption(current: string, options: string[]) {
  const currentIndex = options.indexOf(current);
  const nextIndex = currentIndex === -1 || currentIndex === options.length - 1 ? 0 : currentIndex + 1;
  return options[nextIndex];
}

function FooterBaseSvg({ light = false }: { light?: boolean }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 390 89" preserveAspectRatio="none">
      <Defs>
        <SvgLinearGradient id="footerGradient" x1="271.51" y1="0.617188" x2="271.51" y2="88.6172">
          <Stop offset="0" stopColor={light ? "#C6D6EE" : "#3A3A6A"} stopOpacity={light ? 0.6 : 0.26} />
          <Stop offset="1" stopColor={light ? "#B3C7E8" : "#25244C"} stopOpacity={light ? 0.65 : 0.26} />
        </SvgLinearGradient>
      </Defs>
      <Path
        d="M0 0.617188C0 0.617188 76.0769 16.5993 127 20.6172C153.339 22.6954 168.554 23.6172 195 23.6172C221.446 23.6172 235.661 22.6954 262 20.6172C312.923 16.5993 390 0.617188 390 0.617188V88.6172H0V0.617188Z"
        fill="url(#footerGradient)"
      />
      <Path
        d="M0.0546875 0.373047C0.0569897 0.37353 0.060824 0.374034 0.0654297 0.375C0.0746105 0.376926 0.0882719 0.379984 0.106445 0.383789C0.143079 0.39146 0.198029 0.402844 0.270508 0.417969C0.415894 0.448308 0.633267 0.49374 0.917969 0.552734C1.48728 0.670705 2.32886 0.844126 3.41797 1.06641C5.59715 1.51116 8.76812 2.15121 12.7314 2.93164C20.6581 4.4925 31.7571 6.61576 44.4473 8.86426C69.8302 13.3617 101.571 18.3602 127.02 20.3682C153.355 22.446 168.563 23.3672 195 23.3672C221.437 23.3672 235.645 22.4461 261.98 20.3682C287.43 18.3602 319.42 13.3617 345.053 8.86426C357.868 6.6157 369.093 4.49252 377.113 2.93164C381.123 2.15122 384.333 1.51117 386.539 1.06641C387.642 0.844027 388.496 0.670726 389.072 0.552734C389.36 0.493813 389.579 0.448294 389.727 0.417969C389.8 0.402799 389.856 0.391475 389.894 0.383789C389.912 0.379971 389.926 0.376924 389.936 0.375C389.94 0.374124 389.943 0.373516 389.945 0.373047C389.946 0.372835 389.948 0.373166 389.948 0.373047C389.949 0.375761 389.955 0.400242 390 0.617188L389.949 0.37207L390.25 0.30957V88.8672H-0.25V0.30957L0.0517578 0.37207L0 0.617188C0.0513978 0.372528 0.0521648 0.372927 0.0527344 0.373047H0.0546875Z"
        fill="none"
        stroke={light ? "rgba(63,109,184,0.45)" : "rgba(117,130,244,0.5)"}
        strokeWidth={0.5}
      />
    </Svg>
  );
}

function MicBgSvg() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 258 100" fill="none" preserveAspectRatio="none">
      <Defs>
        <SvgLinearGradient
          id="paint0_linear_7955_25182"
          x1="179.615"
          y1="100"
          x2="179.615"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#262C51" />
          <Stop offset="1" stopColor="#3E3F74" />
        </SvgLinearGradient>
      </Defs>
      <Path
        d="M108 0H150C182 0 191.501 24.1398 201.732 48.6985C212.325 74.1247 223 100 258 100H0C35 100 45.6753 74.1247 56.2677 48.6985C66.4988 24.1398 76 0 108 0Z"
        fill="url(#paint0_linear_7955_25182)"
      />
      <Path
        d="M108 0.25H150C165.923 0.25 176.229 6.24992 183.838 15.3008C191.462 24.37 196.382 36.5041 201.502 48.7949C206.794 61.4986 212.125 74.3646 220.524 84.0479C227.574 92.1753 236.781 98.0562 249.919 99.75H8.08105C21.2186 98.0562 30.4259 92.1753 37.4756 84.0479C45.8748 74.3646 51.2058 61.4986 56.498 48.7949C61.6183 36.5041 66.5378 24.37 74.1621 15.3008C81.771 6.24992 92.0771 0.25 108 0.25Z"
        stroke="#7582F4"
        strokeOpacity={0.5}
        strokeWidth={0.5}
      />
    </Svg>
  );
}

function ArrowDownIcon({ color = "#FFFFFF", ...props }: SvgProps & { color?: string }) {
  return (
    <Svg viewBox="0 0 16 16" fill="none" {...props}>
      <Path d="M4 6L8 10L12 6" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BellIcon({ color = "white", ...props }: SvgProps & { color?: string }) {
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M9.5 19C9.88471 20.1411 10.9733 21 12.25 21C13.5267 21 14.6153 20.1411 15 19M17 8.5C17 6.01472 14.9853 4 12.5 4C10.0147 4 8 6.01472 8 8.5C8 10.6888 7.21574 12.1546 6.34012 13.1174C5.6007 13.9306 5.23099 14.3372 5.22157 14.4507C5.21114 14.5763 5.23776 14.6241 5.33744 14.7012C5.42748 14.7708 6.03841 14.7708 7.26028 14.7708H17.7397C18.9616 14.7708 19.5725 14.7708 19.6626 14.7012C19.7622 14.6241 19.7889 14.5763 19.7784 14.4507C19.769 14.3372 19.3993 13.9306 18.6599 13.1174C17.7843 12.1546 17 10.6888 17 8.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LockIcon({ color = "white", ...props }: SvgProps & { color?: string }) {
  return (
    <Svg viewBox="0 0 32 32" fill="none" {...props}>
      <Path
        d="M9.46542 13.3333H9.33073V10.6667C9.33073 6.98477 12.3155 4 15.9974 4C19.6793 4 22.6641 6.98477 22.6641 10.6667V13.3333H22.5294M15.9974 18.6667V21.3333M25.3307 20C25.3307 25.1547 21.1521 29.3333 15.9974 29.3333C10.8427 29.3333 6.66406 25.1547 6.66406 20C6.66406 14.8453 10.8427 10.6667 15.9974 10.6667C21.1521 10.6667 25.3307 14.8453 25.3307 20Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ClockFastForwardIcon({ color = "white", ...props }: SvgProps & { color?: string }) {
  return (
    <Svg viewBox="0 0 32 32" fill="none" {...props}>
      <Path
        d="M28 16C28 22.6274 22.6274 28 16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4C19.8932 4 23.3533 5.85453 25.5452 8.72727M28 8V4M28 8H24M16 10V16L19.5 19.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FilterIcon({ color = "#FFFFFF", ...props }: SvgProps & { color?: string }) {
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M3 6.75H21M6 12H18M10 17.25H14"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ClockIcon(props: SvgProps) {
  return (
    <Svg viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M8 3V8L11 9.5M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8Z"
        stroke="#040415"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MicIcon(props: SvgProps) {
  return (
    <Svg viewBox="0 0 44 44" fill="none" {...props}>
      <Path
        d="M34.8307 18.3307V21.9974C34.8307 29.0851 29.085 34.8307 21.9974 34.8307M9.16406 18.3307V21.9974C9.16406 29.0851 14.9097 34.8307 21.9974 34.8307M21.9974 34.8307V40.3307M14.6641 40.3307H29.3307M21.9974 27.4974C18.9598 27.4974 16.4974 25.035 16.4974 21.9974V9.16406C16.4974 6.1265 18.9598 3.66406 21.9974 3.66406C25.035 3.66406 27.4974 6.1265 27.4974 9.16406V21.9974C27.4974 25.035 25.035 27.4974 21.9974 27.4974Z"
        stroke="#101114"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MicButtonAsset() {
  return (
    <>
      <View style={styles.micShadow} />
      <View style={styles.micCircleOuter}>
        <LinearGradient colors={["#F8F9FC", "#E5E8EF"]} style={styles.micCircleInner}>
          <MicIcon width={44} height={44} />
        </LinearGradient>
      </View>
    </>
  );
}

function GateArtwork(props: SvgProps) {
  return (
    <Svg viewBox="0 0 120 110" fill="none" {...props}>
      <Rect x="10" y="20" width="100" height="70" rx="14" fill="#F2C4BA" />
      <Path d="M27 90V36L60 18L93 36V90" stroke="#7D3E39" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M48 56H72" stroke="#7D3E39" strokeWidth={5} strokeLinecap="round" />
      <Rect x="53" y="58" width="14" height="32" rx="7" fill="#7D3E39" />
    </Svg>
  );
}

function SpaceArtwork(props: SvgProps) {
  return (
    <Svg viewBox="0 0 120 110" fill="none" {...props}>
      <Rect x="12" y="36" width="96" height="44" rx="18" fill="#ADB5EB" />
      <Rect x="20" y="28" width="80" height="12" rx="6" fill="#D9DEFA" />
      <Circle cx="36" cy="58" r="10" fill="#5A649E" />
      <Circle cx="60" cy="58" r="10" fill="#5A649E" />
      <Circle cx="84" cy="58" r="10" fill="#5A649E" />
    </Svg>
  );
}

function VisitorsArtwork(props: SvgProps) {
  return (
    <Svg viewBox="0 0 120 110" fill="none" {...props}>
      <Circle cx="43" cy="46" r="18" fill="#B1C4DE" />
      <Circle cx="78" cy="40" r="12" fill="#D5E2F2" />
      <Path d="M24 88C24 72.536 36.536 60 52 60H56C71.464 60 84 72.536 84 88" fill="#3F5369" />
      <Path d="M70 88C70 77.5066 78.5066 69 89 69C99.4934 69 108 77.5066 108 88" fill="#667D9B" />
    </Svg>
  );
}

function PostArtwork(props: SvgProps) {
  return (
    <Svg viewBox="0 0 120 110" fill="none" {...props}>
      <Rect x="16" y="18" width="88" height="74" rx="16" fill="#EBE9DB" />
      <Rect x="28" y="34" width="64" height="8" rx="4" fill="#9E9E92" />
      <Rect x="28" y="50" width="52" height="8" rx="4" fill="#B4B4A7" />
      <Rect x="28" y="66" width="58" height="8" rx="4" fill="#C6C5BC" />
    </Svg>
  );
}

function ReadingArtwork(props: SvgProps) {
  return (
    <Svg viewBox="0 0 120 110" fill="none" {...props}>
      <Rect x="18" y="10" width="84" height="90" rx="22" fill="#E7A18D" />
      <Rect x="34" y="28" width="52" height="54" rx="18" fill="#F3C0B2" />
      <Rect x="48" y="42" width="24" height="28" rx="8" fill="#CF7569" />
    </Svg>
  );
}

function MarketArtwork(props: SvgProps) {
  return (
    <Svg viewBox="0 0 120 110" fill="none" {...props}>
      <Rect x="14" y="24" width="92" height="62" rx="18" fill="#606A85" />
      <Path d="M22 48H98" stroke="#2B3040" strokeWidth={6} strokeLinecap="round" />
      <Circle cx="46" cy="48" r="16" fill="#95A4E0" />
      <Rect x="72" y="32" width="24" height="18" rx="6" fill="#C6D0F7" />
      <Rect x="28" y="64" width="52" height="8" rx="4" fill="#898E9E" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#05060A"
  },
  screen: {
    flex: 1,
    backgroundColor: "#05060A"
  },
  pageInset: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 20
  },
  pageInsetHome: {
    flex: 1
  },
  homeFrame: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
    alignSelf: "center",
    backgroundColor: "#000000"
  },
  figmaHeader: {
    position: "absolute",
    left: 16,
    top: 52,
    width: 358,
    height: 57,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  figmaHeaderLeft: {
    width: 196,
    height: 57
  },
  figmaGreeting: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 17
  },
  figmaName: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 21,
    marginTop: 0
  },
  figmaAddressRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  figmaAddress: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 10,
    fontWeight: "400"
  },
  figmaArrowDown: {
    width: 16,
    height: 16
  },
  figmaHeaderRight: {
    width: 146,
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  figmaWeatherChip: {
    width: 69,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#131D26",
    backgroundColor: "#000000",
    paddingHorizontal: 4,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  figmaWeatherIcon: {
    width: 24,
    height: 24
  },
  figmaWeatherText: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 10,
    fontWeight: "500"
  },
  figmaBellWrap: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center"
  },
  figmaBellIcon: {
    width: 24,
    height: 24
  },
  figmaBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 11,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D04053",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3
  },
  figmaBadgeText: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 8,
    fontWeight: "700",
    lineHeight: 6
  },
  figmaAvatar: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: "#F6EBA7",
    alignItems: "center",
    justifyContent: "center"
  },
  figmaAvatarInitial: {
    color: "#0D1122",
    fontFamily: "Noto Sans",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 22
  },
  cardGate: {
    position: "absolute",
    left: 16,
    top: 133,
    width: 170,
    height: 210,
    borderRadius: 10,
    backgroundColor: "#D9A69F"
  },
  cardGateArt: {
    position: "absolute",
    left: 5,
    top: 18,
    width: 129.28,
    height: 130
  },
  cardSpaceBooking: {
    position: "absolute",
    left: 204,
    top: 134,
    width: 170,
    height: 167,
    borderRadius: 10,
    backgroundColor: "#6C739C"
  },
  cardSpaceArt: {
    position: "absolute",
    left: 14,
    top: 39,
    width: 140.56,
    height: 65
  },
  cardVisitors: {
    position: "absolute",
    left: 16,
    top: 364,
    width: 169.52,
    height: 167,
    borderRadius: 10,
    backgroundColor: "#F0DAD5"
  },
  cardVisitorsArt: {
    position: "absolute",
    left: 13,
    top: 18,
    width: 148,
    height: 91.45
  },
  cardPost: {
    position: "absolute",
    left: 204,
    top: 321,
    width: 170,
    height: 210,
    borderRadius: 10,
    backgroundColor: "#BABBB1"
  },
  cardPostArt: {
    position: "absolute",
    left: 40,
    top: 23,
    width: 117.8,
    height: 113.27
  },
  cardReading: {
    position: "absolute",
    left: 16,
    top: 551,
    width: 170,
    height: 210,
    borderRadius: 10,
    backgroundColor: "#C56B62"
  },
  cardReadingArt: {
    position: "absolute",
    left: 30,
    top: 13,
    width: 119,
    height: 130.95
  },
  cardXyz: {
    position: "absolute",
    left: 204,
    top: 551,
    width: 170,
    height: 167,
    borderRadius: 10,
    backgroundColor: "#3F414E",
    overflow: "hidden"
  },
  cardXyzTopBand: {
    position: "absolute",
    top: 0,
    width: 170,
    height: 76,
    backgroundColor: "#4E5567"
  },
  cardTitleCream: {
    position: "absolute",
    left: 14,
    bottom: 11,
    color: "#FFECCC",
    fontFamily: "Noto Sans",
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 19.5
  },
  cardTitleLight: {
    position: "absolute",
    left: 15,
    bottom: 14,
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 24
  },
  cardTitleXyz: {
    position: "absolute",
    left: 16,
    bottom: 20,
    color: "#EBEAEC",
    fontFamily: "Noto Sans",
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 19
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 8,
    marginBottom: 18
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: 16
  },
  greetingLead: {
    color: "#D8D9E4",
    fontFamily: "Noto Sans",
    fontSize: 15,
    fontWeight: "500"
  },
  greetingName: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2
  },
  addressText: {
    color: "#B7BBCB",
    fontFamily: "Noto Sans",
    fontSize: 14,
    marginTop: 8
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  weatherChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#131D26",
    borderRadius: 8,
    width: 69,
    height: 32,
    paddingHorizontal: 4,
    paddingVertical: 4
  },
  weatherIcon: {
    width: 24,
    height: 24,
    borderRadius: 12
  },
  weatherEmoji: {
    fontSize: 18,
    lineHeight: 24
  },
  weatherText: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 10,
    fontWeight: "500"
  },
  weatherHint: {
    color: "#9EA6C8",
    fontFamily: "Noto Sans",
    fontSize: 10,
    marginTop: 2
  },
  bellButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center"
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -3,
    minWidth: 11,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D04053",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2
  },
  badgeText: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 8,
    fontWeight: "700"
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 4
  },
  scrollContent: {
    paddingBottom: 150
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18
  },
  moduleCard: {
    width: "47.5%",
    minHeight: 220,
    borderRadius: 26,
    padding: 14,
    justifyContent: "space-between"
  },
  moduleArtworkShell: {
    height: 126,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  moduleImageAsset: {
    width: "100%",
    height: "100%"
  },
  moduleArtworkShadow: {
    position: "absolute",
    width: 110,
    height: 94,
    borderRadius: 28,
    opacity: 0.24
  },
  moduleLabelWrap: {
    backgroundColor: "rgba(11, 12, 18, 0.28)",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  moduleTitle: {
    color: "#FFF7E8",
    fontFamily: "Noto Sans",
    fontSize: 16,
    fontWeight: "700"
  },
  moduleSubtitle: {
    color: "rgba(255,255,255,0.84)",
    fontFamily: "Noto Sans",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4
  },
  notificationScreen: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 140
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18
  },
  notificationTitle: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 28,
    fontWeight: "800"
  },
  closeButton: {
    backgroundColor: "#171C2B",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  closeButtonText: {
    color: "#D8DEFF",
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: "700"
  },
  notificationList: {
    paddingBottom: 8,
    gap: 14
  },
  notificationCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "#151927",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#22283B"
  },
  notificationIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#1D2334",
    alignItems: "center",
    justifyContent: "center"
  },
  notificationCopy: {
    flex: 1
  },
  notificationCardTitle: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 15,
    fontWeight: "700"
  },
  notificationCardBody: {
    color: "#B9C0D4",
    fontFamily: "Noto Sans",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6
  },
  notificationCardTime: {
    color: "#8D96B1",
    fontFamily: "Noto Sans",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8
  },
  flowScreen: {
    flex: 1
  },
  flowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingTop: 8,
    marginBottom: 20
  },
  flowBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#2C3144",
    backgroundColor: "#121620",
    alignItems: "center",
    justifyContent: "center"
  },
  flowBackButtonText: {
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 26,
    marginTop: -1
  },
  flowHeaderTitle: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 18,
    fontWeight: "700"
  },
  listCardWrap: {
    backgroundColor: "#1B202F",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#353B43",
    padding: 16
  },
  spaceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18
  },
  spaceTile: {
    width: "47.5%"
  },
  spaceTileImageWrap: {
    height: 112,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  spaceTileImage: {
    width: "100%",
    height: "100%"
  },
  spaceTileText: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 10
  },
  helpCopy: {
    color: "#CAD0E6",
    fontFamily: "Noto Sans",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 22,
    marginHorizontal: 10
  },
  activitiesQuickButton: {
    marginTop: 16,
    alignSelf: "center",
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#353B43",
    backgroundColor: "#242937",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  activitiesQuickButtonText: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20
  },
  activitiesScreen: {
    flex: 1,
    paddingBottom: 106
  },
  activitiesToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12
  },
  activitiesSegmented: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#353B43",
    backgroundColor: "#232736",
    flexDirection: "row",
    padding: 0,
    minWidth: 0,
    marginRight: 4
  },
  activitiesSegmentButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 8
  },
  activitiesSegmentButtonActive: {
    backgroundColor: "rgba(60, 180, 229, 0.55)"
  },
  activitiesSegmentText: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20
  },
  activitiesSegmentTextActive: {
    color: "#FFFFFF"
  },
  activitiesFilterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#353B43",
    backgroundColor: "#242937",
    alignItems: "center",
    justifyContent: "center"
  },
  activitiesDatesRow: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  activityDateChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#C9DEFF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  activityDateChipActive: {
    width: 72,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 36,
    borderBottomRightRadius: 36,
    borderColor: "#A1C5F8",
    backgroundColor: "#A1C5F8"
  },
  activityDateText: {
    color: "#344054",
    fontFamily: "Noto Sans",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18
  },
  activityDateTextActive: {
    color: "#040415",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  },
  activitiesPanel: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#353B43",
    backgroundColor: "#232536",
    padding: 16
  },
  activitiesLoaderWrap: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  activitiesLoaderText: {
    color: "#C6CCE1",
    fontFamily: "Noto Sans",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18
  },
  activitiesEmptyWrap: {
    paddingTop: 24,
    alignItems: "center"
  },
  activitiesEmptyTitle: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22
  },
  activitiesEmptyText: {
    color: "#B8C0D7",
    fontFamily: "Noto Sans",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center"
  },
  activitiesListContent: {
    gap: 10,
    paddingBottom: 8
  },
  activityCard: {
    minHeight: 74,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#353B43",
    backgroundColor: "#242937",
    padding: 16,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start"
  },
  activityIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center"
  },
  activityIconText: {
    color: "#1E2E56",
    fontFamily: "Noto Sans",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 22
  },
  activityBody: {
    flex: 1,
    gap: 8
  },
  activityTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12
  },
  notificationCardUnread: {
    borderColor: "#55BEE9"
  },
  activityTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  },
  activityBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  activityCategory: {
    color: "#7F7F7F",
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 14
  },
  activityTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  activityTime: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 14
  },
  activityStatusBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  activityStatusApproved: {
    borderColor: "#ABEFC6",
    backgroundColor: "#ECFDF3"
  },
  activityStatusDeclined: {
    borderColor: "#FECDCA",
    backgroundColor: "#FEF3F2"
  },
  activityStatusWaiting: {
    borderColor: "#FEDF89",
    backgroundColor: "#FEF0C7"
  },
  activityStatusText: {
    fontFamily: "Noto Sans",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "center"
  },
  activityStatusTextApproved: {
    color: "#067647"
  },
  activityStatusTextDeclined: {
    color: "#B42318"
  },
  activityStatusTextWaiting: {
    color: "#DC6803"
  },
  activityDetailCard: {
    marginTop: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#353B43",
    backgroundColor: "#242937",
    padding: 18,
    gap: 10
  },
  activityDetailTitle: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24
  },
  activityDetailMeta: {
    color: "#C6D0E6",
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20
  },
  activityRejectedReasonWrap: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECDCA",
    backgroundColor: "#2E1F25",
    padding: 12,
    gap: 4
  },
  activityRejectedReasonTitle: {
    color: "#FECACA",
    fontFamily: "Noto Sans",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  },
  activityRejectedReasonText: {
    color: "#FEE2E2",
    fontFamily: "Noto Sans",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18
  },
  activityDetailEditButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    borderRadius: 12,
    backgroundColor: "#7582F4",
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  activityDetailEditButtonText: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18
  },
  profileScreen: {
    flex: 1,
    paddingBottom: 30
  },
  profileScrollContent: {
    paddingBottom: 120,
    gap: 12
  },
  profileHeaderCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#212529",
    backgroundColor: "#05070B",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  profileAvatarLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DFE8F7",
    alignItems: "center",
    justifyContent: "center"
  },
  profileAvatarLargeInitial: {
    color: "#24355E",
    fontFamily: "Noto Sans",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 24
  },
  profileHeaderTextWrap: {
    flex: 1,
    gap: 2
  },
  profileName: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28
  },
  profileSubtitle: {
    color: "#899CBE",
    fontFamily: "Noto Sans",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18
  },
  profileQuickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  profileQuickCard: {
    width: "48.8%",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#372F1D",
    backgroundColor: "#131A27",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8
  },
  profileQuickIcon: {
    color: "#899CBE",
    fontFamily: "Noto Sans",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 22
  },
  profileQuickText: {
    color: "#899CBE",
    fontFamily: "Noto Sans",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16
  },
  profilePrivacyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#212529",
    backgroundColor: "#05070B",
    paddingHorizontal: 16,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  profilePrivacyText: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18
  },
  profileSectionTitle: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 4
  },
  profileMenuList: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#212529",
    backgroundColor: "#05070B",
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  profileMenuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 10
  },
  profileMenuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#212529"
  },
  profileMenuText: {
    color: "#899CBE",
    fontFamily: "Noto Sans",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18
  },
  profileArrow: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20
  },
  detailScrollContent: {
    paddingBottom: 124
  },
  detailHeroCard: {
    backgroundColor: "#151A24",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#232A39"
  },
  detailHeroImage: {
    height: 124,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  detailHeroImageAsset: {
    width: "100%",
    height: "100%"
  },
  detailThumbRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12
  },
  detailThumb: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
    overflow: "hidden"
  },
  detailThumbImage: {
    width: "100%",
    height: "100%"
  },
  detailThumbSelected: {
    borderColor: "#AEB7FF"
  },
  detailSpaceTitle: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16
  },
  detailPriceCard: {
    backgroundColor: "#151A24",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#232A39",
    marginTop: 16
  },
  detailSectionTitle: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  priceLabel: {
    color: "#B8C0D7",
    fontFamily: "Noto Sans",
    fontSize: 15,
    fontWeight: "500"
  },
  priceValue: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 15,
    fontWeight: "700"
  },
  detailMutedText: {
    color: "#98A3BD",
    fontFamily: "Noto Sans",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6
  },
  detailInfoCard: {
    backgroundColor: "#151A24",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#232A39",
    marginTop: 16
  },
  detailInfoTitle: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 18,
    fontWeight: "700"
  },
  detailLocation: {
    color: "#A4AEC6",
    fontFamily: "Noto Sans",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8
  },
  detailLargePrice: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 16
  },
  detailDescription: {
    color: "#C2C9DB",
    fontFamily: "Noto Sans",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12
  },
  formScrollContent: {
    paddingBottom: 140
  },
  bookingSelectedCard: {
    backgroundColor: "#151A24",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#232A39"
  },
  bookingSelectedImage: {
    height: 124,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  bookingSelectedImageAsset: {
    width: "100%",
    height: "100%"
  },
  bookingSelectedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 12
  },
  bookingSelectedTitle: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 18,
    fontWeight: "700",
    flex: 1
  },
  bookingSelectedPrice: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 18,
    fontWeight: "700"
  },
  bookingSelectedLocation: {
    color: "#A4AEC6",
    fontFamily: "Noto Sans",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8
  },
  bookingFormCard: {
    backgroundColor: "#151A24",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#232A39",
    marginTop: 16
  },
  formRow: {
    marginBottom: 16
  },
  formFieldLabel: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8
  },
  formValueChip: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A3043",
    backgroundColor: "#0F1320",
    paddingHorizontal: 14,
    justifyContent: "center"
  },
  formValueText: {
    color: "#C8D0E4",
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: "500"
  },
  repeatSection: {
    marginBottom: 16
  },
  repeatOptions: {
    gap: 10
  },
  repeatOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#6F7AA0",
    alignItems: "center",
    justifyContent: "center"
  },
  radioOuterActive: {
    borderColor: "#AEB7FF"
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#AEB7FF"
  },
  repeatOptionText: {
    color: "#D3DAEE",
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: "500"
  },
  messageInput: {
    minHeight: 104,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A3043",
    backgroundColor: "#0F1320",
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    textAlignVertical: "top",
    fontSize: 14
  },
  userInputWrap: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A3043",
    backgroundColor: "#0F1320",
    justifyContent: "center",
    marginBottom: 10
  },
  userInput: {
    minHeight: 48,
    paddingHorizontal: 14,
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: "500"
  },
  userSuggestionList: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A3043",
    backgroundColor: "#151A24",
    padding: 8,
    gap: 6,
    marginBottom: 14
  },
  userSuggestionItem: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  userSuggestionText: {
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: "600"
  },
  datePickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(5, 7, 14, 0.6)"
  },
  datePickerSheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22
  },
  datePickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6
  },
  datePickerTitle: {
    fontFamily: "Noto Sans",
    fontSize: 20,
    fontWeight: "800"
  },
  datePickerDone: {
    fontFamily: "Noto Sans",
    fontSize: 16,
    fontWeight: "700"
  },
  bottomCtaWrap: {
    position: "absolute",
    left: 4,
    right: 4,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: "#090B11"
  },
  primaryCta: {
    height: 56,
    borderRadius: 20,
    backgroundColor: "#CCD6F7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  primaryCtaText: {
    color: "#171C2C",
    fontFamily: "Noto Sans",
    fontSize: 16,
    fontWeight: "800"
  },
  footerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    justifyContent: "flex-end",
    overflow: "visible",
    zIndex: 1200,
    elevation: 1200
  },
  footerBase: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 88,
    overflow: "visible",
    zIndex: 1201,
    elevation: 1201
  },
  footerBackImage: {
    width: "100%",
    height: "100%"
  },
  footerBlurUnderlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 89,
    opacity: 0.9
  },
  footerIconButton: {
    position: "absolute",
    bottom: 24,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1203,
    elevation: 1203
  },
  footerIconImage: {
    width: 32,
    height: 32
  },
  footerLeftButton: {
    left: 32
  },
  footerRightButton: {
    right: 32
  },
  centerDock: {
    position: "absolute",
    left: 66,
    right: 66,
    bottom: 0,
    height: 100,
    alignItems: "center",
    justifyContent: "flex-start",
    zIndex: 1202,
    elevation: 1202
  },
  footerFrontImage: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 258,
    height: 100
  },
  micButtonWrap: {
    position: "absolute",
    top: 12,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center"
  },
  micOuterImage: {
    position: "absolute",
    width: 64,
    height: 64
  },
  micInnerImage: {
    position: "absolute",
    width: 58,
    height: 58
  },
  micBlurImage: {
    position: "absolute",
    width: 58,
    height: 58
  },
  micIconImage: {
    position: "absolute",
    width: 44,
    height: 44
  },
  micShadow: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(117,130,244,0.30)",
    shadowColor: "#7582F4",
    shadowOpacity: 0.7,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12
  },
  micCircleOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D6DAE4",
    borderWidth: 0.4,
    borderColor: "rgba(145,153,170,0.6)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0A0C13",
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 9
  },
  micCircleInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.75)"
  },
  voiceAssistantPanel: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 108,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#3C3C3C",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 10
  },
  voiceSheetGripWrap: {
    width: "100%",
    height: 8,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  voiceSheetGrip: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#2F3445"
  },
  voiceAssistantHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  voiceAssistantTitle: {
    color: "#E8EDFF",
    fontFamily: "Noto Sans",
    fontSize: 15,
    fontWeight: "700"
  },
  voiceAssistantClose: {
    color: "#A9B4D4",
    fontFamily: "Noto Sans",
    fontSize: 13,
    fontWeight: "600"
  },
  voiceMetaRow: {
    marginTop: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10
  },
  voiceMetaText: {
    flex: 1,
    color: "#9FAED7",
    fontFamily: "Noto Sans",
    fontSize: 12,
    fontWeight: "600"
  },
  voiceSwitchButton: {
    height: 28,
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#3E4A77",
    backgroundColor: "#1D2847",
    alignItems: "center",
    justifyContent: "center"
  },
  voiceSwitchButtonText: {
    color: "#E6EDFF",
    fontFamily: "Noto Sans",
    fontSize: 11,
    fontWeight: "700"
  },
  voiceAssistantReply: {
    marginTop: 2,
    color: "#D2DBF5",
    fontFamily: "Noto Sans",
    fontSize: 13,
    lineHeight: 20
  },
  voiceCommandRow: {
    marginTop: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  voiceCommandChip: {
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#39436A",
    backgroundColor: "#1A2342",
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  voiceCommandText: {
    color: "#E6ECFF",
    fontFamily: "Noto Sans",
    fontSize: 13,
    fontWeight: "600"
  }
});
