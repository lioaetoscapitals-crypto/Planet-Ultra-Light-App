import "./styles.css";
import { initAssistant } from "./voiceAssistant.js";
import GlobalTokens from "../Themes/Global.json";
import RadiusTokens from "../Themes/Radius.json";
import SpacingTokens from "../Themes/Spacing.json";
import TypographyTokens from "../Themes/Typography.json";
import ButtonTokens from "../Themes/Components.Button.json";
import SemanticLightTokens from "../Themes/Semantic.Light.json";

const assets = {
  weather: "https://www.figma.com/api/mcp/asset/42d98640-e691-4668-859d-549dfa45613f",
  avatar: "https://www.figma.com/api/mcp/asset/05be5aa2-e537-47a3-bfc2-e3dcf5e766aa",
  gate: "https://www.figma.com/api/mcp/asset/413d46df-781b-4729-931c-971730e43342",
  booking: "https://www.figma.com/api/mcp/asset/21359bba-779b-4e68-b4c6-bd0850cc3e59",
  bookingCowork: "https://www.figma.com/api/mcp/asset/d29034cf-2aa1-4538-8456-606bf8ab6e39",
  bookingHall: "https://www.figma.com/api/mcp/asset/d6be8379-c5fb-44cc-b187-1a2f1f4b3061",
  bookingPool: "https://www.figma.com/api/mcp/asset/81418822-6950-42cc-b337-831c17ed3df6",
  bookingGym: "https://www.figma.com/api/mcp/asset/72046552-74d1-4d3f-807d-7eba0f5b0bf1",
  bookingInfinityPool: "https://www.figma.com/api/mcp/asset/19fec52a-59a6-4747-bc84-ce85d3a63ef1",
  bookingCourt: "https://www.figma.com/api/mcp/asset/f1c79a63-bb70-4563-8e49-df6dc22bfe6b",
  bookingReceipt: "https://www.figma.com/api/mcp/asset/6073046c-2b5e-4d72-9826-e04d7f2f9436",
  bookingDetailHero: "https://www.figma.com/api/mcp/asset/6928a5c6-28af-44df-8b5c-78465bdbfe4e",
  bookingDetailThumb1: "https://www.figma.com/api/mcp/asset/5272a78e-96fb-4aaa-8ffa-dcb3ba509a32",
  bookingDetailThumb2: "https://www.figma.com/api/mcp/asset/9ff82e33-a2cf-4643-ae6b-c7cad855f1b4",
  bookingDetailThumb3: "https://www.figma.com/api/mcp/asset/b89af8bd-117c-49f1-80c4-b6eaeaa618e5",
  visitors: "https://www.figma.com/api/mcp/asset/751ad275-9736-4b57-97fb-14f68c342468",
  market: "https://www.figma.com/api/mcp/asset/68e2907b-65ec-4bae-94b1-32fcc0c99e16",
  readingNews: "https://www.figma.com/api/mcp/asset/6949ce40-d20e-4365-a0cd-2ac8a0ba75fd",
  post: "https://www.figma.com/api/mcp/asset/d1cd7d6f-c44b-4e3f-b2ff-ca1e3d97a452",
  lock: "https://www.figma.com/api/mcp/asset/09cea21a-1bf3-43a1-9104-1d15c549c129",
  users: "https://www.figma.com/api/mcp/asset/e74dd70c-d45a-4bec-9c13-430ee527f869",
  mic: "https://www.figma.com/api/mcp/asset/1efd7837-5110-4f27-9d81-2530c17f1eca",
  dockBack: "https://www.figma.com/api/mcp/asset/6fc9819f-b95b-4c6b-8254-e161eb083cb7",
  dockFront: "https://www.figma.com/api/mcp/asset/383493b5-5a1e-48bf-aa83-079f69d3d8bb",
  micOuter: "https://www.figma.com/api/mcp/asset/b31f89e2-cbb7-438c-835f-b51f9b1be0c1",
  micInner: "https://www.figma.com/api/mcp/asset/570c7f83-c2fa-4b26-bf7d-ddad89df302d",
  micBlur: "https://www.figma.com/api/mcp/asset/0328d29f-e787-4c66-ba90-9238052719e7",
  listeningGlyph: "https://www.figma.com/api/mcp/asset/8ee14a01-7381-471a-b5c6-de97abe8858d",
  chevronLeft: "https://www.figma.com/api/mcp/asset/05da7f5d-c2a7-4c3d-b3dd-80f1f45a6c06",
  bookingCoins: "https://www.figma.com/api/mcp/asset/1cdfcebd-b7c6-47a5-bee7-cc9bbcd235ef",
  bookingLocation: "https://www.figma.com/api/mcp/asset/51ce36ed-71e5-41a8-b82d-40726bc5d67c",
  bookingEventType: "https://www.figma.com/api/mcp/asset/834d9816-14c6-4adc-a90f-983ac24be5c3",
  bookingCalendar: "https://www.figma.com/api/mcp/asset/c67c8b68-fe42-44c5-b346-4f762e672cad",
  bookingClock: "https://www.figma.com/api/mcp/asset/3767d210-e97e-4c5b-b66a-3f99cde10179",
  bookingUser: "https://www.figma.com/api/mcp/asset/4e2f0ff0-22f4-4310-a2b0-a2c58e8f724e",
  bookingChevronDown: "https://www.figma.com/api/mcp/asset/987813a0-e568-4659-b590-2ba8626e7894",
  bookingMessageMic: "https://www.figma.com/api/mcp/asset/3c9b1a81-c8d3-41a3-a4c7-f19cb4f0266c",
  bookingStar: "https://www.figma.com/api/mcp/asset/494769a0-aee5-4aed-8726-15d79ecf3108",
  bookingCtaMic: "https://www.figma.com/api/mcp/asset/0c2ebde8-43ec-4e08-a483-478257595548"
};

const tokenSets = {
  Global: GlobalTokens,
  Radius: RadiusTokens,
  Spacing: SpacingTokens,
  Typography: TypographyTokens,
  Components: {
    Button: ButtonTokens
  },
  Semantic: {
    Light: SemanticLightTokens
  }
};

const DEFAULT_ASSISTANT_MESSAGE = "Tap the mic and say something like “open gate” or “show market”.";
const NO_MATCH_MESSAGE = "I heard you, but I couldn’t match that to a homepage module yet. Try “open gate”, “show market”, or “book space”.";
const BOOKING_DATE_OPTIONS = ["Fri 23 Sep", "Sun 25 Sep", "Mon 26 Sep", "Tue 27 Sep", "Wed 28 Sep", "Thu 29 Sep"];
const BOOKING_HOUR_OPTIONS = ["05", "06", "07", "08", "09", "10", "11", "12"];
const BOOKING_MINUTE_OPTIONS = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "41", "45", "50", "55"];

function getPath(obj, path) {
  return path.split(".").reduce((value, key) => (value ? value[key] : undefined), obj);
}

function resolveTokenValue(value) {
  if (typeof value !== "string") return value;
  const match = value.match(/^\{(.+)\}$/);
  if (!match) return value;
  const ref = getPath(tokenSets, match[1]);
  if (!ref) return value;
  return resolveTokenValue(ref.$value ?? ref);
}

function cssVar(name, ref) {
  document.documentElement.style.setProperty(name, resolveTokenValue(ref));
}

cssVar("--token-canvas", SemanticLightTokens.semantic.background.canvas.$value);
cssVar("--token-text-primary", SemanticLightTokens.semantic.text.primary.$value);
cssVar("--token-text-secondary", SemanticLightTokens.semantic.text.secondary.$value);
cssVar("--token-border-default", SemanticLightTokens.semantic.border.default.$value);
cssVar("--token-font-sans", TypographyTokens.font.family.sans.$value);
cssVar("--token-font-display", TypographyTokens.font.family.display.$value);
cssVar("--token-font-size-xs", TypographyTokens.font.size.xs.$value);
cssVar("--token-font-size-sm", TypographyTokens.font.size.sm.$value);
cssVar("--token-font-size-base", TypographyTokens.font.size.base.$value);
cssVar("--token-font-size-lg", TypographyTokens.font.size.lg.$value);
cssVar("--token-card-radius", RadiusTokens.lg.$value);
cssVar("--token-card-radius-large", RadiusTokens.xl.$value);
cssVar("--token-pill-radius", RadiusTokens.full.$value);
cssVar("--token-space-4", SpacingTokens.space["4"].$value);
cssVar("--token-space-5", SpacingTokens.space["5"].$value);
cssVar("--token-space-6", SpacingTokens.space["6"].$value);
cssVar("--token-button-radius", ButtonTokens.button.radius.$value);
cssVar("--token-button-dark", ButtonTokens.button.adaptive.darkWhite.light.background.$value);
cssVar("--token-button-light", ButtonTokens.button.adaptive.light.light.background.$value);
cssVar("--token-button-light-border", ButtonTokens.button.adaptive.light.light.border.$value);
cssVar("--token-blue", GlobalTokens.color.blue["600"].$value);
cssVar("--token-red", GlobalTokens.color.red["600"].$value);
cssVar("--token-zinc-50", GlobalTokens.color.zinc["50"].$value);
cssVar("--token-zinc-100", GlobalTokens.color.zinc["100"].$value);
cssVar("--token-zinc-200", GlobalTokens.color.zinc["200"].$value);
cssVar("--token-zinc-700", GlobalTokens.color.zinc["700"].$value);
cssVar("--token-zinc-950", GlobalTokens.color.zinc["950"].$value);
cssVar("--home-gate-surface", GlobalTokens.color.rose["200"].$value);
cssVar("--home-gate-label", GlobalTokens.color.red["400"].$value);
cssVar("--home-gate-text", GlobalTokens.color.amber["100"].$value);
cssVar("--home-booking-surface", GlobalTokens.color.violet["200"].$value);
cssVar("--home-booking-text", GlobalTokens.color.white.$value);
cssVar("--home-visitors-surface", GlobalTokens.color.rose["100"].$value);
cssVar("--home-visitors-label", GlobalTokens.color.rose["200"].$value);
cssVar("--home-visitors-text", GlobalTokens.color.white.$value);
cssVar("--home-market-surface", GlobalTokens.color.stone["300"].$value);
cssVar("--home-market-label", GlobalTokens.color.stone["500"].$value);
cssVar("--home-market-text", GlobalTokens.color.white.$value);
cssVar("--home-reading-surface", GlobalTokens.color.emerald["200"].$value);
cssVar("--home-reading-label", GlobalTokens.color.green["400"].$value);
cssVar("--home-reading-text", GlobalTokens.color.amber["100"].$value);
cssVar("--home-post-surface", GlobalTokens.color.indigo["200"].$value);
cssVar("--home-post-label", GlobalTokens.color.indigo["300"].$value);
cssVar("--home-post-text", GlobalTokens.color.gray["50"].$value);
cssVar("--token-white", GlobalTokens.color.white.$value);

