"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookingCalendar } from "@/components/BookingCalendar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Icon } from "@/components/ui/Icon";
import { IslandButton, IslandPill, islandClass } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import { localeDate } from "@/i18n/messages";
import { loadHostProfile } from "@/lib/booking/hostProfile";
import {
  addMinutes,
  buildSeriesStarts,
  COMMON_TIMEZONES,
  detectGuestTimezone,
  getAvailableSlots,
  isBookableDay,
} from "@/lib/booking/slots";
import {
  createBookingId,
  createSeriesId,
  isRangeTaken,
  saveBooking,
} from "@/lib/booking/storage";
import type { Booking, EventType, HostProfile } from "@/lib/booking/types";

type Step = "schedule" | "details";

function nextBookableDay(host: HostProfile, from = new Date()) {
  const day = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = 0; i < 60; i += 1) {
    if (isBookableDay(day, host)) return day;
    day.setDate(day.getDate() + 1);
  }
  return from;
}

function seriesOptions(max: number) {
  const opts = [1];
  for (const n of [2, 4, 6, 8, 12]) {
    if (n <= max) opts.push(n);
  }
  return opts;
}

export function BookingFlow({
  host: initialHost,
  fromHost = false,
}: {
  host: HostProfile;
  fromHost?: boolean;
}) {
  const router = useRouter();
  const { locale, t } = useLocale();
  const [host, setHost] = useState(initialHost);
  const [eventType, setEventType] = useState<EventType>(
    () => initialHost.eventTypes[0],
  );
  const [step, setStep] = useState<Step>("schedule");
  const [selectedDate, setSelectedDate] = useState(() =>
    nextBookableDay(initialHost),
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [seriesCount, setSeriesCount] = useState(1);
  const [guestTimezone, setGuestTimezone] = useState("UTC");
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const loaded = loadHostProfile(initialHost.slug);
    setHost(loaded);
    const nextType = loaded.eventTypes[0];
    setEventType(nextType);
    setSelectedDate(nextBookableDay(loaded));
    setSelectedSlot(null);
    setSeriesCount(1);
    const detected = detectGuestTimezone();
    setGuestTimezone(detected);
  }, [initialHost.slug]);

  const activeHost = useMemo(
    () => ({ ...host, durationMinutes: eventType.durationMinutes }),
    [host, eventType],
  );

  const slots = useMemo(() => {
    if (!hydrated) {
      const dayStart = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      );
      return getAvailableSlots(activeHost, selectedDate, dayStart, undefined, {
        skipTakenCheck: true,
        durationMinutes: eventType.durationMinutes,
      });
    }
    return getAvailableSlots(
      activeHost,
      selectedDate,
      new Date(),
      undefined,
      { durationMinutes: eventType.durationMinutes },
    );
  }, [activeHost, selectedDate, hydrated, eventType.durationMinutes]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: guestTimezone,
      }),
    [locale, guestTimezone],
  );

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: guestTimezone,
      }),
    [locale, guestTimezone],
  );

  function submitBooking(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedSlot) return;

    const endsAt = addMinutes(selectedSlot, eventType.durationMinutes);
    if (
      isRangeTaken(
        host.slug,
        selectedSlot,
        endsAt,
        undefined,
        host.bufferBeforeMinutes,
        host.bufferAfterMinutes,
      )
    ) {
      setError(t.slotTaken);
      setStep("schedule");
      setSelectedSlot(null);
      return;
    }

    const count =
      host.allowSeries && seriesCount > 1
        ? Math.min(seriesCount, host.maxSeriesCount)
        : 1;

    const starts = buildSeriesStarts(
      activeHost,
      selectedSlot,
      count,
      eventType.durationMinutes,
    );

    if (!starts) {
      setError(t.seriesUnavailable);
      return;
    }

    const seriesId = count > 1 ? createSeriesId() : undefined;
    let firstId = "";

    starts.forEach((start, index) => {
      const next: Booking = {
        id: createBookingId(),
        slug: host.slug,
        guestName: name.trim(),
        guestEmail: email.trim(),
        note: note.trim(),
        startsAt: start,
        endsAt: addMinutes(start, eventType.durationMinutes),
        createdAt: new Date().toISOString(),
        status: "confirmed",
        eventTypeId: eventType.id,
        eventTitle: eventType.title,
        guestTimezone,
        seriesId,
        seriesIndex: count > 1 ? index + 1 : undefined,
        seriesTotal: count > 1 ? count : undefined,
      };
      saveBooking(next);
      if (index === 0) firstId = next.id;
    });

    router.push(
      `/b/${host.slug}/m/${firstId}${fromHost ? "?from=host" : ""}`,
    );
  }

  const tzOptions = useMemo(() => {
    const list = [guestTimezone, host.timezone, ...COMMON_TIMEZONES];
    return list.filter((tz, i, arr) => arr.indexOf(tz) === i);
  }, [guestTimezone, host.timezone]);

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-[#0a0a0a]">
      <Image
        src="/images/sensoji-night.jpg"
        alt=""
        fill
        priority
        quality={75}
        sizes="100vw"
        className="pointer-events-none object-cover object-center"
        aria-hidden
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.4)_0%,rgba(8,8,10,0.22)_40%,rgba(8,8,10,0.55)_100%)]"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Link
          href={fromHost ? "/host" : "/"}
          className="font-display text-xl tracking-wide text-white"
        >
          <span className="mr-2 text-accent">約</span>
          Yaku
        </Link>
        <div className="flex items-center gap-2.5">
          {fromHost ? (
            <Link href="/host" className={islandClass("islandMuted", "sm")}>
              <Icon name="chevronLeft" className="h-3.5 w-3.5 text-white/70" />
              {t.backToDashboard}
            </Link>
          ) : (
            <IslandPill className="hidden sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-[#ff9f0a]" />
              <span>{t.demoOnly}</span>
            </IslandPill>
          )}
          <LanguageSwitcher />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pb-16 md:px-10">
        <div className="mb-8 text-center">
          <IslandPill className="mb-4">
            <Icon name="user" className="h-3.5 w-3.5 text-white/70" />
            <span>
              {t.bookingWith} {host.displayName}
            </span>
          </IslandPill>
          <h1 className="mt-2 font-display text-3xl text-white md:text-4xl">
            {eventType.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {host.eventTypes.map((et) => {
              const active = et.id === eventType.id;
              return (
                <button
                  key={et.id}
                  type="button"
                  onClick={() => {
                    setEventType(et);
                    setSelectedSlot(null);
                    setError(null);
                  }}
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition active:scale-[0.98]",
                    active
                      ? "bg-accent text-white shadow-[0_10px_28px_rgba(225,6,0,0.35)]"
                      : "bg-[#111111] text-white/85 shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:bg-black",
                  ].join(" ")}
                >
                  <Icon name="clock" className="h-4 w-4" />
                  {et.title} · {et.durationMinutes} min
                </button>
              );
            })}
          </div>

          <label className="mt-5 inline-flex flex-col items-center gap-1 text-sm text-white/70">
            <span>{t.guestTimezoneLabel}</span>
            <select
              value={guestTimezone}
              onChange={(e) => setGuestTimezone(e.target.value)}
              className="rounded-full border-0 bg-[#111111] px-4 py-2 text-white outline-none ring-1 ring-white/15"
            >
              {tzOptions.map((tz) => (
                <option key={tz} value={tz} className="bg-[#111111]">
                  {tz}
                  {tz === host.timezone ? ` (${t.hostTimezoneShort})` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        {step === "schedule" ? (
          <div className="grid items-start gap-10 md:grid-cols-[360px_1fr]">
            <div className="mx-auto w-full max-w-[360px]">
              <p className="mb-3 flex items-center justify-start gap-2 pl-8 text-sm font-medium text-white">
                <Icon name="calendar" className="h-4 w-4 text-accent" />
                {t.pickDate}
              </p>
              <BookingCalendar
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                }}
                isDayEnabled={(date) => isBookableDay(date, activeHost)}
              />
            </div>

            <div>
              <p className="mb-3 flex items-center justify-start gap-2 pl-5 text-sm font-medium text-white">
                <Icon name="clock" className="h-4 w-4 text-accent" />
                {t.pickTime}
              </p>
              <IslandPill className="mb-4 bg-[#1c1c1e]">
                {dateFormatter.format(selectedDate)}
              </IslandPill>
              {slots.length === 0 ? (
                <p className="text-white/65">{t.noSlots}</p>
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

            {host.allowSeries ? (
              <label className="mt-4 block text-sm text-white/80">
                {t.seriesCountLabel}
                <select
                  value={seriesCount}
                  onChange={(e) => setSeriesCount(Number(e.target.value))}
                  className="mt-1 w-full rounded-full border-0 bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-accent"
                >
                  {seriesOptions(host.maxSeriesCount).map((n) => (
                    <option key={n} value={n} className="bg-[#111111]">
                      {n === 1 ? t.seriesOnce : t.seriesWeekly.replace("{n}", String(n))}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-white/45">
                  {t.seriesHint}
                </span>
              </label>
            ) : null}

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
      </main>
    </div>
  );
}
