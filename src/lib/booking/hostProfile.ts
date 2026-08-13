import {
  BOOKING_BACKGROUNDS,
  DEFAULT_BOOKING_BACKGROUND_ID,
} from "@/lib/booking/backgrounds";
import { defaultHostProfile } from "@/lib/booking/demo";
import type { AvatarShape, EventType, HostProfile } from "@/lib/booking/types";

function storageKey(slug: string) {
  return `yaku-host-${slug}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

const DURATIONS = [15, 30, 45, 60] as const;

function normalizeEventTypes(
  raw: unknown,
  fallbackTitle: string,
  fallbackDuration: number,
): EventType[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [
      {
        id: "et_default",
        title: fallbackTitle,
        durationMinutes: fallbackDuration,
      },
    ];
  }

  const types = raw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Partial<EventType>;
      const durationMinutes = Number(row.durationMinutes);
      if (!DURATIONS.includes(durationMinutes as (typeof DURATIONS)[number])) {
        return null;
      }
      return {
        id: String(row.id || `et_${index}`),
        title: String(row.title || fallbackTitle).trim() || fallbackTitle,
        durationMinutes,
      } satisfies EventType;
    })
    .filter((t): t is EventType => !!t);

  return types.length > 0
    ? types
    : [
        {
          id: "et_default",
          title: fallbackTitle,
          durationMinutes: fallbackDuration,
        },
      ];
}

function normalizeAvatarShape(raw: unknown): AvatarShape {
  return raw === "square" ? "square" : "round";
}

function normalizeBackgroundId(id: unknown): string {
  if (typeof id !== "string") return DEFAULT_BOOKING_BACKGROUND_ID;
  const match = BOOKING_BACKGROUNDS.find((b) => b.id === id);
  if (!match || match.src === null) return DEFAULT_BOOKING_BACKGROUND_ID;
  return match.id;
}

function clampNonNeg(value: unknown, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(Math.floor(n), 24 * 60);
}

function normalizeHost(raw: Partial<HostProfile> & { slug: string }): HostProfile {
  const base =
    raw.slug === defaultHostProfile.slug
      ? defaultHostProfile
      : { ...defaultHostProfile, slug: raw.slug };

  const weekdays =
    Array.isArray(raw.weekdays) && raw.weekdays.length > 0
      ? raw.weekdays.filter((d) => d >= 0 && d <= 6)
      : base.weekdays;

  const durationMinutes = raw.durationMinutes ?? base.durationMinutes;
  let windowStartMinutes = raw.windowStartMinutes ?? base.windowStartMinutes;
  let windowEndMinutes = raw.windowEndMinutes ?? base.windowEndMinutes;

  if (windowEndMinutes <= windowStartMinutes) {
    windowStartMinutes = base.windowStartMinutes;
    windowEndMinutes = base.windowEndMinutes;
  }

  const eventTitle = raw.eventTitle?.trim() || base.eventTitle;
  const safeDuration = DURATIONS.includes(
    durationMinutes as (typeof DURATIONS)[number],
  )
    ? durationMinutes
    : base.durationMinutes;

  const avatarRaw =
    typeof raw.avatarDataUrl === "string" ? raw.avatarDataUrl.trim() : null;
  const avatarDataUrl =
    avatarRaw === null
      ? base.avatarDataUrl
      : avatarRaw === "" || avatarRaw.startsWith("data:image/")
        ? avatarRaw
        : base.avatarDataUrl;

  const bio =
    typeof raw.bio === "string"
      ? raw.bio.trim().slice(0, 400)
      : base.bio;

  return {
    slug: raw.slug,
    displayName: raw.displayName?.trim() || base.displayName,
    avatarDataUrl,
    avatarShape: normalizeAvatarShape(raw.avatarShape),
    bio,
    eventTitle,
    durationMinutes: safeDuration,
    timezone: raw.timezone || base.timezone,
    weekdays,
    windowStartMinutes,
    windowEndMinutes,
    bufferBeforeMinutes: clampNonNeg(
      raw.bufferBeforeMinutes,
      base.bufferBeforeMinutes,
    ),
    bufferAfterMinutes: clampNonNeg(
      raw.bufferAfterMinutes,
      base.bufferAfterMinutes,
    ),
    minNoticeHours: clampNonNeg(raw.minNoticeHours, base.minNoticeHours),
    maxBookingsPerDay: clampNonNeg(
      raw.maxBookingsPerDay,
      base.maxBookingsPerDay,
    ),
    eventTypes: normalizeEventTypes(raw.eventTypes, eventTitle, safeDuration),
    allowSeries: raw.allowSeries ?? base.allowSeries,
    maxSeriesCount: Math.min(
      12,
      Math.max(1, clampNonNeg(raw.maxSeriesCount, base.maxSeriesCount) || 8),
    ),
    backgroundId: normalizeBackgroundId(raw.backgroundId),
  };
}

export function loadHostProfile(slug: string): HostProfile {
  if (!canUseStorage()) {
    return slug === defaultHostProfile.slug
      ? defaultHostProfile
      : { ...defaultHostProfile, slug };
  }

  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) {
      return slug === defaultHostProfile.slug
        ? defaultHostProfile
        : { ...defaultHostProfile, slug };
    }
    const parsed = JSON.parse(raw) as Partial<HostProfile>;
    return normalizeHost({ ...parsed, slug });
  } catch {
    return slug === defaultHostProfile.slug
      ? defaultHostProfile
      : { ...defaultHostProfile, slug };
  }
}

export function saveHostProfile(profile: HostProfile): HostProfile {
  const next = normalizeHost(profile);
  if (canUseStorage()) {
    window.localStorage.setItem(storageKey(next.slug), JSON.stringify(next));
  }
  return next;
}
