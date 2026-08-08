export type BookingStatus = "confirmed" | "cancelled";

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
};
