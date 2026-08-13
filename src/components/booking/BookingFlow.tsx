"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookingCalendar } from "@/components/BookingCalendar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { OfficeChaseRing } from "@/components/booking/OfficeChaseRing";
import { Icon } from "@/components/ui/Icon";
import { IslandButton, IslandPill, islandClass } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import { localeDate } from "@/i18n/messages";
import { resolveBookingBackgroundSrc } from "@/lib/booking/backgrounds";
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

function StepIndicator({
  active,
  scheduleLabel,
  detailsLabel,
}: {
  active: Step;
  scheduleLabel: string;
  detailsLabel: string;
}) {
  return (
    <nav
      aria-label="steps"
      className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-wide"
    >
      <span
        className={[
          "inline-flex items-center gap-1.5",
          active === "schedule"
            ? "text-[color:var(--office-text)]"
            : "office-muted",
        ].join(" ")}
      >
        <span
          className={[
            "h-1.5 w-1.5 rounded-full",
            active === "schedule"
              ? "bg-[color:var(--dc-blue)]"
              : "bg-white/25",
          ].join(" ")}
        />
        1 {scheduleLabel}
      </span>
      <Icon name="arrowRight" className="h-3 w-3 opacity-40" />
      <span
        className={[
          "inline-flex items-center gap-1.5",
          active === "details"
            ? "text-[color:var(--office-text)]"
            : "office-muted",
        ].join(" ")}
      >
        <span
          className={[
            "h-1.5 w-1.5 rounded-full",
            active === "details"
              ? "bg-[color:var(--dc-blue)]"
              : "bg-white/25",
          ].join(" ")}
        />
        2 {detailsLabel}
      </span>
    </nav>
  );
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

  const hostInitial = host.displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className="office-shell relative flex min-h-full flex-1 flex-col"
      data-theme="dark"
    >
      <Image
        src={resolveBookingBackgroundSrc(host.backgroundId)}
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
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,17,15,0.55)_0%,rgba(18,17,15,0.48)_45%,rgba(18,17,15,0.62)_100%)]"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Link
          href={fromHost ? "/host" : "/"}
          className="font-display text-xl tracking-wide text-[color:var(--office-text)]"
        >
          <span className="office-brand-mark mr-2">約</span>
          Yaku
        </Link>
        <div className="flex items-center gap-2.5">
          {fromHost ? (
            <Link
              href="/host"
              className={`${islandClass("islandMuted", "sm")} office-glass-btn`}
            >
              <Icon name="chevronLeft" className="h-3.5 w-3.5 opacity-70" />
              {t.backToDashboard}
            </Link>
          ) : (
            <IslandPill className="office-liquid-glass hidden sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-[color:var(--dc-blue)]" />
              <span>{t.demoOnly}</span>
            </IslandPill>
          )}
          <LanguageSwitcher className="office-glass-btn" />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full min-w-0 flex-1 flex-col items-center justify-center px-5 py-8 md:px-8">
        <div className="booking-card office-ringed relative w-full max-w-[980px] overflow-hidden rounded-[1.5rem] p-0">
          <OfficeChaseRing />
          <div className="relative z-[1] flex min-h-0 flex-col lg:flex-row">
            <aside className="w-full shrink-0 border-b border-white/10 p-5 lg:w-[240px] lg:shrink-0 lg:border-b-0 lg:border-r lg:border-white/10">
              <p className="office-muted text-[10px] font-medium uppercase tracking-[0.14em]">
                {t.bookingWith}
              </p>
              <div className="mt-3 flex items-center gap-3 lg:flex-col lg:items-start lg:gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden ${host.avatarShape === "square" ? "rounded-[8px]" : "rounded-full"} bg-white/10 text-lg font-medium text-[color:var(--office-text)] ring-1 ring-white/15 lg:h-20 lg:w-20 lg:text-2xl`}>
                  {host.avatarDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={host.avatarDataUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span aria-hidden>{hostInitial}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base text-[color:var(--office-text)] lg:text-lg">
                    {host.displayName}
                  </p>
                  <p className="office-muted mt-1 inline-flex items-center gap-1.5 text-xs">
                    <Icon name="globe" className="h-3 w-3 opacity-70" />
                    {host.timezone}
                  </p>
                </div>
              </div>
              {host.bio ? (
                <p className="office-muted mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed lg:text-sm">
                  {host.bio}
                </p>
              ) : null}
            </aside>

            {step === "schedule" || !selectedSlot ? (
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="border-b border-white/10 px-5 py-4">
                  <StepIndicator
                    active="schedule"
                    scheduleLabel={t.stepSchedule}
                    detailsLabel={t.yourDetails}
                  />
                  <h1 className="font-display text-2xl text-[color:var(--office-text)]">
                    {eventType.title}
                  </h1>
                  <p className="office-muted mt-1 text-xs">
                    {eventType.durationMinutes} min
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
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
                            "booking-slot inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition active:scale-[0.98]",
                            active ? "booking-slot-active" : "",
                          ].join(" ")}
                        >
                          <Icon name="clock" className="h-3.5 w-3.5" />
                          {et.title} · {et.durationMinutes} min
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid flex-1 items-start md:grid-cols-[280px_minmax(0,1fr)]">
                  <div className="min-w-0 px-5 py-4">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[color:var(--office-text)]">
                      <Icon
                        name="calendar"
                        className="h-3.5 w-3.5 text-[color:var(--dc-blue)]"
                      />
                      {t.pickDate}
                    </p>
                    <BookingCalendar
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setSelectedSlot(null);
                      }}
                      isDayEnabled={(date) => isBookableDay(date, activeHost)}
                      variant="embedded"
                    />
                  </div>

                  <div className="min-w-0 px-5 py-4 md:border-l md:border-white/10">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-[color:var(--office-text)]">
                        <Icon
                          name="clock"
                          className="h-3.5 w-3.5 text-[color:var(--dc-blue)]"
                        />
                        {t.pickTime}
                      </p>
                      <label className="office-muted flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span>{t.guestTimezoneLabel}</span>
                        <select
                          value={guestTimezone}
                          onChange={(e) => setGuestTimezone(e.target.value)}
                          className="office-input rounded-full border-0 px-2.5 py-1 text-[11px] outline-none"
                        >
                          {tzOptions.map((tz) => (
                            <option
                              key={tz}
                              value={tz}
                              className="office-option"
                            >
                              {tz}
                              {tz === host.timezone
                                ? ` (${t.hostTimezoneShort})`
                                : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <IslandPill className="office-liquid-glass mb-3 !px-2.5 !py-1 text-xs">
                      {dateFormatter.format(selectedDate)}
                    </IslandPill>
                    {slots.length === 0 ? (
                      <p className="office-muted text-xs">{t.noSlots}</p>
                    ) : (
                      <div className="grid max-h-[min(52dvh,420px)] grid-cols-3 gap-1.5 overflow-y-auto pr-0.5 sm:grid-cols-4">
                        {slots.map((slot) => {
                          const active = slot === selectedSlot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={[
                                "booking-slot rounded-full px-2 py-2 text-xs font-medium transition active:scale-[0.98]",
                                active ? "booking-slot-active" : "",
                              ].join(" ")}
                            >
                              {timeFormatter.format(new Date(slot))}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
                  <p className="min-w-0 text-xs text-[color:var(--office-text)]">
                    {selectedSlot ? (
                      <>
                        {eventType.title} ·{" "}
                        {dateFormatter.format(new Date(selectedSlot))} ·{" "}
                        {timeFormatter.format(new Date(selectedSlot))} ·{" "}
                        {eventType.durationMinutes} min
                      </>
                    ) : (
                      <span className="office-muted">{t.pickTime}</span>
                    )}
                  </p>
                  <button
                    type="button"
                    disabled={!selectedSlot}
                    onClick={() => setStep("details")}
                    className="office-glass-cta !h-9 !w-auto shrink-0 !px-4 !text-xs disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon name="user" className="h-3.5 w-3.5" />
                    {t.yourDetails}
                    <Icon name="arrowRight" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={submitBooking}
                className="flex min-w-0 flex-1 flex-col"
              >
                <div className="border-b border-white/10 px-5 py-4">
                  <StepIndicator
                    active="details"
                    scheduleLabel={t.stepSchedule}
                    detailsLabel={t.yourDetails}
                  />
                  <h2 className="font-display text-2xl text-[color:var(--office-text)]">
                    {t.yourDetails}
                  </h2>
                  <IslandPill className="office-liquid-glass mt-3 !px-2.5 !py-1 text-xs">
                    <Icon name="calendar" className="h-3 w-3 opacity-70" />
                    <span>
                      {eventType.title} ·{" "}
                      {dateFormatter.format(new Date(selectedSlot))} ·{" "}
                      {timeFormatter.format(new Date(selectedSlot))}
                    </span>
                  </IslandPill>
                </div>

                <div className="flex-1 px-5 py-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="office-field block text-xs">
                      <span className="mb-1 inline-flex items-center gap-1.5">
                        <Icon name="user" className="h-3 w-3" />
                        {t.name}
                      </span>
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="office-input mt-1 w-full rounded-full border-0 px-3.5 py-2.5 text-sm outline-none focus:ring-accent"
                      />
                    </label>

                    <label className="office-field block text-xs">
                      <span className="mb-1 inline-flex items-center gap-1.5">
                        <Icon name="mail" className="h-3 w-3" />
                        {t.email}
                      </span>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="office-input mt-1 w-full rounded-full border-0 px-3.5 py-2.5 text-sm outline-none focus:ring-accent"
                      />
                    </label>
                  </div>

                  <label className="office-field mt-3 block text-xs">
                    {t.note}{" "}
                    <span className="office-muted">({t.noteOptional})</span>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="office-input mt-1 w-full resize-none rounded-[1rem] border-0 px-3.5 py-2.5 text-sm outline-none focus:ring-accent"
                    />
                  </label>

                  {host.allowSeries ? (
                    <label className="office-field mt-4 block text-sm">
                      {t.seriesCountLabel}
                      <select
                        value={seriesCount}
                        onChange={(e) =>
                          setSeriesCount(Number(e.target.value))
                        }
                        className="office-input mt-1 w-full rounded-full border-0 px-4 py-3 outline-none focus:ring-accent"
                      >
                        {seriesOptions(host.maxSeriesCount).map((n) => (
                          <option
                            key={n}
                            value={n}
                            className="office-option"
                          >
                            {n === 1
                              ? t.seriesOnce
                              : t.seriesWeekly.replace("{n}", String(n))}
                          </option>
                        ))}
                      </select>
                      <span className="office-muted mt-1 block text-xs">
                        {t.seriesHint}
                      </span>
                    </label>
                  ) : null}

                  {error ? (
                    <p className="mt-3 text-sm text-[#ff453a]">{error}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
                  <IslandButton
                    type="button"
                    variant="island"
                    className="office-glass-btn"
                    onClick={() => setStep("schedule")}
                  >
                    {t.back}
                  </IslandButton>
                  <IslandButton
                    type="submit"
                    variant="island"
                    className="office-glass-btn"
                  >
                    <Icon name="check" className="h-4 w-4" />
                    {t.confirmBooking}
                  </IslandButton>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
