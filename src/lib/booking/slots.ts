import type { EventType, HostProfile } from "@/lib/booking/types";
import {
  countConfirmedForTypeInMonth,
  countConfirmedForTypeInWeek,
  countConfirmedForTypeOnDay,
  isRangeTaken,
} from "@/lib/booking/storage";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isBookableDay(
  date: Date,
  host: HostProfile,
  now = new Date(),
  eventType?: EventType,
) {
  if (!host.weekdays.includes(date.getDay())) return false;
  if (startOfDay(date).getTime() < startOfDay(now).getTime()) return false;
  if (eventType && eventType.dateRangeDays > 0) {
    const latest = startOfDay(now);
    latest.setDate(latest.getDate() + eventType.dateRangeDays);
    if (startOfDay(date).getTime() > latest.getTime()) return false;
  }
  return true;
}

function extraStartsOnDay(extraStarts: string[], date: Date) {
  return extraStarts.filter((iso) => {
    const at = new Date(iso);
    return (
      at.getFullYear() === date.getFullYear() &&
      at.getMonth() === date.getMonth() &&
      at.getDate() === date.getDate()
    );
  }).length;
}

function extraStartsInWeek(extraStarts: string[], date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const mondayOffset = (d.getDay() + 6) % 7;
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - mondayOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return extraStarts.filter((iso) => {
    const at = new Date(iso);
    return at >= weekStart && at < weekEnd;
  }).length;
}

function extraStartsInMonth(extraStarts: string[], date: Date) {
  return extraStarts.filter((iso) => {
    const at = new Date(iso);
    return (
      at.getFullYear() === date.getFullYear() &&
      at.getMonth() === date.getMonth()
    );
  }).length;
}

function typeCapsReached(
  host: HostProfile,
  eventType: EventType,
  date: Date,
  excludeBookingId?: string,
  extraStarts: string[] = [],
) {
  if (
    eventType.maxBookingsPerDay > 0 &&
    countConfirmedForTypeOnDay(
      host.slug,
      eventType.id,
      date,
      excludeBookingId,
    ) +
      extraStartsOnDay(extraStarts, date) >=
      eventType.maxBookingsPerDay
  ) {
    return true;
  }
  if (
    eventType.maxBookingsPerWeek > 0 &&
    countConfirmedForTypeInWeek(
      host.slug,
      eventType.id,
      date,
      excludeBookingId,
    ) +
      extraStartsInWeek(extraStarts, date) >=
      eventType.maxBookingsPerWeek
  ) {
    return true;
  }
  if (
    eventType.maxBookingsPerMonth > 0 &&
    countConfirmedForTypeInMonth(
      host.slug,
      eventType.id,
      date,
      excludeBookingId,
    ) +
      extraStartsInMonth(extraStarts, date) >=
      eventType.maxBookingsPerMonth
  ) {
    return true;
  }
  return false;
}

export function getAvailableSlots(
  host: HostProfile,
  date: Date,
  now = new Date(),
  excludeBookingId?: string,
  options?: {
    skipTakenCheck?: boolean;
    durationMinutes?: number;
    eventType?: EventType;
  },
): string[] {
  if (!isBookableDay(date, host, now, options?.eventType)) return [];

  const duration =
    options?.eventType?.durationMinutes ??
    options?.durationMinutes ??
    host.durationMinutes;
  const slots: string[] = [];
  const startMinutes = host.windowStartMinutes;
  const endMinutes = host.windowEndMinutes;
  const skipTakenCheck = options?.skipTakenCheck ?? false;
  const noticeMs = host.minNoticeHours * 60 * 60_000;
  const earliest = now.getTime() + noticeMs;

  if (
    options?.eventType &&
    !skipTakenCheck &&
    typeCapsReached(host, options.eventType, date, excludeBookingId)
  ) {
    return [];
  }

  const step = Math.min(
    options?.eventType?.slotIncrementMinutes ?? 15,
    duration,
  );

  for (
    let minutes = startMinutes;
    minutes + duration <= endMinutes;
    minutes += step
  ) {
    const startsAt = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      Math.floor(minutes / 60),
      minutes % 60,
      0,
      0,
    );

    if (startsAt.getTime() < earliest) continue;

    const endsAt = new Date(startsAt.getTime() + duration * 60_000);
    const iso = startsAt.toISOString();
    const endIso = endsAt.toISOString();

    if (
      !skipTakenCheck &&
      isRangeTaken(
        host.slug,
        iso,
        endIso,
        excludeBookingId,
        host.bufferBeforeMinutes,
        host.bufferAfterMinutes,
      )
    ) {
      continue;
    }
    slots.push(iso);
  }

  return slots;
}

/** Find same weekday/time for the next `count` weeks (including first). */
export function buildSeriesStarts(
  host: HostProfile,
  firstStartsAt: string,
  count: number,
  durationMinutes: number,
  eventType?: EventType,
  now?: Date,
): string[] | null {
  if (count <= 1) return [firstStartsAt];

  const first = new Date(firstStartsAt);
  const starts: string[] = [firstStartsAt];

  for (let i = 1; i < count; i += 1) {
    const next = new Date(
      first.getFullYear(),
      first.getMonth(),
      first.getDate() + 7 * i,
      first.getHours(),
      first.getMinutes(),
      0,
      0,
    );
    if (!isBookableDay(next, host, first, undefined)) return null;
    if (
      eventType &&
      eventType.dateRangeDays > 0 &&
      !isBookableDay(next, host, now ?? new Date(), eventType)
    ) {
      return null;
    }

    const iso = next.toISOString();
    const endIso = addMinutes(iso, durationMinutes);
    if (
      isRangeTaken(
        host.slug,
        iso,
        endIso,
        undefined,
        host.bufferBeforeMinutes,
        host.bufferAfterMinutes,
      )
    ) {
      return null;
    }

    if (eventType && typeCapsReached(host, eventType, next, undefined, starts)) {
      return null;
    }

    starts.push(iso);
  }

  return starts;
}

export function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function formatMinutesAsTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function detectGuestTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export const COMMON_TIMEZONES = [
  "Europe/Berlin",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "UTC",
] as const;
