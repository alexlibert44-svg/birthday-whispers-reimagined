import type { Lang } from "./i18n";

export type MediaItem = {
  type: "image" | "video";
  url: string;
  path?: string;
  caption?: string;
};

export type GiftConfig = {
  id: string;
  recipientName: string;
  nickname: string | null;
  celebrateAt: string; // ISO instant
  timeZone: string;
  language: Lang;
  mainMessage: string;
  extraMessages: string[];
  finalMessage: string;
  surpriseMessage: string;
  surpriseMedia: MediaItem | null;
  media: MediaItem[];
  musicUrl: string | null;
  musicPath?: string | null;
  musicEnabled: boolean;
  theme: ThemeKey;
  accentColor: string;
  messageFrameStyle: MessageFrameStyle;
  messageFrameColor: string | null;
  decorations: DecorationKey[];
};

export type ThemeKey = "midnight" | "velvet" | "aurora" | "champagne";

export type Theme = {
  label: string;
  labelAr: string;
  /** Calm background used before the celebration. */
  background: string;
  /** Brighter, festive background used from the celebration onwards. */
  celebration: string;
  haze: string;
  glow: string;
  star: string;
  balloons: string[];
  confetti: string[];
  defaultAccent: string;
};

export const THEMES: Record<ThemeKey, Theme> = {
  midnight: {
    label: "Midnight",
    labelAr: "منتصف الليل",
    background: "radial-gradient(130% 100% at 50% 0%, #241a4d 0%, #120f2b 50%, #07060f 100%)",
    celebration:
      "radial-gradient(120% 90% at 20% 10%, #4b2a8a 0%, transparent 60%), radial-gradient(120% 90% at 85% 15%, #b4479a 0%, transparent 55%), radial-gradient(140% 110% at 50% 100%, #2a1f6b 0%, #100d24 60%, #07060f 100%)",
    haze: "radial-gradient(70% 45% at 50% 100%, rgba(160,120,255,0.28), transparent 72%)",
    glow: "#a689ff",
    star: "#dcd6ff",
    balloons: ["#ff7ab8", "#a689ff", "#6fb7ff", "#ffd67a", "#ff6f91", "#ffffff"],
    confetti: ["#ff7ab8", "#a689ff", "#6fb7ff", "#ffd67a", "#8ff0cb", "#ffffff"],
    defaultAccent: "#c3a7ff",
  },
  velvet: {
    label: "Velvet",
    labelAr: "المخمل",
    background: "radial-gradient(130% 100% at 50% 0%, #47102c 0%, #23091a 52%, #0c0308 100%)",
    celebration:
      "radial-gradient(120% 90% at 25% 10%, #a01f56 0%, transparent 58%), radial-gradient(120% 90% at 80% 18%, #ff5d8f 0%, transparent 52%), radial-gradient(140% 110% at 50% 100%, #5c1231 0%, #220714 62%, #0c0308 100%)",
    haze: "radial-gradient(70% 45% at 50% 100%, rgba(255,120,170,0.28), transparent 72%)",
    glow: "#ff8ab0",
    star: "#ffd9e6",
    balloons: ["#ff5d8f", "#ff9ec4", "#ffd67a", "#c34d8c", "#ffffff", "#ff7043"],
    confetti: ["#ff5d8f", "#ffd67a", "#ff9ec4", "#ffffff", "#ffb37a", "#c34d8c"],
    defaultAccent: "#f2879b",
  },
  aurora: {
    label: "Aurora",
    labelAr: "الشفق",
    background: "radial-gradient(130% 100% at 50% 0%, #0a3350 0%, #061f30 52%, #030b12 100%)",
    celebration:
      "radial-gradient(120% 90% at 20% 8%, #1e7f96 0%, transparent 58%), radial-gradient(120% 90% at 82% 20%, #7b5cff 0%, transparent 55%), radial-gradient(140% 110% at 50% 100%, #0c4a63 0%, #06202f 62%, #030b12 100%)",
    haze: "radial-gradient(70% 45% at 50% 100%, rgba(90,240,220,0.24), transparent 72%)",
    glow: "#6ff0e0",
    star: "#d5fbff",
    balloons: ["#5ce1e6", "#7b5cff", "#8ff0cb", "#6fb7ff", "#ffffff", "#ffd67a"],
    confetti: ["#5ce1e6", "#7b5cff", "#8ff0cb", "#6fb7ff", "#ffffff", "#ffd67a"],
    defaultAccent: "#8ff0cb",
  },
  champagne: {
    label: "Champagne",
    labelAr: "الشمبانيا",
    background: "radial-gradient(130% 100% at 50% 0%, #46330f 0%, #241a09 52%, #0c0904 100%)",
    celebration:
      "radial-gradient(120% 90% at 22% 10%, #b8862b 0%, transparent 58%), radial-gradient(120% 90% at 80% 16%, #ffd67a 0%, transparent 48%), radial-gradient(140% 110% at 50% 100%, #5d4415 0%, #241a09 62%, #0c0904 100%)",
    haze: "radial-gradient(70% 45% at 50% 100%, rgba(255,210,130,0.28), transparent 72%)",
    glow: "#ffd67a",
    star: "#fff4d8",
    balloons: ["#ffd67a", "#f6e3b4", "#e0a94a", "#ffffff", "#ff9ec4", "#c9a227"],
    confetti: ["#ffd67a", "#fff1cf", "#e0a94a", "#ffffff", "#ffb37a", "#c9a227"],
    defaultAccent: "#f0c473",
  },
};

