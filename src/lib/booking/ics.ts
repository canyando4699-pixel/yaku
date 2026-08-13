import type { Booking, HostProfile } from "@/lib/booking/types";

function icsTime(iso: string) {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n/g, "\\n");
}

export function buildIcs(booking: Booking, host: HostProfile) {
  const durationMin = Math.round(
    (new Date(booking.endsAt).getTime() - new Date(booking.startsAt).getTime()) /
      60_000,
  );
  const summary =
    durationMin > 0 ? `${durationMin}-min meeting` : host.eventTitle;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Yaku//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.id}@yaku`,
    `DTSTAMP:${icsTime(booking.updatedAt ?? booking.createdAt)}`,
    `DTSTART:${icsTime(booking.startsAt)}`,
    `DTEND:${icsTime(booking.endsAt)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(
      `${host.displayName}\nGuest: ${booking.guestName} (${booking.guestEmail})${
        booking.note ? `\n${booking.note}` : ""
      }${(booking.answers ?? [])
        .map(
          (a) =>
            `\n${a.label}: ${Array.isArray(a.value) ? a.value.join(", ") : a.value}`,
        )
        .join("")}`,
    )}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.join("\r\n")}\r\n`;
}

export function downloadIcs(booking: Booking, host: HostProfile) {
  const blob = new Blob([buildIcs(booking, host)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `yaku-${booking.id}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}
