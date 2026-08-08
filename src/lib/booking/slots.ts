import type { HostProfile } from "@/lib/booking/types";
import { isSlotTaken } from "@/lib/booking/storage";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isBookableDay(date: Date, now = new Date()) {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  return startOfDay(date).getTime() >= startOfDay(now).getTime();
}

export function getAvailableSlots(
  host: HostProfile,
  date: Date,
  now = new Date(),
): string[] {
  if (!isBookableDay(date, now)) return [];

  const slots: string[] = [];
  const startHour = 9;
  const endHour = 17;

  for (
    let minutes = startHour * 60;
    minutes + host.durationMinutes <= endHour * 60;
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
    if (isSlotTaken(host.slug, iso)) continue;
    slots.push(iso);
  }

  return slots;
}

export function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}