export const ACCENTS = [
  { label: "Gold", labelAr: "ذهبي", value: "#f0c473" },
  { label: "Pink", labelAr: "وردي", value: "#ff7ab8" },
  { label: "Blue", labelAr: "أزرق", value: "#6fb7ff" },
  { label: "Mint", labelAr: "نعناعي", value: "#8ff0cb" },
  { label: "Purple", labelAr: "بنفسجي", value: "#c3a7ff" },
];

export type MessageFrameStyle =
  | "cinematic"
  | "royal"
  | "vintage"
  | "polaroid"
  | "film"
  | "glass"
  | "floral"
  | "scrapbook"
  | "romantic"
  | "minimal"
  | "arched"
  | "glow";

export const MESSAGE_FRAMES: {
  key: MessageFrameStyle;
  label: string;
  labelAr: string;
}[] = [
  { key: "cinematic", label: "Cinematic Luxury", labelAr: "فخامة سينمائية" },
  { key: "royal", label: "Classic Royal", labelAr: "ملكي كلاسيكي" },
  { key: "vintage", label: "Vintage Letter", labelAr: "رسالة عتيقة" },
  { key: "polaroid", label: "Polaroid", labelAr: "بولارويد" },
  { key: "film", label: "Film Strip", labelAr: "شريط سينمائي" },
  { key: "glass", label: "Elegant Glass", labelAr: "زجاج أنيق" },
  { key: "floral", label: "Soft Floral", labelAr: "زهور ناعمة" },
  { key: "scrapbook", label: "Memory Scrapbook", labelAr: "ألبوم ذكريات" },
  { key: "romantic", label: "Romantic", labelAr: "رومانسي" },
  { key: "minimal", label: "Minimal Luxury", labelAr: "فخامة بسيطة" },
  { key: "arched", label: "Arched", labelAr: "إطار مقوس" },
  { key: "glow", label: "Soft Glow", labelAr: "توهج ناعم" },
];

export const MESSAGE_FRAME_COLORS = [
  { label: "Champagne", labelAr: "شمبانيا", value: "#d8b56d" },
  { label: "Rose", labelAr: "وردي", value: "#d47b93" },
  { label: "Amethyst", labelAr: "جمشت", value: "#9b83d7" },
  { label: "Sapphire", labelAr: "ياقوت أزرق", value: "#5f91c9" },
  { label: "Emerald", labelAr: "زمرد", value: "#5f9f8b" },
  { label: "Pearl", labelAr: "لؤلؤي", value: "#c9c5d2" },
];

