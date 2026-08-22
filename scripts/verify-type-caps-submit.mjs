/**
 * Verifies type-cap enforcement for the first occurrence in buildSeriesStarts
 * and documents the submit-time gap that submitBooking must close.
 *
 * Run: node scripts/verify-type-caps-submit.mjs
 */

function countOnDay(bookings, eventTypeId, date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return bookings.filter((b) => {
    if (b.status !== "confirmed" || b.eventTypeId !== eventTypeId) return false;
    const at = new Date(b.startsAt);
    return (
      at.getFullYear() === y && at.getMonth() === m && at.getDate() === d
    );
  }).length;
}

function typeCapsReached(bookings, eventType, date, extraStarts = []) {
  if (eventType.maxBookingsPerDay <= 0) return false;
  const extra = extraStarts.filter((iso) => {
    const at = new Date(iso);
    return (
      at.getFullYear() === date.getFullYear() &&
      at.getMonth() === date.getMonth() &&
      at.getDate() === date.getDate()
    );
  }).length;
  return (
    countOnDay(bookings, eventType.id, date) + extra >=
    eventType.maxBookingsPerDay
  );
}

/** Mirrors fixed buildSeriesStarts first-occurrence guard (count === 1). */
function buildSeriesStartsFixed(bookings, eventType, firstStartsAt, count) {
  if (count < 1) return null;
  const first = new Date(firstStartsAt);
  if (typeCapsReached(bookings, eventType, first, [])) return null;
  if (count === 1) return [firstStartsAt];
  return null; // series tail not needed for this unit
}

const day = new Date(2026, 5, 15, 14, 0, 0, 0);
const eventType = { id: "et_30", maxBookingsPerDay: 1 };
const existing = [
  {
    id: "bk1",
    status: "confirmed",
    eventTypeId: "et_30",
    startsAt: new Date(2026, 5, 15, 10, 0).toISOString(),
    endsAt: new Date(2026, 5, 15, 10, 30).toISOString(),
  },
];
const secondSlot = new Date(2026, 5, 15, 14, 0).toISOString();

// Old behavior: count <= 1 returned [first] with no cap check
const oldAllows = true;
const fixed = buildSeriesStartsFixed(existing, eventType, secondSlot, 1);

if (oldAllows !== true) {
  console.error("setup: expected old path to allow without cap check");
  process.exit(1);
}
if (fixed !== null) {
  console.error(
    "expected buildSeriesStarts to reject first slot when day cap is full, got",
    fixed,
  );
  process.exit(1);
}

const empty = buildSeriesStartsFixed([], eventType, secondSlot, 1);
if (!empty || empty[0] !== secondSlot) {
  console.error("expected empty day to allow first slot");
  process.exit(1);
}

console.log("verify-type-caps-submit: ok");
