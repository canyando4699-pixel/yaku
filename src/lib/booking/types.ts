export type BookingStatus = "confirmed" | "cancelled";

export const EVENT_TYPE_COLORS = ["blue", "purple", "green", "orange", "red"] as const;
export type EventTypeColor = (typeof EVENT_TYPE_COLORS)[number];
export const EVENT_TYPE_PASTELS: Record<EventTypeColor, { bg: string; border: string }> = {
  blue:   { bg: "#d6ecff", border: "#5ac8fa" },
  purple: { bg: "#e8deff", border: "#bf5af2" },
  green:  { bg: "#d8f5e2", border: "#30d158" },
  orange: { bg: "#ffe8d1", border: "#ff9f0a" },
  red:    { bg: "#ffd9d6", border: "#ff453a" },
};

export type InviteeQuestionType =
  | "text"
  | "textarea"
  | "phone"
  | "radio"
  | "checkbox"
  | "dropdown";

export type InviteeQuestion = {
  id: string;
  type: InviteeQuestionType;
  label: string;
  required: boolean;
  options: string[];
};

export type BookingAnswer = {
  questionId: string;
  label: string;
  value: string | string[];
};

export type EventType = {
  id: string;
  title: string;
  durationMinutes: number;
  description: string;
  color: EventTypeColor;
  secret: boolean;
  dateRangeDays: 0 | 14 | 30 | 60;
  slotIncrementMinutes: 10 | 15 | 30;
  maxBookingsPerDay: number;
  maxBookingsPerWeek: number;
  maxBookingsPerMonth: number;
  cancellationPolicy: string;
  questions: InviteeQuestion[];
};

export type AvatarShape = "round" | "square";

export type Booking = {
  id: string;
  slug: string;
  guestName: string;
  guestEmail: string;
  note: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  status: BookingStatus;
  updatedAt?: string;
  cancelledAt?: string;
  eventTypeId?: string;
  eventTitle?: string;
  guestTimezone?: string;
  seriesId?: string;
  seriesIndex?: number;
  seriesTotal?: number;
  answers: BookingAnswer[];
};

export type HostProfile = {
  slug: string;
  displayName: string;
  /** Empty string = no photo */
  avatarDataUrl: string;
  avatarShape: AvatarShape;
  bio: string;
  eventTitle: string;
  durationMinutes: number;
  timezone: string;
  /** JS Date.getDay(): 0=Sun … 6=Sat */
  weekdays: number[];
  windowStartMinutes: number;
  windowEndMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  /** Hours before a slot can be booked */
  minNoticeHours: number;
  /** 0 = unlimited */
  maxBookingsPerDay: number;
  eventTypes: EventType[];
  allowSeries: boolean;
  maxSeriesCount: number;
  backgroundId: string;
};

export function pastelForEventType(color?: EventTypeColor) {
  return color && EVENT_TYPE_PASTELS[color]
    ? EVENT_TYPE_PASTELS[color]
    : EVENT_TYPE_PASTELS.blue;
}

export function pastelForBooking(booking: Booking, eventTypes: EventType[]) {
  const match = eventTypes.find((et) => et.id === booking.eventTypeId);
  return pastelForEventType(match?.color);
}
