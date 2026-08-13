"use client";

import { useMemo, useState } from "react";
import { BookingCalendar } from "@/components/BookingCalendar";
import { Icon } from "@/components/ui/Icon";
import { useLocale } from "@/i18n/LocaleProvider";
import { localeDate } from "@/i18n/messages";
import {
  addMinutes,
  getAvailableSlots,
  isBookableDay,
} from "@/lib/booking/slots";
import type { EventType, HostProfile } from "@/lib/booking/types";

function nextBookableDay(
  host: HostProfile,
  eventType?: EventType,
  from = new Date(),
) {
  const day = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const limit =
    eventType && eventType.dateRangeDays > 0
      ? eventType.dateRangeDays + 1
      : 60;
  for (let i = 0; i < limit; i += 1) {
    if (isBookableDay(day, host, new Date(), eventType)) return day;
    day.setDate(day.getDate() + 1);
  }
  return from;
}

type ReschedulePickerProps = {
  host: HostProfile;
  eventType: EventType;
  relaxHorizon?: boolean;
  excludeBookingId: string;
  initialStartsAt?: string;
  onConfirm: (startsAt: string, endsAt: string) => void;
  onCancel: () => void;
};

export function ReschedulePicker({
  host,
  eventType,
  relaxHorizon = false,
  excludeBookingId,
  initialStartsAt,
  onConfirm,
  onCancel,
}: ReschedulePickerProps) {
  const eventTypeForHorizon = useMemo(
    () =>
      relaxHorizon ? { ...eventType, dateRangeDays: 0 as const } : eventType,
    [relaxHorizon, eventType],
  );
  const { locale, t } = useLocale();
  const [selectedDate, setSelectedDate] = useState(() =>
    initialStartsAt
      ? new Date(initialStartsAt)
      : nextBookableDay(host, eventTypeForHorizon),
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    initialStartsAt ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  const slots = useMemo(
    () =>
      getAvailableSlots(host, selectedDate, new Date(), excludeBookingId, {
        durationMinutes: eventType.durationMinutes,
        eventType: eventTypeForHorizon,
      }),
    [host, selectedDate, excludeBookingId, eventType, eventTypeForHorizon],
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [locale],
  );

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  );

  function submit() {
    if (!selectedSlot) return;
    const endsAt = addMinutes(selectedSlot, eventType.durationMinutes);
    try {
      onConfirm(selectedSlot, endsAt);
    } catch {
      setError(t.slotTaken);
    }
  }

  return (
    <div className="w-full">
      <div className="grid items-start gap-8 md:grid-cols-[320px_1fr]">
        <div>
          <p className="office-muted mb-3 flex items-center gap-2 text-sm font-medium">
            <Icon name="calendar" className="h-4 w-4 text-[color:var(--dc-blue)]" />
            {t.pickDate}
          </p>
          <BookingCalendar
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setSelectedSlot(null);
              setError(null);
            }}
            isDayEnabled={(date) =>
              isBookableDay(date, host, new Date(), eventTypeForHorizon)
            }
            variant="embedded"
          />
        </div>
        <div>
          <p className="office-muted mb-3 flex items-center gap-2 text-sm font-medium">
            <Icon name="clock" className="h-4 w-4 text-[color:var(--dc-blue)]" />
            {t.pickTime}
          </p>
          <div className="office-dc-count mb-4">
            {dateFormatter.format(selectedDate)}
          </div>
          {slots.length === 0 ? (
            <p className="office-muted">{t.noSlots}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {slots.map((slot) => {
                const active = slot === selectedSlot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setSelectedSlot(slot);
                      setError(null);
                    }}
                    className={[
                      "rounded-[8px] px-3 py-3 text-sm font-medium transition active:scale-[0.98]",
                      active ? "office-dc-slot-active" : "office-dc-btn-dark",
                    ].join(" ")}
                  >
                    {timeFormatter.format(new Date(slot))}
                  </button>
                );
              })}
            </div>
          )}
          {error ? <p className="mt-3 text-sm text-[#ff453a]">{error}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="office-dc-btn-dark" onClick={onCancel}>
              {t.back}
            </button>
            <button
              type="button"
              disabled={!selectedSlot}
              onClick={submit}
              className="office-dc-btn-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="check" className="h-4 w-4" />
              {t.confirmReschedule}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
