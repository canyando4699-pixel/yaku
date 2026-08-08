import type { HostProfile } from "@/lib/booking/types";
import {
  countConfirmedOnDay,
  isRangeTaken,
} from "@/lib/booking/storage";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isBookableDay(
  date: Date,
  host: HostProfile,
  now = new Date(),
) {
  if (!host.weekdays.includes(date.getDay())) return false;
  return startOfDay(date).getTime() >= startOfDay(now).getTime();
}

export function getAvailableSlots(
  host: HostProfile,
  date: Date,
  now = new Date(),
  excludeBookingId?: string,
  options?: { skipTakenCheck?: boolean; durationMinutes?: number },
): string[] {
  if (!isBookableDay(date, host, now)) return [];

  const duration = options?.durationMinutes ?? host.durationMinutes;
  const slots: string[] = [];
  const startMinutes = host.windowStartMinutes;
  const endMinutes = host.windowEndMinutes;
  const skipTakenCheck = options?.skipTakenCheck ?? false;
  const noticeMs = host.minNoticeHours * 60 * 60_000;
  const earliest = now.getTime() + noticeMs;

  if (
    host.maxBookingsPerDay > 0 &&
    !skipTakenCheck &&
    countConfirmedOnDay(host.slug, date, excludeBookingId) >=
      host.maxBookingsPerDay
  ) {
    return [];
  }

  const step = Math.min(15, duration);

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
    if (!isBookableDay(next, host, first)) return null;

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

    if (
      host.maxBookingsPerDay > 0 &&
      countConfirmedOnDay(host.slug, next) >= host.maxBookingsPerDay
    ) {
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
