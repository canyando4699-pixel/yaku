import assert from "node:assert/strict";

function bookingDurationMinutes(booking, host) {
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

function preservedEndsAt(current, startsAt, endsAt) {
  const durationMs =
    new Date(current.endsAt).getTime() - new Date(current.startsAt).getTime();
  return durationMs > 0
    ? new Date(new Date(startsAt).getTime() + durationMs).toISOString()
    : endsAt;
}

const host = {
  durationMinutes: 30,
  eventTypes: [
    { id: "et_15", durationMinutes: 15 },
    { id: "et_60", durationMinutes: 60 },
  ],
};

const deepDive = {
  startsAt: "2026-08-12T08:00:00.000Z",
  endsAt: "2026-08-12T09:00:00.000Z",
  eventTypeId: "et_60",
};

assert.equal(bookingDurationMinutes(deepDive, host), 60);

assert.equal(
  bookingDurationMinutes(
    { startsAt: deepDive.startsAt, endsAt: deepDive.startsAt, eventTypeId: "et_60" },
    host,
  ),
  60,
);

assert.equal(
  bookingDurationMinutes(
    { startsAt: deepDive.startsAt, endsAt: deepDive.startsAt },
    host,
  ),
  30,
);

const wrongCallerEndsAt = "2026-08-19T08:30:00.000Z"; // 30 min — host default trap
const nextStartsAt = "2026-08-19T08:00:00.000Z";
assert.equal(
  preservedEndsAt(deepDive, nextStartsAt, wrongCallerEndsAt),
  "2026-08-19T09:00:00.000Z",
);

console.log("verify-booking-duration: ok");
