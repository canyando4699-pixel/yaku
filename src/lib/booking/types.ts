export type Booking = {
  id: string;
  slug: string;
  guestName: string;
  guestEmail: string;
  note: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
};

export type HostProfile = {
  slug: string;
  displayName: string;
  eventTitle: string;
  durationMinutes: number;
  timezone: string;
};