const modules = [
  {
    id: "gate",
    title: "Gate",
    voiceNames: ["gate", "visitor gate", "entry gate"],
    subtitle: "Visitor approvals and entry control",
    action: "Opening Gate module for visitor passes.",
    image: assets.gate,
    tone: "gate",
    size: "tall",
    labelStyle: "bottom-band",
    iconClass: "card-art card-art--gate"
  },
  {
    id: "space-booking",
    title: "Space Booking",
    voiceNames: ["space booking", "booking", "book room"],
    subtitle: "Reserve meeting rooms and desks",
    action: "Opening Space Booking for the next available room.",
    image: assets.booking,
    tone: "booking",
    size: "short",
    labelStyle: "inline",
    iconClass: "card-art card-art--booking"
  },
  {
    id: "visitors",
    title: "Visitors",
    voiceNames: ["visitors", "visitor", "guests"],
    subtitle: "Visitor log and approvals",
    action: "Opening Visitors and today’s check-ins.",
    image: assets.visitors,
    tone: "visitors",
    size: "short",
    labelStyle: "bottom-band",
    iconClass: "card-art card-art--visitors"
  },
  {
    id: "market",
    title: "Market",
    voiceNames: ["market", "marketplace"],
    subtitle: "Resident marketplace and offers",
    action: "Opening Market and latest listings.",
    image: assets.market,
    tone: "market",
    size: "short",
    labelStyle: "bottom-band",
    iconClass: "card-art card-art--market"
  },
  {
    id: "reading-news",
    title: "Reading News",
    voiceNames: ["reading news", "news", "headlines"],
    subtitle: "News and local updates",
    action: "Opening Reading News with the latest brief.",
    image: assets.readingNews,
    tone: "reading",
    size: "tall",
    labelStyle: "bottom-band",
    iconClass: "card-art card-art--reading"
  },
  {
    id: "post",
    title: "Post",
    voiceNames: ["post", "posts", "announcements"],
    subtitle: "Community announcements",
    action: "Opening Post composer for a new community update.",
    image: assets.post,
    tone: "post",
    size: "short",
    labelStyle: "overlay-top",
    iconClass: "card-art card-art--post"
  }
];

const residentData = {
  gateQueue: [
    { id: "visitor-1", name: "Riya Sharma", purpose: "Laundry pickup", time: "10:15 AM", status: "pending" },
    { id: "visitor-2", name: "Karan Mehta", purpose: "Parcel delivery", time: "11:05 AM", status: "pending" }
  ],
  spaces: [
    { id: "clubhouse", name: "Clubhouse", slot: "6:00 PM - 7:00 PM", status: "available" },
    { id: "meeting-room", name: "Meeting Room", slot: "7:30 PM - 8:30 PM", status: "booked" },
    { id: "court", name: "Badminton Court", slot: "8:00 PM - 9:00 PM", status: "available" }
  ],
  bookingOptions: [
    {
      id: "cowork",
      name: "Co-Work Space",
      price: "₹ 400/Day",
      residentPrice: "₹ 130/ Day",
      memberPrice: "₹ 90/ Day",
      subtitle: "Prezzo come per profilo utente",
      sampleText: "Sample text",
      detailTitle: "Multi Purpose Room",
      location: "Waman Ganesh Height, Behind Cafe Peter, Bavdhan, Pune",
      shortDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      longDescription:
        "The Little Earth community kitchen is a fully equipped, spacious, and modern facility available for residents to book for their cooking needs, events, or gatherings. With state-of-the-art appliances and ample space, it's the perfect venue for creating memorable experiences with your friends, family, or neighbors.",
      image: "bookingCowork",
      detailHeroImage: "bookingDetailHero",
      gallery: ["bookingDetailThumb1", "bookingDetailThumb2", "bookingDetailThumb3", "bookingDetailThumb1", "bookingDetailThumb3"]
    },
    {
      id: "hall",
      name: "Community Hall",
      price: "₹ 400/Day",
      residentPrice: "₹ 130/ Day",
      memberPrice: "₹ 90/ Day",
      subtitle: "Prezzo come per profilo utente",
      sampleText: "Sample text",
      detailTitle: "Community Hall",
      location: "Clubhouse Block",
      shortDescription: "A flexible indoor space for gatherings and events.",
      longDescription: "A spacious hall suitable for meetings, celebrations, and group activities. Review timings, select your schedule, and continue to booking.",
      image: "bookingHall",
      detailHeroImage: "bookingHall",
      gallery: ["bookingHall", "bookingPool", "bookingGym", "bookingHall", "bookingPool"]
    },
    {
      id: "pool",
      name: "Swimming Pool",
      price: "₹ 300/Day",
      residentPrice: "₹ 100/ Day",
      memberPrice: "₹ 75/ Day",
      subtitle: "Prezzo come per profilo utente",
      sampleText: "Sample text",
      detailTitle: "Swimming Pool",
      location: "Recreation Deck",
      shortDescription: "Outdoor leisure area with timed access.",
      longDescription: "Book the pool for your preferred slot and review resident guidelines before confirming access.",
      image: "bookingPool",
      detailHeroImage: "bookingPool",
      gallery: ["bookingPool", "bookingInfinityPool", "bookingGym", "bookingPool", "bookingInfinityPool"]
    },
    {
      id: "gym",
      name: "Gym",
      price: "₹ 200/Day",
      residentPrice: "₹ 80/ Day",
      memberPrice: "₹ 60/ Day",
      subtitle: "Prezzo come per profilo utente",
      sampleText: "Sample text",
      detailTitle: "Gym",
      location: "Fitness Level 2",
      shortDescription: "Fitness area with controlled booking windows.",
      longDescription: "Reserve the gym for workout sessions and review the booking details before moving to the next step.",
      image: "bookingGym",
      detailHeroImage: "bookingGym",
      gallery: ["bookingGym", "bookingCowork", "bookingCourt", "bookingGym", "bookingCourt"]
    },
    {
      id: "infinity",
      name: "Infinity Pool",
      price: "₹ 450/Day",
      residentPrice: "₹ 150/ Day",
      memberPrice: "₹ 110/ Day",
      subtitle: "Prezzo come per profilo utente",
      sampleText: "Sample text",
      detailTitle: "Infinity Pool",
      location: "Sky Leisure Deck",
      shortDescription: "Premium leisure space with panoramic views.",
      longDescription: "Review availability, charges, and pool guidelines before proceeding with the booking flow.",
      image: "bookingInfinityPool",
      detailHeroImage: "bookingInfinityPool",
      gallery: ["bookingInfinityPool", "bookingPool", "bookingCowork", "bookingInfinityPool", "bookingPool"]
    },
    {
      id: "court",
      name: "Basketball Court",
      price: "₹ 350/Day",
      residentPrice: "₹ 120/ Day",
      memberPrice: "₹ 85/ Day",
      subtitle: "Prezzo come per profilo utente",
      sampleText: "Sample text",
      detailTitle: "Basketball Court",
      location: "Sports Arena",
      shortDescription: "Outdoor court with resident scheduling slots.",
      longDescription: "Select your preferred court slot and review community usage guidelines before moving ahead.",
      image: "bookingCourt",
      detailHeroImage: "bookingCourt",
      gallery: ["bookingCourt", "bookingGym", "bookingHall", "bookingCourt", "bookingGym"]
    }
  ],
  activityDates: ["Today", "22", "23", "24", "25", "26"],
  activities: [
    { id: "activity-1", title: "Meeting with Planet Smart City company", category: "Celebration", time: "06:46 PM", status: "declined", icon: "celebration", owner: "all" },
    { id: "activity-2", title: "Activity 12345", category: "Yoga", time: "06:46 PM", status: "approved", icon: "yoga", owner: "all" },
    { id: "activity-3", title: "Meeting with Planet Smart City company executive", category: "Celebration", time: "06:46 PM", status: "waiting", icon: "celebration", owner: "my" },
    { id: "activity-4", title: "Activity 12345", category: "Dance Class", time: "06:46 PM", status: "approved", icon: "dance", owner: "my" }
  ],
  visitorLog: [
    { id: "guest-1", name: "Mom & Dad", eta: "Today, 6:30 PM", status: "expected" },
    { id: "guest-2", name: "Urban Company", eta: "Tomorrow, 9:00 AM", status: "expected" }
  ],
  listings: [
    { id: "listing-1", title: "Dining Chairs", price: "Rs. 3,200", status: "available", saved: false },
    { id: "listing-2", title: "Yoga Pass", price: "Rs. 900", status: "available", saved: true },
    { id: "listing-3", title: "Parking Slot Share", price: "Rs. 1,500", status: "available", saved: false }
  ],
  news: [
    { id: "news-1", title: "Water maintenance on Tuesday", source: "Society Office", saved: true, read: false },
    { id: "news-2", title: "Weekend flea market registrations open", source: "Community Team", saved: false, read: true },
    { id: "news-3", title: "Tower B lift servicing completed", source: "Maintenance", saved: false, read: false }
  ],
  posts: [
    { id: "post-1", author: "Andrea", content: "Need recommendations for a reliable electrician in Tower A.", pinned: false },
    { id: "post-2", author: "Community Desk", content: "Movie night this Friday at 8 PM in the clubhouse.", pinned: true }
  ]
};

