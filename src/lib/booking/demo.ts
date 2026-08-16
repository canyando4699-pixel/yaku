import { DEFAULT_BOOKING_BACKGROUND_ID } from "@/lib/booking/backgrounds";
import { DE_HOLIDAY_IDS } from "@/lib/booking/holidays";
import type { EventType, HostProfile } from "@/lib/booking/types";

const DEMO_TYPE_DEFAULTS: Omit<EventType, "id" | "title" | "durationMinutes"> = {
  description: "",
  color: "blue",
  secret: false,
  dateRangeDays: 0,
  slotIncrementMinutes: 15,
  maxBookingsPerDay: 0,
  maxBookingsPerWeek: 0,
  maxBookingsPerMonth: 0,
  cancellationPolicy: "",
  questions: [],
};

export const defaultHostProfile: HostProfile = {
  slug: "demo",
  displayName: "Yaku Demo",
  avatarDataUrl: "",
  avatarShape: "round",
  bio: "Product designer helping teams ship clearer meeting flows. Happy to chat about scheduling, UX, or Yaku.",
  eventTitle: "30-min meeting",
  durationMinutes: 30,
  timezone: "Europe/Berlin",
  weeklyHours: [
    [],
    [{ startMinutes: 540, endMinutes: 1020 }],
    [{ startMinutes: 540, endMinutes: 1020 }],
    [{ startMinutes: 540, endMinutes: 1020 }],
    [{ startMinutes: 540, endMinutes: 1020 }],
    [{ startMinutes: 540, endMinutes: 1020 }],
    [],
  ],
  dateOverrides: [],
  holidayCalendarEnabled: false,
  enabledHolidayIds: [...DE_HOLIDAY_IDS],
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 10,
  minNoticeHours: 2,
  maxBookingsPerDay: 0,
  eventTypes: [
    { id: "et_15", title: "Quick chat", durationMinutes: 15, ...DEMO_TYPE_DEFAULTS },
    { id: "et_30", title: "30-min meeting", durationMinutes: 30, ...DEMO_TYPE_DEFAULTS },
    { id: "et_60", title: "Deep dive", durationMinutes: 60, ...DEMO_TYPE_DEFAULTS },
  ],
  allowSeries: true,
  maxSeriesCount: 8,
  backgroundId: DEFAULT_BOOKING_BACKGROUND_ID,
};

export function getHostBySlug(slug: string): HostProfile | null {
  if (slug === defaultHostProfile.slug) return defaultHostProfile;
  return null;
}
