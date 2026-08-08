"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ReschedulePicker } from "@/components/booking/ReschedulePicker";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Icon } from "@/components/ui/Icon";
import { IslandButton, IslandPill, islandClass } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import { localeDate } from "@/i18n/messages";
import { downloadIcs } from "@/lib/booking/ics";
import { loadHostProfile } from "@/lib/booking/hostProfile";
import {
  cancelBooking,
  getBooking,
  rescheduleBooking,
} from "@/lib/booking/storage";
import type { Booking, HostProfile } from "@/lib/booking/types";

type Mode = "view" | "reschedule";

export function ManageBooking({
  host: initialHost,
  bookingId,
  fromHost = false,
}: {
  host: HostProfile;
  bookingId: string;
  fromHost?: boolean;
}) {
  const { locale, t } = useLocale();
  const [host, setHost] = useState(initialHost);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<Mode>("view");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHost(loadHostProfile(initialHost.slug));
    setBooking(getBooking(bookingId));
    setLoaded(true);
  }, [bookingId, initialHost.slug]);

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

  function handleCancel() {
    const next = cancelBooking(bookingId);
    if (!next) {
      setError(t.bookingMissing);
      return;
    }
    setBooking(next);
    setConfirmCancel(false);
    setMessage(t.cancelledBody);
    setError(null);
  }

  function handleReschedule(startsAt: string, endsAt: string) {
    const next = rescheduleBooking(bookingId, startsAt, endsAt);
    if (!next) {
      setError(t.slotTaken);
      return;
    }
    setBooking(next);
    setMode("view");
    setMessage(t.rescheduledBody);
    setError(null);
  }

  if (!loaded) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center px-6">
        <p className="text-muted">…</p>
      </div>
    );
  }

  if (!booking || booking.slug !== host.slug) {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        <header className="flex items-center justify-between px-6 py-5 md:px-10">
          <Link href="/" className="font-display text-xl tracking-wide text-ink">
            <span className="mr-2 text-accent">約</span>
            Yaku
          </Link>
          <LanguageSwitcher />
        </header>
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
          <p className="text-muted">{t.bookingMissing}</p>
          <Link href={`/b/${host.slug}`} className={`${islandClass("accent", "md")} mt-6`}>
            {t.bookAnother}
          </Link>
        </main>
      </div>
    );
  }

  const cancelled = booking.status === "cancelled";

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Link
          href={fromHost ? "/host" : "/"}
          className="font-display text-xl tracking-wide text-ink"
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

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 pb-16 md:px-10">
        <div className="mb-8 text-center">
          <IslandPill className="mb-4">
            <Icon name="user" className="h-3.5 w-3.5 text-white/70" />
            <span>
              {t.bookingWith} {host.displayName}
            </span>
          </IslandPill>
          <h1 className="font-display text-3xl text-ink md:text-4xl">
            {cancelled ? t.cancelledTitle : t.manageTitle}
          </h1>
          <p className="mt-2 text-muted">
            {booking.eventTitle || host.eventTitle}
          </p>
          {booking.seriesTotal && booking.seriesIndex ? (
            <p className="mt-1 text-sm text-muted">
              {booking.seriesIndex}/{booking.seriesTotal}
            </p>
          ) : null}
        </div>

        <div className="mx-auto w-full max-w-xl rounded-[2rem] bg-[#111111] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.25)] md:p-7">
          {message ? (
            <p className="mb-4 rounded-full bg-[#1f8f4e]/20 px-4 py-2 text-sm text-[#7ddea8]">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="mb-4 text-sm text-[#ff453a]">{error}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <IslandPill className="bg-[#1c1c1e]">
              <Icon name="calendar" className="h-3.5 w-3.5 text-white/70" />
              <span>
                {dateFormatter.format(new Date(booking.startsAt))} ·{" "}
                {timeFormatter.format(new Date(booking.startsAt))} –{" "}
                {timeFormatter.format(new Date(booking.endsAt))}
              </span>
            </IslandPill>
            <IslandPill
              className={
                cancelled ? "bg-[#3a1c1c] text-[#ff8a80]" : "bg-[#1c3a28]"
              }
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              <span>{cancelled ? t.statusCancelled : t.statusConfirmed}</span>
            </IslandPill>
          </div>

          <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/80">
            <Icon name="user" className="h-3.5 w-3.5 text-white/55" />
            {booking.guestName}
          </p>
          <p className="mt-1 inline-flex items-center gap-2 text-sm text-white/55">
            <Icon name="mail" className="h-3.5 w-3.5" />
            {booking.guestEmail}
          </p>
          {booking.note ? (
            <p className="mt-3 text-sm text-white/75">{booking.note}</p>
          ) : null}

          {mode === "reschedule" && !cancelled ? (
            <div className="mt-8 border-t border-white/10 pt-6">
              <h2 className="mb-4 font-display text-xl text-white">
                {t.rescheduleTitle}
              </h2>
              <ReschedulePicker
                host={host}
                excludeBookingId={booking.id}
                initialStartsAt={booking.startsAt}
                onConfirm={handleReschedule}
                onCancel={() => setMode("view")}
              />
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-3">
              {!cancelled ? (
                <>
                  <IslandButton
                    type="button"
                    variant="accent"
                    size="lg"
                    onClick={() => downloadIcs(booking, host)}
                  >
                    <Icon name="download" className="h-4 w-4" />
                    {t.downloadIcs}
                  </IslandButton>
                  <IslandButton
                    type="button"
                    variant="islandMuted"
                    onClick={() => {
                      setMode("reschedule");
                      setConfirmCancel(false);
                      setMessage(null);
                      setError(null);
                    }}
                  >
                    <Icon name="calendar" className="h-4 w-4" />
                    {t.reschedule}
                  </IslandButton>
                  {confirmCancel ? (
                    <div className="rounded-[1.5rem] bg-[#2a1515] p-4 ring-1 ring-[#ff453a]/35">
                      <p className="text-sm text-white/80">{t.cancelConfirm}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <IslandButton
                          type="button"
                          variant="accent"
                          onClick={handleCancel}
                        >
                          {t.cancelBooking}
                        </IslandButton>
                        <IslandButton
                          type="button"
                          variant="islandMuted"
                          onClick={() => setConfirmCancel(false)}
                        >
                          {t.back}
                        </IslandButton>
                      </div>
                    </div>
                  ) : (
                    <IslandButton
                      type="button"
                      variant="islandMuted"
                      onClick={() => {
                        setConfirmCancel(true);
                        setMessage(null);
                      }}
                    >
                      <Icon name="x" className="h-4 w-4" />
                      {t.cancelBooking}
                    </IslandButton>
                  )}
                </>
              ) : (
                <Link
                  href={`/b/${host.slug}${fromHost ? "?from=host" : ""}`}
                  className={islandClass("accent", "lg")}
                >
                  {t.bookAnother}
                </Link>
              )}
              {!cancelled ? (
                <Link
                  href={`/b/${host.slug}${fromHost ? "?from=host" : ""}`}
                  className={islandClass("soft", "md", "text-ink")}
                >
                  {t.bookAnother}
                </Link>
              ) : null}
              <Link href="/host" className={islandClass(fromHost ? "accent" : "soft", "md", fromHost ? "" : "text-ink")}>
                <Icon name="list" className="h-4 w-4" />
                {fromHost ? t.backToDashboard : t.viewBookings}
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
