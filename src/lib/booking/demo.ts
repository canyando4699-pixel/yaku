import type { HostProfile } from "@/lib/booking/types";

export const defaultHostProfile: HostProfile = {
  slug: "demo",
  displayName: "Yaku Demo",
  eventTitle: "30-min meeting",
  durationMinutes: 30,
  timezone: "Europe/Berlin",
  weekdays: [1, 2, 3, 4, 5],
  windowStartMinutes: 9 * 60,
  windowEndMinutes: 17 * 60,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 10,
  minNoticeHours: 2,
  maxBookingsPerDay: 0,
  eventTypes: [
    { id: "et_15", title: "Quick chat", durationMinutes: 15 },
    { id: "et_30", title: "30-min meeting", durationMinutes: 30 },
    { id: "et_60", title: "Deep dive", durationMinutes: 60 },
  ],
  allowSeries: true,
  maxSeriesCount: 8,
};

/** @deprecated Use defaultHostProfile / loadHostProfile */
export const demoHost = defaultHostProfile;

export function getHostBySlug(slug: string): HostProfile | null {
  if (slug === defaultHostProfile.slug) return defaultHostProfile;
  return null;
}
