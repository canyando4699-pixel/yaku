"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookingCalendar } from "@/components/BookingCalendar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Icon } from "@/components/ui/Icon";
import { IslandButton, IslandPill, islandClass } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import { localeDate } from "@/i18n/messages";
import { downloadIcs } from "@/lib/booking/ics";
import {
  addMinutes,
  getAvailableSlots,
  isBookableDay,
} from "@/lib/booking/slots";
import {
  createBookingId,
  isSlotTaken,
  saveBooking,
} from "@/lib/booking/storage";
import type { Booking, HostProfile } from "@/lib/booking/types";

type Step = "schedule" | "details" | "done";

function nextBookableDay(from = new Date()) {
  const day = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = 0; i < 60; i += 1) {
    if (isBookableDay(day)) return day;
    day.setDate(day.getDate() + 1);
  }
  return from;
}

export function BookingFlow({ host }: { host: HostProfile }) {
  const { locale, t } = useLocale();
  const [step, setStep] = useState<Step>("schedule");
  const [selectedDate, setSelectedDate] = useState(() => nextBookableDay());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  const slots = useMemo(
    () => getAvailableSlots(host, selectedDate),
    [host, selectedDate],
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

  function resetFlow() {
    setStep("schedule");
    setSelectedDate(nextBookableDay());
    setSelectedSlot(null);
    setName("");
    setEmail("");
    setNote("");
    setBooking(null);
    setError(null);
  }

  function submitBooking(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedSlot) return;
    if (isSlotTaken(host.slug, selectedSlot)) {
      setError(t.noSlots);
      setStep("schedule");
      setSelectedSlot(null);
      return;
    }

    const next: Booking = {
      id: createBookingId(),
      slug: host.slug,
      guestName: name.trim(),
      guestEmail: email.trim(),
      note: note.trim(),
      startsAt: selectedSlot,
      endsAt: addMinutes(selectedSlot, host.durationMinutes),
      createdAt: new Date().toISOString(),
    };

    saveBooking(next);
    setBooking(next);
    setStep("done");
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="font-display text-xl tracking-wide text-ink">
          <span className="mr-2 text-accent">約</span>
          Yaku
        </Link>
        <div className="flex items-center gap-2.5">
          <IslandPill className="hidden sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-[#ff9f0a]" />
            <span>{t.demoOnly}</span>
          </IslandPill>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pb-16 md:px-10">
        <div className="mb-8 text-center">
          <IslandPill className="mb-4">
            <Icon name="user" className="h-3.5 w-3.5 text-white/70" />
            <span>
              {t.bookingWith} {host.displayName}
            </span>
          </IslandPill>
          <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">
            {host.eventTitle}
          </h1>
          <p className="mt-3 inline-flex items-center gap-2 text-muted">
            <Icon name="clock" className="h-4 w-4" />
            {host.durationMinutes} min
          </p>
        </div>

        {step === "schedule" ? (
          <div className="grid items-start gap-10 md:grid-cols-[360px_1fr]">
            <div className="mx-auto w-full max-w-[360px]">
              <p className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-ink md:justify-start">
                <Icon name="calendar" className="h-4 w-4 text-accent" />
                {t.pickDate}
              </p>
              <BookingCalendar
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                }}
                isDayEnabled={isBookableDay}
              />
            </div>

            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
                <Icon name="clock" className="h-4 w-4 text-accent" />
                {t.pickTime}
              </p>
              <IslandPill className="mb-4 bg-[#1c1c1e]">
                {dateFormatter.format(selectedDate)}
              </IslandPill>
              {slots.length === 0 ? (
                <p className="text-muted">{t.noSlots}</p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {slots.map((slot) => {
                    const active = slot === selectedSlot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={[
                          "rounded-full px-3 py-3 text-sm font-medium transition active:scale-[0.98]",
                          active
                            ? "bg-accent text-white shadow-[0_10px_28px_rgba(225,6,0,0.35)]"
                            : "bg-[#111111] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:bg-black",
                        ].join(" ")}
                      >
                        {timeFormatter.format(new Date(slot))}
                      </button>
                    );
                  })}
                </div>
              )}

              <IslandButton
                type="button"
                variant="accent"
                size="lg"
                disabled={!selectedSlot}
                onClick={() => setStep("details")}
                className="mt-8 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="user" className="h-4 w-4" />
                {t.yourDetails}
                <Icon name="arrowRight" className="h-4 w-4" />
              </IslandButton>
            </div>
          </div>
        ) : null}

        {step === "details" && selectedSlot ? (
          <form
            onSubmit={submitBooking}
            className="mx-auto w-full max-w-md rounded-[2rem] bg-[#111111] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
          >
            <IslandPill className="bg-[#1c1c1e]">
              <Icon name="calendar" className="h-3.5 w-3.5 text-white/70" />
              <span>
                {dateFormatter.format(new Date(selectedSlot))} ·{" "}
                {timeFormatter.format(new Date(selectedSlot))}
              </span>
            </IslandPill>
            <h2 className="mt-4 font-display text-2xl text-white">
              {t.yourDetails}
            </h2>

            <label className="mt-6 block text-sm text-white/80">
              <span className="mb-1 inline-flex items-center gap-2">
                <Icon name="user" className="h-3.5 w-3.5" />
                {t.name}
              </span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-full border-0 bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/10 placeholder:text-white/35 focus:ring-accent"
              />
            </label>

            <label className="mt-4 block text-sm text-white/80">
              <span className="mb-1 inline-flex items-center gap-2">
                <Icon name="mail" className="h-3.5 w-3.5" />
                {t.email}
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-full border-0 bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/10 placeholder:text-white/35 focus:ring-accent"
              />
            </label>

            <label className="mt-4 block text-sm text-white/80">
              {t.note}{" "}
              <span className="text-white/40">({t.noteOptional})</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-1 w-full resize-none rounded-[1.25rem] border-0 bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/10 placeholder:text-white/35 focus:ring-accent"
              />
            </label>

            {error ? <p className="mt-3 text-sm text-[#ff453a]">{error}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <IslandButton
                type="button"
                variant="islandMuted"
                onClick={() => setStep("schedule")}
              >
                {t.back}
              </IslandButton>
              <IslandButton type="submit" variant="accent">
                <Icon name="check" className="h-4 w-4" />
                {t.confirmBooking}
              </IslandButton>
            </div>
          </form>
        ) : null}

        {step === "done" && booking ? (
          <div className="mx-auto w-full max-w-md rounded-[2rem] bg-[#111111] p-7 text-center text-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1f8f4e] shadow-[0_0_24px_rgba(31,143,78,0.45)]">
              <Icon name="check" className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-3xl text-white">
              {t.bookedTitle}
            </h2>
            <p className="mt-3 text-white/65">{t.bookedBody}</p>
            <IslandPill className="mt-6 bg-[#1c1c1e]">
              <Icon name="calendar" className="h-3.5 w-3.5 text-white/70" />
              <span>
                {dateFormatter.format(new Date(booking.startsAt))} ·{" "}
                {timeFormatter.format(new Date(booking.startsAt))} –{" "}
                {timeFormatter.format(new Date(booking.endsAt))}
              </span>
            </IslandPill>
            <div className="mt-8 flex flex-col gap-3">
              <IslandButton
                type="button"
                variant="accent"
                size="lg"
                onClick={() => downloadIcs(booking, host)}
              >
                <Icon name="download" className="h-4 w-4" />
                {t.downloadIcs}
              </IslandButton>
              <IslandButton type="button" variant="islandMuted" onClick={resetFlow}>
                {t.bookAnother}
              </IslandButton>
              <Link
                href="/host"
                className={islandClass("soft", "md", "text-ink")}
              >
                <Icon name="list" className="h-4 w-4" />
                {t.viewBookings}
              </Link>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
