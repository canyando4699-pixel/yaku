"use client";

import { useMemo, useState } from "react";
import { BookingCalendar } from "@/components/BookingCalendar";
import { Icon } from "@/components/ui/Icon";
import { IslandButton, IslandPill } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import { localeDate } from "@/i18n/messages";
import {
  addMinutes,
  getAvailableSlots,
  isBookableDay,
} from "@/lib/booking/slots";
import type { HostProfile } from "@/lib/booking/types";

function nextBookableDay(host: HostProfile, from = new Date()) {
  const day = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = 0; i < 60; i += 1) {
    if (isBookableDay(day, host)) return day;
    day.setDate(day.getDate() + 1);
  }
  return from;
}

type ReschedulePickerProps = {
  host: HostProfile;
  excludeBookingId: string;
  durationMinutes: number;
  initialStartsAt?: string;
  onConfirm: (startsAt: string, endsAt: string) => void;
  onCancel: () => void;
};

export function ReschedulePicker({
  host,
  excludeBookingId,
  durationMinutes,
  initialStartsAt,
  onConfirm,
  onCancel,
}: ReschedulePickerProps) {
  const { locale, t } = useLocale();
  const [selectedDate, setSelectedDate] = useState(() =>
    initialStartsAt ? new Date(initialStartsAt) : nextBookableDay(host),
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    initialStartsAt ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  const slots = useMemo(
    () =>
      getAvailableSlots(host, selectedDate, new Date(), excludeBookingId, {
        durationMinutes,
      }),
    [host, selectedDate, excludeBookingId, durationMinutes],
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
    const endsAt = addMinutes(selectedSlot, durationMinutes);
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
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-white/85">
            <Icon name="calendar" className="h-4 w-4 text-accent" />
            {t.pickDate}
          </p>
          <BookingCalendar
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setSelectedSlot(null);
              setError(null);
            }}
            isDayEnabled={(date) => isBookableDay(date, host)}
            variant="embedded"
          />
        </div>
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-white/85">
            <Icon name="clock" className="h-4 w-4 text-accent" />
            {t.pickTime}
          </p>
          <IslandPill className="mb-4 bg-[#1c1c1e]">
            {dateFormatter.format(selectedDate)}
          </IslandPill>
          {slots.length === 0 ? (
            <p className="text-white/55">{t.noSlots}</p>
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
                      "rounded-full px-3 py-3 text-sm font-medium transition active:scale-[0.98]",
                      active
                        ? "bg-accent text-white shadow-[0_10px_28px_rgba(225,6,0,0.35)]"
                        : "bg-[#1c1c1e] text-white ring-1 ring-white/10 hover:bg-black",
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
            <IslandButton type="button" variant="islandMuted" onClick={onCancel}>
              {t.back}
            </IslandButton>
            <IslandButton
              type="button"
              variant="accent"
              disabled={!selectedSlot}
              onClick={submit}
              className="disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="check" className="h-4 w-4" />
              {t.confirmReschedule}
            </IslandButton>
          </div>
        </div>
      </div>
    </div>
  );
}