const state = {
  activeModuleId: "gate",
  activeDock: "assistant",
  currentScreen: "home",
  bookingScreen: "options",
  transcript: "",
  assistantMessage: DEFAULT_ASSISTANT_MESSAGE,
  isListening: false,
  assistantVisible: false,
  recognition: null,
  postDraft: "",
  selectedBookingOptionId: "cowork",
  selectedBookingGalleryIndex: 0,
  selectedActivityScope: "all",
  selectedActivityDate: "Today",
  selectedPaymentMethod: "online",
  bookingOverlay: null,
  bookingSheetValue: "",
  bookingSheetDraft: {
    date: "Mon 26 Sep",
    hour: "09",
    minute: "41"
  },
  bookingVoiceTarget: "details",
  bookingForm: {
    eventType: "",
    date: "",
    time: "",
    duration: "",
    repeat: "None",
    visibility: "",
    message: "",
    occasion: "Community meeting"
  },
  bookingVoiceDraft: "",
  data: structuredClone(residentData)
};

function getModule(id) {
  return modules.find((module) => module.id === id) ?? modules[0];
}

function getPromptRoute(prompt) {
  const normalized = prompt.toLowerCase();
  const module = modules.find((item) => item.voiceNames.some((name) => normalized.includes(name)));
  if (!module) {
    return {
      module: getModule(state.activeModuleId),
      assistantMessage: NO_MATCH_MESSAGE
    };
  }
  return {
    module,
    assistantMessage: module.action
  };
}

function getModulePrompt(moduleId) {
  switch (moduleId) {
    case "gate":
      return "I’m in Gate. Who is at the gate and should I approve their entry?";
    case "space-booking":
      return "I’m in Space Booking. Tell me the space, date, time, duration, repeat, and occasion.";
    case "visitors":
      return "I’m in Visitors. Who are you expecting and what time should I note?";
    case "market":
      return "I’m in Market. Are you browsing saved items or posting something to sell?";
    case "reading-news":
      return "I’m in Reading News. Want top headlines, local updates, or your saved articles?";
    case "post":
      return "I’m in Posts. Dictate your community announcement and I’ll draft it.";
    default:
      return DEFAULT_ASSISTANT_MESSAGE;
  }
}

function handleVoiceModuleCommand(text) {
  const route = getPromptRoute(text);
  if (!route || !route.module) return null;
  const prompt = getModulePrompt(route.module.id);
  selectModule(route.module.id, route.assistantMessage);
  state.assistantMessage = prompt;
  // keep assistant panel hidden unless mic flow is active
  render();
  return prompt;
}

window.handleVoiceModuleCommand = handleVoiceModuleCommand;

function handleSpaceVoiceSelection(text) {
  const normalized = (text || "").toLowerCase();
  // Only act if the prompt clearly asks for space details
  const detailIntent =
    normalized.includes("detail") ||
    normalized.includes("open") ||
    normalized.includes("show") ||
    normalized.includes("go to") ||
    normalized.includes("inside") ||
    normalized.includes("select");
  const match = state.data.bookingOptions.find((item) => {
    const name = item.name.toLowerCase();
    return normalized.includes(name) || normalized.includes(name.replace(/\s+/g, ""));
  });
  if (!match || !detailIntent) return null;

  // Ensure we are in the space-booking module before applying selection
  if (state.activeModuleId !== "space-booking") {
    selectModule("space-booking", "Opening Space Booking...");
  }

  if (!match) return null;
  state.selectedBookingOptionId = match.id;
  state.selectedBookingGalleryIndex = 0;
  state.bookingScreen = "details";
  state.bookingOverlay = null;
  const summary = `${match.name}: ${match.price || "Pricing available"}, located at ${match.location || "your property"}. ${match.shortDescription || "Details loaded."} What do you want to do here? You can say book it for a time, change date, or add a message.`;
  state.assistantMessage = summary;
  state.assistantVisible = true;
  render();
  return summary;
}

window.handleSpaceVoiceSelection = handleSpaceVoiceSelection;

function getModuleStatus(moduleId) {
  switch (moduleId) {
    case "gate":
      return `${state.data.gateQueue.filter((item) => item.status === "pending").length} waiting`;
    case "space-booking":
      return `${state.data.spaces.filter((item) => item.status === "available").length} slots open`;
    case "visitors":
      return `${state.data.visitorLog.filter((item) => item.status === "expected").length} expected`;
    case "market":
      return `${state.data.listings.filter((item) => item.saved).length} saved`;
    case "reading-news":
      return `${state.data.news.filter((item) => !item.read).length} unread`;
    case "post":
      return `${state.data.posts.length} posts`;
    default:
      return "";
  }
}

function getSelectedBookingOption() {
  return state.data.bookingOptions.find((item) => item.id === state.selectedBookingOptionId) ?? state.data.bookingOptions[0];
}

function getFilteredActivities() {
  const scope = state.selectedActivityScope;
  return state.data.activities.filter((item) => (scope === "all" ? true : item.owner === "my"));
}

function getActivityStatusLabel(status) {
  if (status === "approved") return "Approved";
  if (status === "declined") return "Declined";
  return "Waiting";
}

