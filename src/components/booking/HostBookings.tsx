"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HostAvailability } from "@/components/booking/HostAvailability";
import { ReschedulePicker } from "@/components/booking/ReschedulePicker";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Icon } from "@/components/ui/Icon";
import { IslandButton, IslandPill, islandClass } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import { localeDate } from "@/i18n/messages";
import { defaultHostProfile } from "@/lib/booking/demo";
import { loadHostProfile } from "@/lib/booking/hostProfile";
import { downloadIcs } from "@/lib/booking/ics";
import {
  cancelBooking,
  listBookings,
  rescheduleBooking,
} from "@/lib/booking/storage";
import type { Booking, HostProfile } from "@/lib/booking/types";

type Filter = "upcoming" | "cancelled" | "all";
type Tab = "bookings" | "availability";

export function HostBookings() {
  const { locale, t } = useLocale();
  const [tab, setTab] = useState<Tab>("bookings");
  const [host, setHost] = useState<HostProfile>(() =>
    loadHostProfile(defaultHostProfile.slug),
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    const profile = loadHostProfile(defaultHostProfile.slug);
    setHost(profile);
    setBookings(
      listBookings(profile.slug).sort(
        (a, b) => +new Date(a.startsAt) - +new Date(b.startsAt),
      ),
    );
  }

  useEffect(() => {
    reload();
  }, []);

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  );

  const visible = useMemo(() => {
    if (filter === "all") return bookings;
    if (filter === "cancelled") {
      return bookings.filter((b) => b.status === "cancelled");
    }
    return bookings.filter((b) => b.status === "confirmed");
  }, [bookings, filter]);

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  function handleCancel(id: string) {
    const next = cancelBooking(id);
    if (!next) {
      setError(t.bookingMissing);
      return;
    }
    setConfirmCancelId(null);
    setRescheduleId(null);
    setError(null);
    reload();
  }

  function handleReschedule(id: string, startsAt: string, endsAt: string) {
    const next = rescheduleBooking(id, startsAt, endsAt);
    if (!next) {
      setError(t.slotTaken);
      return;
    }
    setRescheduleId(null);
    setError(null);
    reload();
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-[#f2f2f0]">
      <Image
        src="/images/blueprint.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-center"
        aria-hidden
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(242,242,240,0.72)_0%,rgba(242,242,240,0.42)_40%,rgba(242,242,240,0.68)_100%)]"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="font-display text-xl tracking-wide text-ink">
          <span className="mr-2 text-accent">約</span>
          Yaku
        </Link>
        <div className="flex items-center gap-2.5">
          <Link href={`/b/${host.slug}`} className={islandClass("island", "sm")}>
            <Icon name="calendar" className="h-3.5 w-3.5 text-white/70" />
            {t.tryDemo}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-6 pb-16 md:px-10">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["bookings", t.tabBookings],
              ["availability", t.tabAvailability],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={[
                "rounded-full px-4 py-2 text-sm font-medium transition",
                tab === key
                  ? "bg-ink text-white"
                  : "bg-white/70 text-ink ring-1 ring-line hover:bg-white",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "availability" ? (
          <div className="mt-8">
            <HostAvailability
              slug={host.slug}
              onSaved={(profile) => setHost(profile)}
            />
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl text-ink md:text-4xl">
                {t.hostBookingsTitle}
              </h1>
              <IslandPill>
                <span className="h-2 w-2 rounded-full bg-[#30d158]" />
                <span>{confirmedCount}</span>
              </IslandPill>
            </div>
            <p className="mt-2 text-sm text-muted">{t.hostBookingsHint}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  ["upcoming", t.filterUpcoming],
                  ["cancelled", t.filterCancelled],
                  ["all", t.filterAll],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={[
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                    filter === key
                      ? "bg-ink text-white"
                      : "bg-white/70 text-ink ring-1 ring-line hover:bg-white",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            {error ? <p className="mt-4 text-sm text-[#ff453a]">{error}</p> : null}

            {visible.length === 0 ? (
              <div className="mt-10 rounded-[2rem] bg-[#111111] px-6 py-10 text-center text-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                <Icon name="calendar" className="mx-auto h-6 w-6 text-white/40" />
                <p className="mt-3">{t.hostBookingsEmpty}</p>
              </div>
            ) : (
              <ul className="mt-8 space-y-3">
                {visible.map((booking) => {
                  const cancelled = booking.status === "cancelled";
                  const isRescheduling = rescheduleId === booking.id;
                  return (
                    <li
                      key={booking.id}
                      className={[
                        "rounded-[1.75rem] bg-[#111111] px-5 py-4 text-white shadow-[0_16px_40px_rgba(0,0,0,0.16)]",
                        cancelled ? "opacity-70" : "",
                      ].join(" ")}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <IslandPill className="bg-[#1c1c1e]">
                          <Icon
                            name="clock"
                            className="h-3.5 w-3.5 text-white/70"
                          />
                          <span>
                            {formatter.format(new Date(booking.startsAt))}
                          </span>
                        </IslandPill>
                        <IslandPill
                          className={
                            cancelled
                              ? "bg-[#3a1c1c] text-[#ff8a80]"
                              : "bg-[#1c3a28]"
                          }
                        >
                          <span className="h-2 w-2 rounded-full bg-current" />
                          <span>
                            {cancelled ? t.statusCancelled : t.statusConfirmed}
                          </span>
                        </IslandPill>
                      </div>
                      <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/80">
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

                      {!cancelled && isRescheduling ? (
                        <div className="mt-5 border-t border-white/10 pt-5">
                          <h3 className="mb-3 font-display text-lg">
                            {t.rescheduleTitle}
                          </h3>
                          <ReschedulePicker
                            host={host}
                            excludeBookingId={booking.id}
                            initialStartsAt={booking.startsAt}
                            onConfirm={(startsAt, endsAt) =>
                              handleReschedule(booking.id, startsAt, endsAt)
                            }
                            onCancel={() => setRescheduleId(null)}
                          />
                        </div>
                      ) : null}

                      {!cancelled && !isRescheduling ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <IslandButton
                            type="button"
                            variant="islandMuted"
                            size="sm"
                            onClick={() => downloadIcs(booking, host)}
                          >
                            <Icon name="download" className="h-3.5 w-3.5" />
                            {t.downloadIcs}
                          </IslandButton>
                          <IslandButton
                            type="button"
                            variant="islandMuted"
                            size="sm"
                            onClick={() => {
                              setRescheduleId(booking.id);
                              setConfirmCancelId(null);
                              setError(null);
                            }}
                          >
                            <Icon name="calendar" className="h-3.5 w-3.5" />
                            {t.reschedule}
                          </IslandButton>
                          {confirmCancelId === booking.id ? (
                            <>
                              <IslandButton
                                type="button"
                                variant="accent"
                                size="sm"
                                onClick={() => handleCancel(booking.id)}
                              >
                                {t.cancelBooking}
                              </IslandButton>
                              <IslandButton
                                type="button"
                                variant="islandMuted"
                                size="sm"
                                onClick={() => setConfirmCancelId(null)}
                              >
                                {t.back}
                              </IslandButton>
                            </>
                          ) : (
                            <IslandButton
                              type="button"
                              variant="islandMuted"
                              size="sm"
                              onClick={() => {
                                setConfirmCancelId(booking.id);
                                setError(null);
                              }}
                            >
                              <Icon name="x" className="h-3.5 w-3.5" />
                              {t.cancelBooking}
                            </IslandButton>
                          )}
                          <Link
                            href={`/b/${host.slug}/m/${booking.id}`}
                            className={islandClass("soft", "sm", "text-ink")}
                          >
                            {t.manageTitle}
                          </Link>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}
