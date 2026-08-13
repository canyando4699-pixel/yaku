export type BookingBackground = {
  id: string;
  src: string | null;
};

export const BOOKING_BACKGROUNDS: readonly BookingBackground[] = [
  { id: "sensoji", src: "/images/sensoji-night.jpg" },
  { id: "bg-2", src: null },
  { id: "bg-3", src: null },
  { id: "bg-4", src: null },
  { id: "bg-5", src: null },
  { id: "bg-6", src: null },
];

export const DEFAULT_BOOKING_BACKGROUND_ID = "sensoji";

export function resolveBookingBackgroundSrc(id: string | undefined): string {
  const match = BOOKING_BACKGROUNDS.find((b) => b.id === id);
  if (match?.src) return match.src;
  const fallback = BOOKING_BACKGROUNDS.find(
    (b) => b.id === DEFAULT_BOOKING_BACKGROUND_ID,
  );
  return fallback?.src ?? "/images/sensoji-night.jpg";
}
