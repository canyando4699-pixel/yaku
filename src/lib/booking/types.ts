export type BookingStatus = "confirmed" | "cancelled";

export type EventType = {
  id: string;
  title: string;
  durationMinutes: number;
};

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
};

export type HostProfile = {
  slug: string;
  displayName: string;
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
};
