import type { HostProfile } from "@/lib/booking/types";
import { isSlotTaken } from "@/lib/booking/storage";

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
): string[] {
  if (!isBookableDay(date, host, now)) return [];

  const slots: string[] = [];
  const startMinutes = host.windowStartMinutes;
  const endMinutes = host.windowEndMinutes;

  for (
    let minutes = startMinutes;
    minutes + host.durationMinutes <= endMinutes;
    minutes += host.durationMinutes
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

    if (startsAt.getTime() <= now.getTime()) continue;

    const iso = startsAt.toISOString();
    if (isSlotTaken(host.slug, iso, excludeBookingId)) continue;
    slots.push(iso);
  }

  return slots;
}

export function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function formatMinutesAsTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
