import type { Booking, BookingStatus } from "@/lib/booking/types";

const STORAGE_KEY = "yaku-bookings";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function normalizeBooking(raw: Booking & { status?: BookingStatus }): Booking {
  return {
    ...raw,
    status: raw.status ?? "confirmed",
    answers: Array.isArray(raw.answers) ? raw.answers : [],
  };
}

function readAll(): Booking[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Booking[]) : [];
    return all.map(normalizeBooking);
  } catch {
    return [];
  }
}

function writeAll(bookings: Booking[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function listBookings(slug?: string): Booking[] {
  const all = readAll();
  return slug ? all.filter((b) => b.slug === slug) : all;
}

export function getBooking(id: string): Booking | null {
  return readAll().find((b) => b.id === id) ?? null;
}

export function saveBooking(booking: Booking): void {
  const all = readAll();
  all.push(normalizeBooking(booking));
  writeAll(all);
}

export function updateBooking(
  id: string,
  patch: Partial<Omit<Booking, "id" | "createdAt">>,
): Booking | null {
  const all = readAll();
  const index = all.findIndex((b) => b.id === id);
  if (index < 0) return null;
  const next: Booking = {
    ...all[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  all[index] = next;
  writeAll(all);
  return next;
}

export function cancelBooking(id: string): Booking | null {
  return updateBooking(id, {
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
  });
}

export function rescheduleBooking(
  id: string,
  startsAt: string,
  endsAt: string,
): Booking | null {
  const current = getBooking(id);
  if (!current || current.status !== "confirmed") return null;
  if (isRangeTaken(current.slug, startsAt, endsAt, id)) return null;
  return updateBooking(id, {
    startsAt,
    endsAt,
    status: "confirmed",
    cancelledAt: undefined,
  });
}

function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
) {
  return aStart < bEnd && bStart < aEnd;
}

export function isRangeTaken(
  slug: string,
  startsAt: string,
  endsAt: string,
  excludeId?: string,
  bufferBeforeMinutes = 0,
  bufferAfterMinutes = 0,
): boolean {
  const start =
    new Date(startsAt).getTime() - bufferBeforeMinutes * 60_000;
  const end = new Date(endsAt).getTime() + bufferAfterMinutes * 60_000;

  return listBookings(slug).some((b) => {
    if (b.status !== "confirmed" || b.id === excludeId) return false;
    const bStart = new Date(b.startsAt).getTime();
    const bEnd = new Date(b.endsAt).getTime();
    return rangesOverlap(start, end, bStart, bEnd);
  });
}

export function countConfirmedOnDay(
  slug: string,
  date: Date,
  excludeId?: string,
): number {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return listBookings(slug).filter((b) => {
    if (b.status !== "confirmed" || b.id === excludeId) return false;
    const at = new Date(b.startsAt);
    return (
      at.getFullYear() === y && at.getMonth() === m && at.getDate() === d
    );
  }).length;
}

function matchesType(
  booking: Booking,
  eventTypeId: string,
  excludeId?: string,
) {
  return (
    booking.status === "confirmed" &&
    booking.eventTypeId === eventTypeId &&
    booking.id !== excludeId
  );
}

export function countConfirmedForTypeOnDay(
  slug: string,
  eventTypeId: string,
  date: Date,
  excludeId?: string,
): number {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return listBookings(slug).filter((b) => {
    if (!matchesType(b, eventTypeId, excludeId)) return false;
    const at = new Date(b.startsAt);
    return (
      at.getFullYear() === y && at.getMonth() === m && at.getDate() === d
    );
  }).length;
}

export function countConfirmedForTypeInWeek(
  slug: string,
  eventTypeId: string,
  date: Date,
  excludeId?: string,
): number {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const mondayOffset = (d.getDay() + 6) % 7;
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - mondayOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return listBookings(slug).filter((b) => {
    if (!matchesType(b, eventTypeId, excludeId)) return false;
    const at = new Date(b.startsAt);
    return at >= weekStart && at < weekEnd;
  }).length;
}

export function countConfirmedForTypeInMonth(
  slug: string,
  eventTypeId: string,
  date: Date,
  excludeId?: string,
): number {
  const y = date.getFullYear();
  const m = date.getMonth();
  return listBookings(slug).filter((b) => {
    if (!matchesType(b, eventTypeId, excludeId)) return false;
    const at = new Date(b.startsAt);
    return at.getFullYear() === y && at.getMonth() === m;
  }).length;
}

export function createBookingId() {
  return `bk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createSeriesId() {
  return `sr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
