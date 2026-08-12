import assert from "node:assert/strict";

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/** Mirrors fixed isRangeTaken buffer expansion (proposed + existing). */
function conflicts(existing, startsAt, endsAt, bufferBefore, bufferAfter) {
  const start = new Date(startsAt).getTime() - bufferBefore * 60_000;
  const end = new Date(endsAt).getTime() + bufferAfter * 60_000;
  return existing.some((b) => {
    const bStart = new Date(b.startsAt).getTime() - bufferBefore * 60_000;
    const bEnd = new Date(b.endsAt).getTime() + bufferAfter * 60_000;
    return rangesOverlap(start, end, bStart, bEnd);
  });
}

/** Old behavior: only the proposed range was expanded. */
function conflictsOld(existing, startsAt, endsAt, bufferBefore, bufferAfter) {
  const start = new Date(startsAt).getTime() - bufferBefore * 60_000;
  const end = new Date(endsAt).getTime() + bufferAfter * 60_000;
  return existing.some((b) => {
    const bStart = new Date(b.startsAt).getTime();
    const bEnd = new Date(b.endsAt).getTime();
    return rangesOverlap(start, end, bStart, bEnd);
  });
}

// Demo defaults: bufferBefore=0, bufferAfter=10. Existing 10:00–10:30.
const existing = [
  {
    startsAt: "2026-08-13T08:00:00.000Z",
    endsAt: "2026-08-13T08:30:00.000Z",
  },
];

const backToBack = {
  startsAt: "2026-08-13T08:30:00.000Z",
  endsAt: "2026-08-13T08:45:00.000Z",
};
const fiveMinAfter = {
  startsAt: "2026-08-13T08:35:00.000Z",
  endsAt: "2026-08-13T08:50:00.000Z",
};
const tenMinAfter = {
  startsAt: "2026-08-13T08:40:00.000Z",
  endsAt: "2026-08-13T08:55:00.000Z",
};

assert.equal(
  conflictsOld(existing, backToBack.startsAt, backToBack.endsAt, 0, 10),
  false,
  "old logic allowed back-to-back despite bufferAfter=10",
);
assert.equal(
  conflicts(existing, backToBack.startsAt, backToBack.endsAt, 0, 10),
  true,
  "fixed logic blocks back-to-back when bufferAfter=10",
);
assert.equal(
  conflicts(existing, fiveMinAfter.startsAt, fiveMinAfter.endsAt, 0, 10),
  true,
  "fixed logic blocks a start inside the trailing buffer",
);
assert.equal(
  conflicts(existing, tenMinAfter.startsAt, tenMinAfter.endsAt, 0, 10),
  false,
  "exactly bufferAfter minutes later remains bookable",
);

// bufferBefore=10 should still block finishing inside the lead-in gap.
const tooCloseBefore = {
  startsAt: "2026-08-13T07:30:00.000Z",
  endsAt: "2026-08-13T07:55:00.000Z",
};
const exactBefore = {
  startsAt: "2026-08-13T07:20:00.000Z",
  endsAt: "2026-08-13T07:50:00.000Z",
};
assert.equal(
  conflicts(existing, tooCloseBefore.startsAt, tooCloseBefore.endsAt, 10, 0),
  true,
);
assert.equal(
  conflicts(existing, exactBefore.startsAt, exactBefore.endsAt, 10, 0),
  false,
);

console.log("verify-booking-buffers: ok");
