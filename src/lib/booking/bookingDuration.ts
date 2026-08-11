import type { Booking, HostProfile } from "@/lib/booking/types";

export function bookingDurationMinutes(
  booking: Pick<Booking, "startsAt" | "endsAt" | "eventTypeId">,
  host: HostProfile,
): number {
  const fromRange = Math.round(
    (new Date(booking.endsAt).getTime() -
      new Date(booking.startsAt).getTime()) /
      60_000,
  );
  if (fromRange > 0) return fromRange;

  if (booking.eventTypeId) {
    const eventType = host.eventTypes.find((et) => et.id === booking.eventTypeId);
    if (eventType) return eventType.durationMinutes;
  }

  return host.durationMinutes;
}