export type DecorationKey =
  | "balloons"
  | "confetti"
  | "sparkles"
  | "stars"
  | "cake"
  | "giftbox";

export const DECORATIONS: { key: DecorationKey; icon: string; label: string; labelAr: string }[] = [
  { key: "balloons", icon: "🎈", label: "Balloons", labelAr: "بالونات" },
  { key: "confetti", icon: "🎊", label: "Confetti", labelAr: "قصاصات" },
  { key: "sparkles", icon: "✨", label: "Sparkles", labelAr: "بريق" },
  { key: "stars", icon: "⭐", label: "Stars", labelAr: "نجوم" },
  { key: "cake", icon: "🎂", label: "Cake", labelAr: "كعكة" },
  { key: "giftbox", icon: "🎁", label: "Gift box", labelAr: "صندوق هدية" },
];

export const DEFAULT_DECORATIONS: DecorationKey[] = [
  "balloons",
  "confetti",
  "sparkles",
  "stars",
  "cake",
  "giftbox",
];

/* eslint-disable @typescript-eslint/no-explicit-any */
function toMedia(value: any): MediaItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((m) => m && typeof m.url === "string")
    .map((m) => ({
      type: m.type === "video" ? "video" : "image",
      url: m.url,
      path: m.path,
      caption: m.caption ?? "",
    }));
}

export function rowToGift(row: any): GiftConfig {
  const media = toMedia(row.media);
  const legacy = toMedia(row.photos);
  return {
    id: row.id,
    recipientName: row.recipient_name,
    nickname: row.nickname ?? null,
    celebrateAt: row.celebrate_at,
    timeZone: row.time_zone,
    language: (row.language === "ar" ? "ar" : "en") as Lang,
    mainMessage: row.main_message ?? "",
    extraMessages: Array.isArray(row.extra_messages) ? row.extra_messages : [],
    finalMessage: row.final_message ?? "",
    surpriseMessage: row.surprise_message ?? "",
    surpriseMedia: row.surprise_media?.url ? toMedia([row.surprise_media])[0] ?? null : null,
    media: media.length ? media : legacy,
    musicUrl: row.music_url ?? null,
    musicEnabled: !!row.music_enabled,
    theme: (THEMES[row.theme as ThemeKey] ? row.theme : "midnight") as ThemeKey,
    accentColor: row.accent_color ?? "#f0c473",
    messageFrameStyle: MESSAGE_FRAMES.some((frame) => frame.key === row.message_frame_style)
      ? (row.message_frame_style as MessageFrameStyle)
      : "cinematic",
    messageFrameColor: typeof row.message_frame_color === "string" ? row.message_frame_color : null,
    decorations: Array.isArray(row.decorations) && row.decorations.length
      ? (row.decorations as DecorationKey[])
      : DEFAULT_DECORATIONS,
  };
}

/** Milliseconds offset of a time zone at a given instant. */
function tzOffsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  const asUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  return asUTC - date.getTime();
}

/** Convert a wall-clock date/time in a time zone into a UTC ISO instant. */
export function zonedToUtcISO(dateStr: string, timeStr: string, timeZone: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const naive = Date.UTC(y || 1970, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);
  let utc = naive - tzOffsetMs(timeZone, new Date(naive));
  utc = naive - tzOffsetMs(timeZone, new Date(utc));
  return new Date(utc).toISOString();
}

/** Split an instant back into date + time strings in a time zone. */
export function utcToZonedFields(iso: string, timeZone: string): { date: string; time: string } {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = dtf.formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour") === "24" ? "00" : get("hour")}:${get("minute")}`,
  };
}

export const TIME_ZONES = [
  "UTC",
  "Africa/Casablanca",
  "Africa/Cairo",
  "Africa/Lagos",
  "Africa/Johannesburg",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Asia/Riyadh",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "America/Sao_Paulo",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
];

export function formatCelebrationDate(iso: string, timeZone: string, lang: Lang = "en"): string {
  try {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en-GB", {
      timeZone,
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toDateString();
  }
}
