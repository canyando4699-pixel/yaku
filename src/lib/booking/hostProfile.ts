import {
  BOOKING_BACKGROUNDS,
  DEFAULT_BOOKING_BACKGROUND_ID,
} from "@/lib/booking/backgrounds";
import { defaultHostProfile } from "@/lib/booking/demo";
import { DE_HOLIDAY_IDS, type DeHolidayId } from "@/lib/booking/holidays";
import { normalizeQuestions } from "@/lib/booking/questions";
import {
  EVENT_TYPE_COLORS,
  MAX_DATE_OVERRIDES,
  MAX_INTERVALS_PER_DAY,
  YMD_RE,
  type AvatarShape,
  type DateOverride,
  type EventType,
  type EventTypeColor,
  type HostProfile,
  type TimeInterval,
  type WeeklyHours,
} from "@/lib/booking/types";

type LegacyHostFields = {
  weekdays?: unknown;
  windowStartMinutes?: unknown;
  windowEndMinutes?: unknown;
};

function storageKey(slug: string) {
  return `yaku-host-${slug}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

const DURATIONS = [15, 30, 45, 60] as const;
const DATE_RANGES = [0, 14, 30, 60] as const;

function clampNonNeg(value: unknown, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(Math.floor(n), 24 * 60);
}

function asSlotIncrement(raw: unknown, duration: number): 10 | 15 | 30 {
  const n = Number(raw);
  const increment: 10 | 15 | 30 =
    n === 10 || n === 15 || n === 30 ? n : 15;
  const capped = Math.min(increment, duration);
  if (capped >= 30) return 30;
  if (capped >= 15) return 15;
  return 10;
}

function asDateRangeDays(raw: unknown): 0 | 14 | 30 | 60 {
  const n = Number(raw);
  return DATE_RANGES.includes(n as (typeof DATE_RANGES)[number])
    ? (n as 0 | 14 | 30 | 60)
    : 0;
}

function asColor(raw: unknown): EventTypeColor {
  return EVENT_TYPE_COLORS.includes(raw as EventTypeColor)
    ? (raw as EventTypeColor)
    : "blue";
}

function eventTypeFields(
  row: Partial<EventType>,
  durationMinutes: number,
  dateRangeDays: 0 | 14 | 30 | 60,
): Omit<EventType, "id" | "title" | "durationMinutes"> {
  return {
    description: typeof row.description === "string" ? row.description : "",
    color: asColor(row.color),
    secret: row.secret === true,
    dateRangeDays,
    slotIncrementMinutes: asSlotIncrement(row.slotIncrementMinutes, durationMinutes),
    maxBookingsPerDay: clampNonNeg(row.maxBookingsPerDay, 0),
    maxBookingsPerWeek: clampNonNeg(row.maxBookingsPerWeek, 0),
    maxBookingsPerMonth: clampNonNeg(row.maxBookingsPerMonth, 0),
    cancellationPolicy:
      typeof row.cancellationPolicy === "string"
        ? row.cancellationPolicy.trim().slice(0, 400)
        : "",
    questions: normalizeQuestions(row.questions),
  };
}

function fallbackEventType(
  id: string,
  title: string,
  durationMinutes: number,
): EventType {
  return {
    id,
    title,
    durationMinutes,
    ...eventTypeFields({}, durationMinutes, 0),
  };
}

export function resolveEventTypeOrFallback(
  types: EventType[],
  typeId?: string,
  fallbackTitle = "Meeting",
  fallbackDuration = 30,
): EventType {
  if (typeId) {
    const match = types.find((et) => et.id === typeId);
    if (match) return match;
  }
  return (
    types[0] ?? fallbackEventType("et_default", fallbackTitle, fallbackDuration)
  );
}

function normalizeEventTypes(
  raw: unknown,
  fallbackTitle: string,
  fallbackDuration: number,
): EventType[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [fallbackEventType("et_default", fallbackTitle, fallbackDuration)];
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
        ...eventTypeFields(row, durationMinutes, asDateRangeDays(row.dateRangeDays)),
      } satisfies EventType;
    })
    .filter((t): t is EventType => !!t);

  return types.length > 0
    ? types
    : [fallbackEventType("et_default", fallbackTitle, fallbackDuration)];
}

export function createEventType(
  title: string,
  durationMinutes = 30,
): EventType {
  const duration = DURATIONS.includes(
    durationMinutes as (typeof DURATIONS)[number],
  )
    ? durationMinutes
    : 30;
  return {
    id: `et_${Date.now().toString(36)}`,
    title,
    durationMinutes: duration,
    ...eventTypeFields({}, duration, 60),
  };
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

function normalizeInterval(raw: unknown): TimeInterval | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<TimeInterval>;
  const startMinutes = Number(row.startMinutes);
  const endMinutes = Number(row.endMinutes);
  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) {
    return null;
  }
  const start = Math.floor(startMinutes);
  const end = Math.floor(endMinutes);
  if (start < 0 || start > 1439) return null;
  if (end < 1 || end > 1440) return null;
  if (end <= start) return null;
  return { startMinutes: start, endMinutes: end };
}

function normalizeIntervals(raw: unknown): TimeInterval[] {
  if (!Array.isArray(raw)) return [];
  const items = raw
    .map(normalizeInterval)
    .filter((iv): iv is TimeInterval => !!iv)
    .sort(
      (a, b) =>
        a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes,
    );

  const merged: TimeInterval[] = [];
  for (const iv of items) {
    const last = merged[merged.length - 1];
    if (last && iv.startMinutes <= last.endMinutes) {
      last.endMinutes = Math.max(last.endMinutes, iv.endMinutes);
    } else {
      merged.push({ ...iv });
    }
  }
  return merged.slice(0, MAX_INTERVALS_PER_DAY);
}

function emptyWeeklyHours(): WeeklyHours {
  return [[], [], [], [], [], [], []];
}

function demoWindow(base: HostProfile): TimeInterval {
  for (const day of base.weeklyHours) {
    if (day[0]) return { ...day[0] };
  }
  return { startMinutes: 540, endMinutes: 1020 };
}

function weekdaysFromBase(base: HostProfile): number[] {
  return base.weeklyHours
    .map((intervals, day) => (intervals.length > 0 ? day : -1))
    .filter((day) => day >= 0);
}

function weeklyHoursFromLegacy(
  raw: LegacyHostFields,
  base: HostProfile,
): WeeklyHours {
  const weekdays =
    Array.isArray(raw.weekdays) && raw.weekdays.length > 0
      ? raw.weekdays.filter(
          (d): d is number =>
            typeof d === "number" && Number.isInteger(d) && d >= 0 && d <= 6,
        )
      : weekdaysFromBase(base);

  const fallback = demoWindow(base);
  let windowStartMinutes = raw.windowStartMinutes ?? fallback.startMinutes;
  let windowEndMinutes = raw.windowEndMinutes ?? fallback.endMinutes;
  windowStartMinutes = Number(windowStartMinutes);
  windowEndMinutes = Number(windowEndMinutes);
  if (windowEndMinutes <= windowStartMinutes) {
    windowStartMinutes = fallback.startMinutes;
    windowEndMinutes = fallback.endMinutes;
  }

  const interval = normalizeInterval({
    startMinutes: windowStartMinutes,
    endMinutes: windowEndMinutes,
  });
  const days = emptyWeeklyHours();
  if (!interval) return days;
  for (const day of weekdays) {
    days[day] = [{ ...interval }];
  }
  return days;
}

function normalizeWeeklyHours(
  raw: unknown,
  legacy: LegacyHostFields,
  base: HostProfile,
): WeeklyHours {
  if (Array.isArray(raw) && raw.length === 7) {
    const days = raw.map((day) => normalizeIntervals(day)) as WeeklyHours;
    const anyInterval = days.some((day) => day.length > 0);
    const allEmpty = days.every((day) => day.length === 0);
    if (anyInterval || allEmpty) {
      return days;
    }
  }
  return weeklyHoursFromLegacy(legacy, base);
}

function normalizeDateOverrides(raw: unknown): DateOverride[] {
  if (!Array.isArray(raw)) return [];
  const out: DateOverride[] = [];
  for (const item of raw) {
    if (out.length >= MAX_DATE_OVERRIDES) break;
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<DateOverride>;
    const startDate = typeof row.startDate === "string" ? row.startDate : "";
    const endDate = typeof row.endDate === "string" ? row.endDate : "";
    if (!YMD_RE.test(startDate) || !YMD_RE.test(endDate)) continue;
    if (endDate < startDate) continue;
    const kind = row.kind === "unavailable" || row.kind === "hours" ? row.kind : null;
    if (!kind) continue;
    const id =
      typeof row.id === "string" && row.id
        ? row.id
        : `ovr_${Date.now().toString(36)}_${out.length}`;
    if (kind === "unavailable") {
      out.push({ id, startDate, endDate, kind, intervals: [] });
      continue;
    }
    const intervals = normalizeIntervals(row.intervals);
    if (intervals.length < 1) continue;
    out.push({ id, startDate, endDate, kind, intervals });
  }
  return out;
}

function normalizeEnabledHolidayIds(raw: unknown): DeHolidayId[] {
  if (!Array.isArray(raw)) {
    return [...DE_HOLIDAY_IDS];
  }
  const ids = raw.filter((id): id is DeHolidayId =>
    DE_HOLIDAY_IDS.includes(id as DeHolidayId),
  );
  if (raw.length > 0 && ids.length === 0) {
    return [...DE_HOLIDAY_IDS];
  }
  return ids;
}

function normalizeHost(
  raw: Partial<HostProfile> & LegacyHostFields & { slug: string },
): HostProfile {
  const base =
    raw.slug === defaultHostProfile.slug
      ? defaultHostProfile
      : { ...defaultHostProfile, slug: raw.slug };

  const durationMinutes = raw.durationMinutes ?? base.durationMinutes;

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
    weeklyHours: normalizeWeeklyHours(raw.weeklyHours, raw, base),
    dateOverrides: normalizeDateOverrides(raw.dateOverrides),
    holidayCalendarEnabled: raw.holidayCalendarEnabled === true,
    enabledHolidayIds: normalizeEnabledHolidayIds(raw.enabledHolidayIds),
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
