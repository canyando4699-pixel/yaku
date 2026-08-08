import type { Booking } from "@/lib/booking/types";

const STORAGE_KEY = "yaku-bookings";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function listBookings(slug?: string): Booking[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Booking[]) : [];
    return slug ? all.filter((b) => b.slug === slug) : all;
  } catch {
    return [];
  }
}

export function saveBooking(booking: Booking): void {
  if (!canUseStorage()) return;
  const all = listBookings();
  all.push(booking);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function isSlotTaken(slug: string, startsAt: string): boolean {
  return listBookings(slug).some((b) => b.startsAt === startsAt);
}

export function createBookingId() {
  return `bk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