function parseBookingPrompt(prompt) {
  const normalized = prompt.trim();
  if (!normalized) return null;

  const nextForm = { ...state.bookingForm };
  const lower = normalized.toLowerCase();

  if (lower.includes("birthday")) nextForm.eventType = "Birthday";
  else if (lower.includes("meeting")) nextForm.eventType = "Meeting";
  else if (lower.includes("yoga")) nextForm.eventType = "Yoga";
  else if (lower.includes("celebration")) nextForm.eventType = "Celebration";

  if (lower.includes("daily")) nextForm.repeat = "Daily";
  else if (lower.includes("weekly")) nextForm.repeat = "Weekly";
  else if (lower.includes("monthly")) nextForm.repeat = "Monthly";
  else nextForm.repeat = "None";

  const durationMatch = normalized.match(/(\d+)\s*(hour|hours|hr|hrs|minute|minutes|min|mins)/i);
  if (durationMatch) {
    const value = durationMatch[1].padStart(2, "0");
    const unit = durationMatch[2].toLowerCase();
    nextForm.duration = unit.startsWith("hour") || unit.startsWith("hr") ? `${value}:00 Hours` : `00:${value} Minutes`;
  }

  const timeMatch = normalized.match(/(\d{1,2}(?::\d{2})?\s?(?:am|pm))/i);
  if (timeMatch) {
    nextForm.time = timeMatch[1].replace(/\s+/g, " ").toUpperCase();
  }

  const dateMatch = normalized.match(/(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i);
  if (dateMatch) {
    nextForm.date = dateMatch[1];
  } else if (lower.includes("today")) {
    nextForm.date = "Today";
  } else if (lower.includes("tomorrow")) {
    nextForm.date = "Tomorrow";
  }

  const occasionMatch = normalized.match(/for\s+(.+)$/i);
  if (occasionMatch) {
    nextForm.occasion = occasionMatch[1].trim();
  } else {
    nextForm.occasion = normalized;
  }

  return nextForm;
}

function generateBookingMessage(form = state.bookingForm) {
  const venue = getSelectedBookingOption();
  const eventType = form.eventType || "community event";
  const visibility = form.visibility?.toLowerCase() || "private group";
  const date = form.date || "the selected date";
  const time = form.time || "the selected time";
  const duration = form.duration || "the selected duration";
  return `Hello ${visibility}, you are invited to a ${eventType.toLowerCase()} at ${venue.name} on ${date} at ${time}. The booking is for ${duration}${form.repeat !== "None" ? ` and repeats ${form.repeat.toLowerCase()}` : ""}. ${form.occasion ? `Purpose: ${form.occasion}. ` : ""}Looking forward to seeing you there.`;
}

function parseBookingTime(value) {
  const match = (value || "").match(/(\d{1,2}):(\d{2})/);
  if (!match) {
    return { hour: "09", minute: "41" };
  }
  return {
    hour: match[1].padStart(2, "0"),
    minute: match[2]
  };
}

function formatBookingTime(draft = state.bookingSheetDraft) {
  return `${draft.hour}:${draft.minute} AM`;
}

function renderBookingFormCard(selectedOption) {
  const repeatOptions = ["None", "Daily", "Weekly", "Monthly"];
  const labelRows = [
    { field: "eventType", label: "Event type", icon: assets.bookingEventType, tone: "blue", action: "open-booking-sheet", value: state.bookingForm.eventType, placeholder: "Select event type", id: "eventType" },
    { field: "date", label: "On", icon: assets.bookingCalendar, tone: "blue", action: "open-booking-sheet", value: state.bookingForm.date, placeholder: "Select Date", id: "date" },
    { field: "time", label: "At", icon: assets.bookingClock, tone: "blue", action: "open-booking-sheet", value: state.bookingForm.time, placeholder: "Select Time", id: "time" },
    { field: "duration", label: "Duration", icon: assets.bookingClock, tone: "blue", action: "open-booking-sheet", value: state.bookingForm.duration, placeholder: "Select Duration", id: "duration" },
    { field: "visibility", label: "Visibility", icon: assets.bookingUser, tone: "blue", action: "open-booking-sheet", value: state.bookingForm.visibility, placeholder: "Select", id: "visibility" }
  ];

  return `
    <section class="booking-space-card">
      <div class="booking-form-card__hero">
        <img src="${assets[selectedOption.image]}" alt="" aria-hidden="true" />
        <div class="booking-form-card__meta booking-form-card__meta--top">
          <h3>${selectedOption.name}</h3>
          <button class="booking-space-card__change" type="button" data-action="booking-nav" data-id="options" aria-label="Change selected space">
            <img class="booking-form-card__coin" src="${assets.bookingCoins}" alt="" aria-hidden="true" />
          </button>
        </div>
        <div class="booking-form-card__details">
          <div class="booking-form-card__price-row">
            <strong>Multi Purpose Room</strong>
            <span>${selectedOption.price}</span>
          </div>
          <p class="booking-form-card__location">
            <img src="${assets.bookingLocation}" alt="" aria-hidden="true" />
            <span>Waman Ganesh Height, Behind Cafe Peter, Bavdhan, Pune</span>
          </p>
        </div>
      </div>
    </section>

    <section class="booking-form-card booking-form-card--detailed">
      <section class="booking-input-panel">
        ${labelRows
          .map(
            (row) => `
              <div class="booking-input-row">
                <div class="booking-input-row__label">
                  <img src="${row.icon}" alt="" aria-hidden="true" />
                  <span>${row.label}</span>
                </div>
                <button class="booking-input-pill booking-input-pill--${row.tone}" type="button" data-action="${row.action}" data-id="${row.id}" aria-label="Change ${row.label}">
                  <span>${row.value || row.placeholder}</span>
                  ${row.id === "visibility" ? `<img class="booking-input-pill__chevron" src="${assets.bookingChevronDown}" alt="" aria-hidden="true" />` : ""}
                </button>
              </div>
            `
          )
          .join("")}

        <div class="booking-input-row booking-input-row--repeat">
          <div class="booking-input-row__label booking-input-row__label--plain">
            <span>Repeat</span>
          </div>
          <div class="booking-repeat-options">
            ${repeatOptions
              .map(
                (option) => `
                  <button class="booking-radio ${state.bookingForm.repeat === option ? "is-selected" : ""}" type="button" data-action="set-booking-repeat" data-id="${option}">
                    <span class="booking-radio__control" aria-hidden="true"></span>
                    <span>${option}</span>
                  </button>
                `
              )
              .join("")}
          </div>
        </div>

        <div class="booking-input-row booking-input-row--message-label">
          <div class="booking-input-row__label booking-input-row__label--plain">
            <span>Message</span>
          </div>
        </div>

        <div class="booking-message-field">
          <textarea data-booking-field="message" placeholder="Write Message">${state.bookingForm.message}</textarea>
          <button class="booking-message-field__icon" type="button" data-action="booking-message-voice" aria-label="Speak invitation message">
            <img src="${assets.bookingMessageMic}" alt="" aria-hidden="true" />
          </button>
          <span class="booking-message-field__divider" aria-hidden="true"></span>
          <button class="booking-message-field__icon" type="button" data-action="generate-booking-message" aria-label="Generate invitation message with AI">
            <img src="${assets.bookingStar}" alt="" aria-hidden="true" />
          </button>
        </div>
      </section>
    </section>
  `;
}

function renderBookingDetailsScreen(selectedOption) {
  const gallery = (selectedOption.gallery || []).slice(0, 5);
  const selectedGalleryImage = gallery[state.selectedBookingGalleryIndex] || selectedOption.detailHeroImage || selectedOption.image;
  return `
    <section class="booking-header">
      <button class="module-view__back" type="button" data-action="booking-nav" data-id="options" aria-label="Back to booking options">
        <img src="${assets.chevronLeft}" alt="" aria-hidden="true" />
      </button>
      <h2>Select Space</h2>
    </section>

    <section class="booking-details-gallery-card">
      <img class="booking-details-gallery-card__hero" src="${assets[selectedGalleryImage]}" alt="" aria-hidden="true" />
      <div class="booking-details-gallery-card__thumbs">
        ${gallery
          .map(
            (imageKey, index) => `
              <button class="booking-details-gallery-card__thumb ${state.selectedBookingGalleryIndex === index ? "is-active" : ""}" type="button" data-action="select-booking-gallery-image" data-id="${index}" aria-label="Preview gallery image ${index + 1}">
                <img src="${assets[imageKey]}" alt="" aria-hidden="true" />
              </button>
            `
          )
          .join("")}
      </div>
      <h3>${selectedOption.name}</h3>
    </section>

    <section class="booking-details-pricing-card">
      <h3>${selectedOption.subtitle}</h3>
      <div class="booking-details-pricing-card__row">
        <span>Residente:</span>
        <strong>${selectedOption.residentPrice}</strong>
      </div>
      <div class="booking-details-pricing-card__row">
        <span>Membro:</span>
        <strong>${selectedOption.memberPrice}</strong>
      </div>
      <p>${selectedOption.sampleText}</p>
    </section>

    <section class="booking-details-info-card">
      <h3>${selectedOption.detailTitle}</h3>
      <p class="booking-details-info-card__location">
        <img src="${assets.bookingLocation}" alt="" aria-hidden="true" />
        <span>${selectedOption.location}</span>
      </p>
      <p>${selectedOption.shortDescription}</p>
      <strong class="booking-details-info-card__price">${selectedOption.price}</strong>
      <div class="booking-details-info-card__scroll">
        <p>${selectedOption.longDescription}</p>
        <p><strong>Booking Information:</strong></p>
        <ul>
          <li>To book this space, select the date, time, and duration of your booking.</li>
          <li>Review the booking guidelines and community policies before confirming your reservation.</li>
          <li>Continue to the form to complete the resident booking details.</li>
        </ul>
      </div>
    </section>

    <div class="booking-bottom-sheet">
      <button class="module-button module-button--primary booking-bottom-sheet__cta" type="button" data-action="booking-nav" data-id="form">Select & Continue</button>
    </div>
  `;
}

function renderBookingOverlay() {
  if (!state.bookingOverlay) return "";

  const config = {
    eventType: {
      title: "Select event type",
      field: "eventType",
      options: ["Celebration", "Meeting", "Birthday", "Yoga"]
    },
    date: {
      title: "Choose date",
      field: "date",
      options: ["Today", "Tomorrow", "23 Jul 2026", "24 Jul 2026", "25 Jul 2026"]
    },
    time: {
      title: "Choose time",
      field: "time",
      options: ["09:00 AM", "11:30 AM", "06:00 PM", "07:30 PM", "08:00 PM"]
    },
    duration: {
      title: "Select duration",
      field: "duration",
      options: ["00:30 Hours", "01:00 Hours", "02:00 Hours", "03:00 Hours"]
    },
    visibility: {
      title: "Select visibility",
      field: "visibility",
      options: ["Private", "Public"]
    }
  }[state.bookingOverlay];

  if (!config) return "";

  if (config.field === "date" || config.field === "time") {
    const selectedDate = state.bookingSheetDraft.date;
    const selectedTime = formatBookingTime(state.bookingSheetDraft);

    return `
      <section class="booking-sheet" aria-modal="true" role="dialog" aria-label="${config.title}">
        <button class="booking-sheet__scrim" type="button" data-action="close-booking-sheet" aria-label="Close ${config.title}"></button>
        <div class="booking-sheet__panel booking-sheet__panel--picker">
          <div class="booking-sheet__handle" aria-hidden="true"></div>
          <div class="booking-picker__preview">
            <img src="${config.field === "date" ? assets.bookingCalendar : assets.bookingClock}" alt="" aria-hidden="true" />
            <span>${selectedDate} ${selectedTime}</span>
          </div>
          <div class="booking-picker">
            <div class="booking-picker__selection" aria-hidden="true"></div>
            <div class="booking-picker__column booking-picker__column--date" data-picker-column="date">
              <div class="booking-picker__spacer" aria-hidden="true"></div>
              ${BOOKING_DATE_OPTIONS
                .map(
                  (option) => `
                    <button class="booking-picker__option ${selectedDate === option ? "is-selected" : ""}" type="button" data-action="set-booking-draft" data-id="date:${option}" data-picker-option="date" data-picker-value="${option}">
                      <span class="booking-picker__option-top">${option}</span>
                      ${option === "Fri 23 Sep" ? `<span class="booking-picker__option-bottom">Today</span>` : ""}
                    </button>
                  `
                )
                .join("")}
              <div class="booking-picker__spacer" aria-hidden="true"></div>
            </div>
            <div class="booking-picker__column booking-picker__column--hour" data-picker-column="hour">
              <div class="booking-picker__spacer" aria-hidden="true"></div>
              ${BOOKING_HOUR_OPTIONS
                .map(
                  (option) => `
                    <button class="booking-picker__option booking-picker__option--time ${state.bookingSheetDraft.hour === option ? "is-selected" : ""}" type="button" data-action="set-booking-draft" data-id="hour:${option}" data-picker-option="hour" data-picker-value="${option}">
                      <span>${option}</span>
                    </button>
                  `
                )
                .join("")}
              <div class="booking-picker__spacer" aria-hidden="true"></div>
            </div>
            <div class="booking-picker__column booking-picker__column--minute" data-picker-column="minute">
              <div class="booking-picker__spacer" aria-hidden="true"></div>
              ${BOOKING_MINUTE_OPTIONS
                .map(
                  (option) => `
                    <button class="booking-picker__option booking-picker__option--time ${state.bookingSheetDraft.minute === option ? "is-selected" : ""}" type="button" data-action="set-booking-draft" data-id="minute:${option}" data-picker-option="minute" data-picker-value="${option}">
                      <span>${option}</span>
                    </button>
                  `
                )
                .join("")}
              <div class="booking-picker__spacer" aria-hidden="true"></div>
            </div>
          </div>
          <div class="booking-picker__actions">
            <button class="booking-picker__cancel" type="button" data-action="close-booking-sheet">Cancel</button>
            <button class="booking-picker__add" type="button" data-action="apply-booking-sheet" data-id="datetime">Add</button>
          </div>
        </div>
      </section>
    `;
  }

  return `
    <section class="booking-sheet" aria-modal="true" role="dialog" aria-label="${config.title}">
      <button class="booking-sheet__scrim" type="button" data-action="close-booking-sheet" aria-label="Close ${config.title}"></button>
      <div class="booking-sheet__panel">
        <div class="booking-sheet__handle" aria-hidden="true"></div>
        <div class="booking-sheet__header">
          <h3>${config.title}</h3>
          <button class="booking-sheet__close" type="button" data-action="close-booking-sheet" aria-label="Close ${config.title}">Close</button>
        </div>
        <div class="booking-sheet__options">
          ${config.options
            .map(
              (option) => `
                <button class="booking-sheet__option ${state.bookingForm[config.field] === option ? "is-selected" : ""}" type="button" data-action="set-booking-field" data-id="${config.field}:${option}">
                  <span>${option}</span>
                </button>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function cardTemplate(module) {
  const isActive = module.id === state.activeModuleId;
  return `
    <button
      class="dashboard-card dashboard-card--${module.tone} dashboard-card--${module.size} dashboard-card--${module.labelStyle} ${isActive ? "is-active" : ""}"
      data-module-id="${module.id}"
      aria-pressed="${isActive ? "true" : "false"}"
      aria-label="${module.title}. ${module.subtitle}"
    >
      <div class="${module.iconClass}" aria-hidden="true">
        <img src="${module.image}" alt="" />
      </div>
      <div class="dashboard-card__label">
        <span>${module.title}</span>
        <small>${getModuleStatus(module.id)}</small>
      </div>
    </button>
  `;
}

function detailHeroTemplate(module, eyebrow, description) {
  return `
    <section class="module-view__hero module-view__hero--${module.tone}">
      <button class="module-view__back" type="button" data-nav="home" aria-label="Back to homepage">
        <img src="${assets.chevronLeft}" alt="" aria-hidden="true" />
      </button>
      <p class="module-view__eyebrow">${eyebrow}</p>
      <h2 class="module-view__title">${module.title}</h2>
      <p class="module-view__description">${description}</p>
    </section>
  `;
}

function renderGateModule(module) {
  const pendingItems = state.data.gateQueue
    .map(
      (item) => `
        <article class="module-card">
          <div>
            <h3>${item.name}</h3>
            <p>${item.purpose}</p>
          </div>
          <div class="module-meta">${item.time}</div>
          <div class="module-actions">
            <button class="module-button module-button--primary" type="button" data-action="approve-visitor" data-id="${item.id}">Approve</button>
            <button class="module-button" type="button" data-action="reject-visitor" data-id="${item.id}">Reject</button>
          </div>
        </article>
      `
    )
    .join("");

  return `
    ${detailHeroTemplate(module, "Entry Management", "Approve visitors quickly or create a one-time gate pass for someone arriving later.")}
    <section class="module-section">
      <div class="module-section__header">
        <h3>Pending approvals</h3>
        <button class="module-link" type="button" data-action="create-pass">Create pass</button>
      </div>
      ${pendingItems || '<div class="module-empty">No pending approvals right now.</div>'}
    </section>
  `;
}

function renderSpaceBookingModule(module) {
  const selectedOption = getSelectedBookingOption();
  const helperText = "Press the mic and mention all your booking details like event date, time, duration, repeat (daily weekly, monthly) and the occasion";
  const bookingFields = renderBookingFormCard(selectedOption);

  if (state.bookingScreen === "options") {
    const options = state.data.bookingOptions
      .map(
        (item) => `
          <button class="booking-option ${item.id === state.selectedBookingOptionId ? "is-selected" : ""}" type="button" data-action="select-booking-option" data-id="${item.id}">
            <img src="${assets[item.image]}" alt="" aria-hidden="true" />
            <span>${item.name}</span>
          </button>
        `
      )
      .join("");

    return `
      <section class="booking-header">
        <button class="module-view__back" type="button" data-nav="home" aria-label="Back to homepage">
          <img src="${assets.chevronLeft}" alt="" aria-hidden="true" />
        </button>
        <h2>Space Booking</h2>
      </section>
      <section class="booking-panel">
        <div class="booking-options-grid">${options}</div>
      </section>
      <p class="booking-helper">${helperText}</p>
      <section class="booking-quick-links" aria-label="Space booking quick links">
        <button class="booking-quick-links__button" type="button" data-action="booking-nav" data-id="activities-all">All Activities</button>
        <button class="booking-quick-links__button" type="button" data-action="booking-nav" data-id="activities-my">My Activities</button>
      </section>
    `;
  }

  if (state.bookingScreen === "details") {
    return renderBookingDetailsScreen(selectedOption);
  }

  if (state.bookingScreen === "form") {
    return `
      <section class="booking-header">
        <button class="module-view__back" type="button" data-action="booking-nav" data-id="options" aria-label="Back to booking options">
          <img src="${assets.chevronLeft}" alt="" aria-hidden="true" />
        </button>
        <h2>Select Space</h2>
      </section>
      ${bookingFields}
      ${renderBookingOverlay()}
    `;
  }

  if (state.bookingScreen === "voice-listening" || state.bookingScreen === "voice-review") {
    const isListening = state.bookingScreen === "voice-listening";
    return `
      <section class="booking-header">
        <button class="module-view__back" type="button" data-action="booking-nav" data-id="form" aria-label="Back to booking form">
          <img src="${assets.chevronLeft}" alt="" aria-hidden="true" />
        </button>
        <h2>Voice Booking</h2>
      </section>
      <section class="voice-capture-card">
        <div class="voice-capture-card__orb ${isListening ? "is-listening" : ""}">
          <img class="voice-capture-card__glyph" src="${assets.listeningGlyph}" alt="" aria-hidden="true" />
        </div>
        <p class="voice-capture-card__title">${isListening ? "Listening for booking details..." : "Voice details captured"}</p>
        <p class="voice-capture-card__body">${isListening ? helperText : `Heard: "${state.bookingVoiceDraft}"`}</p>
      </section>
      ${
        isListening
          ? '<div class="booking-bottom-sheet"><button class="booking-bottom-sheet__back" type="button" data-action="booking-nav" data-id="form">Cancel</button><button class="module-button module-button--primary booking-bottom-sheet__cta" type="button" data-action="finish-voice-booking">Use details</button></div>'
          : `${bookingFields}<div class="booking-bottom-sheet"><button class="booking-bottom-sheet__back" type="button" data-action="booking-nav" data-id="voice-listening">Back</button><button class="module-button module-button--primary booking-bottom-sheet__cta" type="button" data-action="booking-nav" data-id="summary">Continue</button></div>`
      }
      ${!isListening ? renderBookingOverlay() : ""}
    `;
  }

  if (state.bookingScreen === "activities-all" || state.bookingScreen === "activities-my") {
    const activities = getFilteredActivities()
      .map(
        (item) => `
          <article class="activity-card">
            <div class="activity-card__icon activity-card__icon--${item.icon}">${item.category.slice(0, 1)}</div>
            <div class="activity-card__body">
              <div class="activity-card__top">
                <h3>${item.title}</h3>
                <span class="activity-status activity-status--${item.status}">${getActivityStatusLabel(item.status)}</span>
              </div>
              <div class="activity-card__bottom">
                <span>${item.category}</span>
                <span>${item.time}</span>
              </div>
            </div>
          </article>
        `
      )
      .join("");

    const isMyActivities = state.bookingScreen === "activities-my";

    return `
      <section class="booking-header">
        <button class="module-view__back" type="button" data-action="booking-nav" data-id="options" aria-label="Back to booking options">
          <img src="${assets.chevronLeft}" alt="" aria-hidden="true" />
        </button>
        <h2>Activities</h2>
      </section>
      <section class="activities-toolbar">
        <div class="activities-segmented">
          <button class="${!isMyActivities ? "is-active" : ""}" type="button" data-action="set-activity-scope" data-id="all">All Activities</button>
          <button class="${isMyActivities ? "is-active" : ""}" type="button" data-action="set-activity-scope" data-id="my">My Activities</button>
        </div>
        <button class="activities-filter" type="button" data-action="toggle-filter">Filter</button>
      </section>
      <section class="activities-dates">
        ${state.data.activityDates
          .map(
            (date) => `
              <button class="activities-date ${date === state.selectedActivityDate ? "is-active" : ""}" type="button" data-action="select-activity-date" data-id="${date}">${date}</button>
            `
          )
          .join("")}
      </section>
      <section class="activities-panel">
        ${activities}
      </section>
      ${
        isMyActivities
          ? '<button class="module-button module-button--primary module-button--full booking-create" type="button" data-action="create-activity">Create Activity</button>'
          : ""
      }
    `;
  }

  if (state.bookingScreen === "summary") {
    return `
      <section class="booking-header">
        <button class="module-view__back" type="button" data-action="booking-nav" data-id="form" aria-label="Back to booking form">
          <img src="${assets.chevronLeft}" alt="" aria-hidden="true" />
        </button>
        <h2>Summary</h2>
      </section>
      <section class="booking-summary-card">
        <img src="${assets[selectedOption.image]}" alt="" aria-hidden="true" />
        <div class="booking-summary-card__meta">
          <h3>${selectedOption.name}</h3>
          <span>${selectedOption.price}</span>
        </div>
        <p>${selectedOption.location}</p>
      </section>
      <section class="booking-summary-list">
        <div><span>Event date</span><strong>${state.bookingForm.date}</strong></div>
        <div><span>Timing</span><strong>${state.bookingForm.time}</strong></div>
        <div><span>Duration</span><strong>${state.bookingForm.duration}</strong></div>
        <div><span>Repeat</span><strong>${state.bookingForm.repeat}</strong></div>
        <div><span>Event type</span><strong>${state.bookingForm.eventType}</strong></div>
        <div><span>Visibility</span><strong>${state.bookingForm.visibility}</strong></div>
        <div><span>Occasion</span><strong>${state.bookingForm.occasion}</strong></div>
        <div><span>Message</span><strong>${state.bookingForm.message}</strong></div>
      </section>
      <p class="booking-note">The fee must be paid after approval of the activity by the Community Manager.</p>
      <div class="booking-bottom-sheet">
        <button class="booking-bottom-sheet__back" type="button" data-action="booking-nav" data-id="form">Back</button>
        <button class="module-button module-button--primary booking-bottom-sheet__cta" type="button" data-action="booking-nav" data-id="payment">Book Space</button>
      </div>
    `;
  }

  if (state.bookingScreen === "payment") {
    return `
      <section class="booking-header">
        <button class="module-view__back" type="button" data-action="booking-nav" data-id="summary" aria-label="Back to summary">
          <img src="${assets.chevronLeft}" alt="" aria-hidden="true" />
        </button>
        <h2>Select Payment Method</h2>
      </section>
      <section class="payment-option ${state.selectedPaymentMethod === "online" ? "is-selected" : ""}">
        <button class="payment-option__row" type="button" data-action="select-payment-method" data-id="online">
          <span class="payment-option__radio ${state.selectedPaymentMethod === "online" ? "is-selected" : ""}"></span>
          <div>
            <h3>Razorpay</h3>
            <p>UPI • BHIM • Google Pay • Credit/Debit Cards • Net-banking</p>
          </div>
        </button>
      </section>
      <section class="payment-option ${state.selectedPaymentMethod === "offline" ? "is-selected" : ""}">
        <button class="payment-option__row" type="button" data-action="select-payment-method" data-id="offline">
          <span class="payment-option__radio ${state.selectedPaymentMethod === "offline" ? "is-selected" : ""}"></span>
          <div>
            <h3>Offline Payments</h3>
            <p>Terms and Conditions to be added...</p>
          </div>
        </button>
      </section>
      <div class="booking-bottom-sheet">
        <button class="booking-bottom-sheet__back" type="button" data-action="booking-nav" data-id="summary">Back</button>
        <button class="module-button module-button--primary booking-bottom-sheet__cta" type="button" data-action="booking-nav" data-id="payment-details">Book Space</button>
      </div>
    `;
  }

  return `
    <section class="booking-header">
      <button class="module-view__back" type="button" data-action="booking-nav" data-id="payment" aria-label="Back to payment method">
        <img src="${assets.chevronLeft}" alt="" aria-hidden="true" />
      </button>
      <h2>Payment Details</h2>
    </section>
    <section class="payment-details-card">
      <img src="${assets.bookingReceipt}" alt="Receipt preview" />
    </section>
    <div class="booking-bottom-sheet">
      <button class="booking-bottom-sheet__back" type="button" data-action="booking-nav" data-id="payment">Back</button>
      <button class="module-button module-button--primary booking-bottom-sheet__cta" type="button" data-action="confirm-booking">Book Space</button>
    </div>
  `;
}

function renderVisitorsModule(module) {
  const visitors = state.data.visitorLog
    .map(
      (item) => `
        <article class="module-card">
          <div>
            <h3>${item.name}</h3>
            <p>${item.eta}</p>
          </div>
          <div class="module-chip ${item.status === "arrived" ? "is-success" : ""}">${item.status}</div>
          <div class="module-actions">
            <button class="module-button module-button--primary" type="button" data-action="${item.status === "arrived" ? "mark-expected" : "mark-arrived"}" data-id="${item.id}">
              ${item.status === "arrived" ? "Mark expected" : "Mark arrived"}
            </button>
          </div>
        </article>
      `
    )
    .join("");

  return `
    ${detailHeroTemplate(module, "Visitor Tracker", "Keep track of expected guests and update their arrival status without calling security.")}
    <section class="module-section">
      <div class="module-section__header">
        <h3>Expected visitors</h3>
      </div>
      ${visitors}
    </section>
  `;
}

function renderMarketModule(module) {
  const listings = state.data.listings
    .map(
      (item) => `
        <article class="module-card">
          <div>
            <h3>${item.title}</h3>
            <p>${item.price}</p>
          </div>
          <div class="module-actions">
            <button class="module-button module-button--primary" type="button" data-action="connect-listing" data-id="${item.id}">I'm interested</button>
            <button class="module-button" type="button" data-action="toggle-save-listing" data-id="${item.id}">
              ${item.saved ? "Saved" : "Save"}
            </button>
          </div>
        </article>
      `
    )
    .join("");

  return `
    ${detailHeroTemplate(module, "Community Market", "Browse quick neighborhood listings and save items you want to revisit later.")}
    <section class="module-section">
      <div class="module-section__header">
        <h3>Fresh listings</h3>
      </div>
      ${listings}
    </section>
  `;
}

function renderReadingNewsModule(module) {
  const newsItems = state.data.news
    .map(
      (item) => `
        <article class="module-card">
          <div>
            <h3>${item.title}</h3>
            <p>${item.source}</p>
          </div>
          <div class="module-actions">
            <button class="module-button module-button--primary" type="button" data-action="toggle-read-news" data-id="${item.id}">
              ${item.read ? "Mark unread" : "Mark read"}
            </button>
            <button class="module-button" type="button" data-action="toggle-save-news" data-id="${item.id}">
              ${item.saved ? "Saved" : "Save"}
            </button>
          </div>
        </article>
      `
    )
    .join("");

  return `
    ${detailHeroTemplate(module, "Resident Updates", "Catch up on maintenance notices, event news, and local announcements in one place.")}
    <section class="module-section">
      <div class="module-section__header">
        <h3>Latest updates</h3>
      </div>
      ${newsItems}
    </section>
  `;
}

function renderPostModule(module) {
  const posts = state.data.posts
    .map(
      (item) => `
        <article class="module-card">
          <div>
            <h3>${item.author}</h3>
            <p>${item.content}</p>
          </div>
          <div class="module-actions">
            <button class="module-button ${item.pinned ? "module-button--primary" : ""}" type="button" data-action="toggle-pin-post" data-id="${item.id}">
              ${item.pinned ? "Unpin" : "Pin"}
            </button>
          </div>
        </article>
      `
    )
    .join("");

  return `
    ${detailHeroTemplate(module, "Community Posts", "Share updates with residents and keep important conversations visible.")}
    <section class="module-section">
      <div class="module-section__header">
        <h3>Create a post</h3>
      </div>
      <div class="module-composer">
        <textarea class="module-textarea" data-post-draft="true" placeholder="Write an announcement for your community...">${state.postDraft}</textarea>
        <button class="module-button module-button--primary module-button--full" type="button" data-action="publish-post">Publish post</button>
      </div>
    </section>
    <section class="module-section">
      <div class="module-section__header">
        <h3>Recent posts</h3>
      </div>
      ${posts}
    </section>
  `;
}

function renderModuleView(module) {
  switch (module.id) {
    case "gate":
      return renderGateModule(module);
    case "space-booking":
      return renderSpaceBookingModule(module);
    case "visitors":
      return renderVisitorsModule(module);
    case "market":
      return renderMarketModule(module);
    case "reading-news":
      return renderReadingNewsModule(module);
    case "post":
      return renderPostModule(module);
    default:
      return "";
  }
}

function renderGlobalDock() {
  return `
    <nav class="bottom-dock" aria-label="Primary">
      <div class="bottom-dock__back" aria-hidden="true">
        <img src="${assets.dockBack}" alt="" />
      </div>
      <div class="bottom-dock__front" aria-hidden="true">
        <img src="${assets.dockFront}" alt="" />
      </div>
      <button class="bottom-dock__side bottom-dock__side--left ${state.activeDock === "gate" ? "is-active" : ""}" type="button" data-dock="gate" aria-label="Open Gate module">
        <img class="bottom-dock__side-icon bottom-dock__side-icon--lock" src="${assets.lock}" alt="" aria-hidden="true" />
      </button>
      <button class="bottom-dock__mic ${state.isListening ? "is-listening" : ""}" type="button" aria-label="${state.isListening ? "Stop voice prompt" : "Start voice prompt"}" aria-pressed="${state.isListening ? "true" : "false"}" data-mic="true">
        <img class="bottom-dock__mic-outer" src="${assets.micOuter}" alt="" aria-hidden="true" />
        <img class="bottom-dock__mic-inner" src="${assets.micInner}" alt="" aria-hidden="true" />
        <img class="bottom-dock__mic-blur" src="${assets.micBlur}" alt="" aria-hidden="true" />
        <span class="bottom-dock__mic-icon-plate" aria-hidden="true"></span>
        <img class="bottom-dock__mic-icon" src="${assets.mic}" alt="" aria-hidden="true" />
      </button>
      <button class="bottom-dock__side bottom-dock__side--right ${state.activeDock === "community" ? "is-active" : ""}" type="button" data-dock="community" aria-label="Open Community module">
        <img class="bottom-dock__side-icon bottom-dock__side-icon--community" src="${assets.users}" alt="" aria-hidden="true" />
      </button>
    </nav>
  `;
}

let shellInitialized = false;

function ensureShell() {
  if (shellInitialized) return;

  document.querySelector("#app").innerHTML = `
    <main class="app-stage">
      <section class="phone-shell" aria-label="Gate Keeper home screen">
        <div class="phone-status" aria-hidden="true">
          <span class="phone-status__time">1:41</span>
          <div class="phone-status__icons">
            <span class="signal-bars"></span>
            <span class="wifi-mark"></span>
            <span class="battery-mark"></span>
          </div>
        </div>
        <div class="home-scroll"></div>
        <div class="sr-only" aria-live="polite" aria-atomic="true"></div>
        <div data-assistant-layer="true"></div>
        <div data-dock-layer="true">${renderGlobalDock()}</div>
      </section>
    </main>
  `;

  shellInitialized = true;
  bindEvents();
}

function updateGlobalDockState() {
  const dockLayer = document.querySelector("[data-dock-layer='true']");
  if (!dockLayer) return;

  dockLayer.querySelector(".bottom-dock__side--left")?.classList.toggle("is-active", state.activeDock === "gate");
  dockLayer.querySelector(".bottom-dock__side--right")?.classList.toggle("is-active", state.activeDock === "community");

  const micButton = dockLayer.querySelector(".bottom-dock__mic");
  if (micButton) {
    micButton.classList.toggle("is-listening", state.isListening);
    micButton.setAttribute("aria-label", state.isListening ? "Stop voice prompt" : "Start voice prompt");
    micButton.setAttribute("aria-pressed", state.isListening ? "true" : "false");
  }
}

function render() {
  ensureShell();
  const activeModule = getModule(state.activeModuleId);
  const showGlobalDock = true;
  const mainContent =
    state.currentScreen === "home"
      ? `
          <header class="hero">
            <div class="hero__identity">
              <p class="hero__greeting">Good Morning,</p>
              <h1 class="hero__name">Andrea</h1>
              <p class="hero__address">A-102, Tanishq, Pune, India <span>⌄</span></p>
            </div>

            <div class="hero__actions">
              <div class="weather-pill" aria-label="Current weather">
                <img src="${assets.weather}" alt="" />
                <span>26</span>
                <span>°C</span>
              </div>

              <button class="icon-button" type="button" aria-label="Notifications, 9 unread">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3.5a4 4 0 0 0-4 4v2.1c0 .7-.2 1.4-.6 2l-1.2 1.8c-.5.8 0 1.8 1 1.8h9.6c1 0 1.5-1 .9-1.8l-1.2-1.8c-.4-.6-.6-1.3-.6-2V7.5a4 4 0 0 0-4-4Zm0 17a2.5 2.5 0 0 0 2.3-1.5H9.7A2.5 2.5 0 0 0 12 20.5Z" />
                </svg>
                <span class="icon-button__badge" aria-hidden="true">9</span>
              </button>

              <img class="hero__avatar" src="${assets.avatar}" alt="Andrea profile" />
            </div>
          </header>

          <section class="dashboard-grid" aria-label="Home modules">
            ${modules.map(cardTemplate).join("")}
          </section>
        `
      : `<section class="module-view">${renderModuleView(activeModule)}</section>`;
  const assistantMarkup = state.assistantVisible
    ? `
        <div class="voice-modal">
          <div class="voice-modal__scrim" data-clear-transcript="true"></div>
          <div class="voice-modal__header">
            <button class="voice-modal__back" type="button" data-clear-transcript="true" aria-label="Close voice prompt">
              <img src="${assets.chevronLeft}" alt="" />
            </button>
            <div class="voice-modal__header-title">${activeModule.title}</div>
          </div>
          <section class="voice-modal__card" role="dialog" aria-modal="true" aria-labelledby="voice-modal-title" aria-describedby="voice-modal-description">
            <div class="voice-modal__icon-wrap">
              <div class="voice-modal__icon ${state.isListening ? "voice-modal__icon--animated" : ""}" data-name="fi_9380640">
                <img src="${assets.listeningGlyph}" alt="" />
              </div>
            </div>
            <h2 class="voice-modal__title" id="voice-modal-title">${state.isListening ? "Generating Invitation for you..." : "Voice prompt complete"}</h2>
            <p class="voice-modal__description" id="voice-modal-description">
              ${
                state.isListening
                  ? "Please wait while your audio is being processed. This may take a few moments."
                  : state.transcript
                    ? `Heard: "${state.transcript}"`
                    : state.assistantMessage
              }
            </p>
            <button class="voice-modal__cancel" type="button" data-clear-transcript="true">Cancel</button>
          </section>
        </div>
      `
    : "";

  document.querySelector(".home-scroll").innerHTML = mainContent;
  document.querySelector(".sr-only").textContent = state.assistantMessage;
  document.querySelector("[data-assistant-layer='true']").innerHTML = assistantMarkup;
  document.querySelector("[data-dock-layer='true']").style.display = showGlobalDock ? "" : "none";
  updateGlobalDockState();

  bindPickerColumns();
}

function selectModule(moduleId, sourceMessage) {
  const module = getModule(moduleId);
  state.activeModuleId = module.id;
  state.currentScreen = "module";
  if (module.id === "space-booking") {
    state.bookingScreen = "options";
    state.bookingOverlay = null;
  }
  state.assistantMessage = sourceMessage ?? module.action;
  render();
}

function goHome() {
  state.currentScreen = "home";
  state.bookingScreen = "options";
  state.bookingOverlay = null;
  state.assistantMessage = DEFAULT_ASSISTANT_MESSAGE;
  render();
  window.startWakeListening?.();
}

if (typeof window !== "undefined") {
  window.goHome = goHome;
}

function clearTranscript() {
  state.recognition?.stop?.();
  state.recognition = null;
  state.transcript = "";
  state.assistantVisible = false;
  state.assistantMessage = DEFAULT_ASSISTANT_MESSAGE;
  state.isListening = false;
  render();
}

function handleDockSelection(dock) {
  state.activeDock = dock;
  if (dock === "gate") {
    selectModule("gate", "Gate controls ready. You can approve visitors or issue a pass.");
    return;
  }
  selectModule("post", "Community area ready. You can post announcements or review updates.");
}

function updateCollection(collection, itemId, updater) {
  state.data[collection] = state.data[collection].map((item) => (item.id === itemId ? updater(item) : item));
}

function handleModuleAction(action, itemId) {
  switch (action) {
    case "select-booking-option":
      state.selectedBookingOptionId = itemId;
      state.selectedBookingGalleryIndex = 0;
      state.bookingScreen = "details";
      state.bookingOverlay = null;
      state.assistantMessage = `${getSelectedBookingOption().name} details opened.`;
      break;
    case "select-booking-gallery-image":
      state.selectedBookingGalleryIndex = Number(itemId) || 0;
      render();
      return;
    case "booking-nav":
      state.bookingScreen = itemId;
      state.bookingOverlay = null;
      if (itemId === "options") {
        state.assistantMessage = "Choose a space or use the mic to describe your booking.";
      } else if (itemId === "activities-all") {
        state.selectedActivityScope = "all";
        state.assistantMessage = "Showing all activities.";
      } else if (itemId === "activities-my") {
        state.selectedActivityScope = "my";
        state.assistantMessage = "Showing your activities.";
      } else if (itemId === "payment") {
        state.assistantMessage = "Choose how you want to pay for the booking.";
      } else if (itemId === "payment-details") {
        state.assistantMessage = "Review the payment details before confirming.";
      } else if (itemId === "summary") {
        state.assistantMessage = "Review your booking summary.";
      } else if (itemId === "form") {
        state.assistantMessage = "Fill in the booking details or use the mic.";
      } else if (itemId === "voice-listening") {
        state.assistantMessage = "Listening for booking details...";
      }
      break;
    case "set-activity-scope":
      state.selectedActivityScope = itemId;
      state.bookingScreen = itemId === "my" ? "activities-my" : "activities-all";
      state.assistantMessage = itemId === "my" ? "Showing your activities." : "Showing all activities.";
      break;
    case "select-activity-date":
      state.selectedActivityDate = itemId;
      state.assistantMessage = `Showing activities for ${itemId}.`;
      break;
    case "toggle-filter":
      state.assistantMessage = "Filter options will be available in the next iteration.";
      break;
    case "create-activity":
      state.bookingScreen = "options";
      state.assistantMessage = "Start by picking a venue for the new activity.";
      break;
    case "select-payment-method":
      state.selectedPaymentMethod = itemId;
      state.assistantMessage = itemId === "online" ? "Online payment selected." : "Offline payment selected.";
      break;
    case "open-booking-sheet":
      state.bookingOverlay = itemId;
      state.bookingSheetValue = state.bookingForm[itemId] || "";
      if (itemId === "date" || itemId === "time") {
        const parsedTime = parseBookingTime(state.bookingForm.time);
        state.bookingSheetDraft = {
          date: state.bookingForm.date || "Mon 26 Sep",
          hour: parsedTime.hour,
          minute: parsedTime.minute
        };
      }
      state.assistantMessage = `Choose ${itemId}.`;
      break;
    case "close-booking-sheet":
      state.bookingOverlay = null;
      state.bookingSheetValue = "";
      break;
    case "set-booking-draft": {
      const [field, ...parts] = itemId.split(":");
      state.bookingSheetDraft[field] = parts.join(":");
      render();
      return;
    }
    case "set-booking-sheet-value": {
      const [field, ...parts] = itemId.split(":");
      state.bookingSheetValue = parts.join(":");
      render();
      return;
    }
    case "apply-booking-sheet":
      if (itemId === "datetime") {
        state.bookingForm.date = state.bookingSheetDraft.date;
        state.bookingForm.time = formatBookingTime(state.bookingSheetDraft);
      } else if (state.bookingSheetValue) {
        state.bookingForm[itemId] = state.bookingSheetValue;
      }
      state.bookingOverlay = null;
      state.bookingSheetValue = "";
      break;
    case "set-booking-field": {
      const [field, ...parts] = itemId.split(":");
      const value = parts.join(":");
      state.bookingForm[field] = value;
      state.bookingOverlay = null;
      state.bookingSheetValue = "";
      state.assistantMessage = `${field} updated.`;
      break;
    }
    case "set-booking-repeat":
      state.bookingForm.repeat = itemId;
      state.assistantMessage = `Repeat set to ${itemId}.`;
      break;
    case "booking-message-voice":
      state.bookingVoiceTarget = "message";
      startVoicePrompt();
      return;
    case "generate-booking-message":
      state.bookingForm.message = generateBookingMessage(state.bookingForm);
      state.assistantMessage = "Invitation message drafted from the booking details.";
      break;
    case "finish-voice-booking":
      state.bookingScreen = "voice-review";
      state.assistantMessage = "Voice details applied. Review before continuing.";
      break;
    case "confirm-booking":
      state.bookingScreen = "payment-details";
      state.assistantMessage = `${getSelectedBookingOption().name} booked successfully. Receipt shared in payment details.`;
      break;
    case "approve-visitor":
      updateCollection("gateQueue", itemId, (item) => ({ ...item, status: "approved" }));
      state.assistantMessage = "Visitor approved and gate team has been notified.";
      break;
    case "reject-visitor":
      state.data.gateQueue = state.data.gateQueue.filter((item) => item.id !== itemId);
      state.assistantMessage = "Visitor request removed from the queue.";
      break;
    case "create-pass":
      state.data.visitorLog.unshift({
        id: `guest-${Date.now()}`,
        name: "Pre-approved guest",
        eta: "Today, 7:15 PM",
        status: "expected"
      });
      state.assistantMessage = "A quick gate pass was created for tonight.";
      break;
    case "book-space":
      updateCollection("spaces", itemId, (item) => ({ ...item, status: "booked" }));
      state.assistantMessage = "Space booked successfully.";
      break;
    case "release-space":
      updateCollection("spaces", itemId, (item) => ({ ...item, status: "available" }));
      state.assistantMessage = "Booking released back to the community.";
      break;
    case "mark-arrived":
      updateCollection("visitorLog", itemId, (item) => ({ ...item, status: "arrived" }));
      state.assistantMessage = "Visitor marked as arrived.";
      break;
    case "mark-expected":
      updateCollection("visitorLog", itemId, (item) => ({ ...item, status: "expected" }));
      state.assistantMessage = "Visitor marked as expected again.";
      break;
    case "connect-listing":
      state.assistantMessage = "Seller contact shared in your resident inbox.";
      break;
    case "toggle-save-listing":
      updateCollection("listings", itemId, (item) => ({ ...item, saved: !item.saved }));
      state.assistantMessage = "Market item updated.";
      break;
    case "toggle-read-news":
      updateCollection("news", itemId, (item) => ({ ...item, read: !item.read }));
      state.assistantMessage = "News status updated.";
      break;
    case "toggle-save-news":
      updateCollection("news", itemId, (item) => ({ ...item, saved: !item.saved }));
      state.assistantMessage = "News article saved.";
      break;
    case "toggle-pin-post":
      updateCollection("posts", itemId, (item) => ({ ...item, pinned: !item.pinned }));
      state.data.posts.sort((a, b) => Number(b.pinned) - Number(a.pinned));
      state.assistantMessage = "Post visibility updated.";
      break;
    case "publish-post":
      if (!state.postDraft.trim()) {
        state.assistantMessage = "Write something first before publishing.";
        render();
        return;
      }
      state.data.posts.unshift({
        id: `post-${Date.now()}`,
        author: "Andrea",
        content: state.postDraft.trim(),
        pinned: false
      });
      state.postDraft = "";
      state.assistantMessage = "Post published to the community feed.";
      break;
    default:
      return;
  }

  render();
}

function handleRecognizedPrompt(text) {
  state.transcript = text;
  state.isListening = false;
  state.assistantVisible = false;
  state.recognition = null;
  if (state.currentScreen === "module" && state.activeModuleId === "space-booking") {
    if (state.bookingVoiceTarget === "message") {
      state.bookingForm.message = text;
      state.bookingVoiceTarget = "details";
      state.bookingScreen = "form";
      state.assistantMessage = "Invitation message captured from voice input.";
      render();
      return;
    }
    const parsed = parseBookingPrompt(text);
    if (parsed) {
      state.bookingVoiceDraft = text;
      state.bookingForm = parsed;
      state.bookingVoiceTarget = "details";
      state.bookingOverlay = null;
      state.bookingScreen = "voice-review";
      state.assistantMessage = "Booking details captured from voice input.";
      render();
      return;
    }
  }

  state.assistantVisible = true;
  const route = getPromptRoute(text);
  state.activeDock = route.module.id === "gate" ? "gate" : "assistant";
  state.activeModuleId = route.module.id;
  state.currentScreen = "module";
  if (route.module.id === "space-booking") {
    state.bookingScreen = "options";
  }
  state.assistantMessage = route.assistantMessage;
  render();
  window.setTimeout(() => {
    state.assistantVisible = false;
    render();
  }, 1200);
}

function startVoicePrompt() {
  state.activeDock = "assistant";
  state.isListening = true;
  render();
  window.triggerAssistantFromMic?.();
}

let eventsBound = false;

function bindEvents() {
  if (eventsBound) return;
  eventsBound = true;

  const app = document.querySelector("#app");
  app?.addEventListener("click", (event) => {
    const target = event.target.closest("button, [data-module-id], [data-dock], [data-mic='true'], [data-clear-transcript='true'], [data-nav='home'], [data-action]");
    if (!target) return;

    if (target.matches("[data-module-id]")) {
      const moduleId = target.getAttribute("data-module-id");
      selectModule(moduleId, `${getModule(moduleId).title} selected from the homepage.`);
      return;
    }

    if (target.matches("[data-dock]")) {
      handleDockSelection(target.getAttribute("data-dock"));
      return;
    }

    if (target.matches("[data-mic='true']")) {
      startVoicePrompt();
      return;
    }

    if (target.matches("[data-clear-transcript='true']")) {
      clearTranscript();
      return;
    }

    if (target.matches("[data-nav='home']")) {
      goHome();
      return;
    }

    if (target.matches("[data-action]")) {
      handleModuleAction(target.getAttribute("data-action"), target.getAttribute("data-id"));
    }
  });

  app?.addEventListener("input", (event) => {
    const target = event.target;
    if (target.matches("[data-post-draft='true']")) {
      state.postDraft = target.value;
      return;
    }

    if (target.matches("[data-booking-field]")) {
      const field = target.getAttribute("data-booking-field");
      state.bookingForm[field] = target.value;
    }
  });
}

function bindPickerColumns() {
  document.querySelectorAll("[data-picker-column]").forEach((element) => {
    if (element.dataset.pickerBound === "true") return;
    element.dataset.pickerBound = "true";

    const syncSelection = () => {
      const options = Array.from(element.querySelectorAll("[data-picker-option]"));
      if (!options.length) return;

      const columnRect = element.getBoundingClientRect();
      const targetY = columnRect.top + columnRect.height / 2;
      let nearest = options[0];
      let nearestDistance = Number.POSITIVE_INFINITY;

      options.forEach((option) => {
        const rect = option.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - targetY);
        if (distance < nearestDistance) {
          nearest = option;
          nearestDistance = distance;
        }
      });

      const field = nearest.getAttribute("data-picker-option");
      const value = nearest.getAttribute("data-picker-value");
      if (field && value && state.bookingSheetDraft[field] !== value) {
        state.bookingSheetDraft[field] = value;
      }
    };

    const selected = element.querySelector(".is-selected");
    if (selected) {
      selected.scrollIntoView({ block: "center" });
    }

    let timeoutId = null;
    element.addEventListener("scroll", () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(syncSelection, 90);
    });
  });
}

render();
initAssistant();
