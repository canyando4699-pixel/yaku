"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { HostAvailability } from "@/components/booking/HostAvailability";
import { OfficeShell, OFFICE_FLIGHT_MS, type OfficeRoom } from "@/components/booking/OfficeShell";
import { ReschedulePicker } from "@/components/booking/ReschedulePicker";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Icon } from "@/components/ui/Icon";
import { IslandButton, IslandPill } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import { localeDate } from "@/i18n/messages";
import {
  getSession,
  signOut,
  type AuthSession,
} from "@/lib/auth/localAuth";
import { defaultHostProfile } from "@/lib/booking/demo";
import { loadHostProfile } from "@/lib/booking/hostProfile";
import { downloadIcs } from "@/lib/booking/ics";
import {
  cancelBooking,
  listBookings,
  rescheduleBooking,
} from "@/lib/booking/storage";
import type { Booking, HostProfile } from "@/lib/booking/types";

type NavKey = OfficeRoom;

const ACCENTS = [
  "#1f9d8a",
  "#c4a35a",
  "#6b7a3d",
  "#e85d4c",
  "#4f8f7a",
] as const;

function startOfWeek(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const mondayOffset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - mondayOffset);
  return d;
}

function addDays(date: Date, amount: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function accentOf(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i)) % 97;
  return ACCENTS[hash % ACCENTS.length];
}

function durationMinutes(start: Date, end: Date) {
  return Math.max(1, Math.round((+end - +start) / 60000));
}

export function HostDashboard() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [nav, setNav] = useState<NavKey>("schedule");
  const [flightTo, setFlightTo] = useState<NavKey | null>(null);
  const [walking, setWalking] = useState(false);
  const [host, setHost] = useState<HostProfile>(() =>
    loadHostProfile(defaultHostProfile.slug),
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeek(new Date()));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    const current = getSession();
    if (!current) {
      router.replace("/login?next=/host");
      return;
    }
    setSession(current);
    reload();
    setReady(true);
  }, [router]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekAnchor, i)),
    [weekAnchor],
  );

  const confirmed = useMemo(
    () => bookings.filter((b) => b.status === "confirmed"),
    [bookings],
  );

  const weekBookings = useMemo(() => {
    const start = weekDays[0]!;
    const end = addDays(weekDays[weekDays.length - 1]!, 1);
    return confirmed.filter((b) => {
      const d = new Date(b.startsAt);
      return d >= start && d < end;
    });
  }, [confirmed, weekDays]);

  const selected = useMemo(
    () => bookings.find((b) => b.id === selectedId) ?? null,
    [bookings, selectedId],
  );

  const weekdayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        weekday: "short",
      }),
    [locale],
  );

  const dayNumFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        day: "numeric",
      }),
    [locale],
  );

  const rangeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        day: "numeric",
        month: "short",
      }),
    [locale],
  );

  const detailDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        weekday: "long",
        day: "numeric",
        month: "long",
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

  const now = new Date();
  const selectedAccent = selected ? accentOf(selected.id) : ACCENTS[0];
  const weekRangeLabel = `${rangeFormatter.format(weekDays[0]!)} – ${rangeFormatter.format(weekDays[6]!)}`;

  function handleCancel(id: string) {
    const next = cancelBooking(id);
    if (!next) {
      setError(t.bookingMissing);
      return;
    }
    setConfirmCancelId(null);
    setRescheduleId(null);
    setError(null);
    if (selectedId === id) setSelectedId(null);
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

  async function copyBookingLink() {
    const url = `${window.location.origin}/b/${host.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError(url);
    }
  }

  function walkTo(next: NavKey) {
    if (next === nav || walking) return;
    setFlightTo(next);
    setWalking(true);
    window.setTimeout(() => {
      setNav(next);
      setFlightTo(null);
      setWalking(false);
    }, OFFICE_FLIGHT_MS);
  }

  function handleLogout() {
    signOut();
    router.replace("/login");
  }

  if (!ready || !session) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-[#0c0c0e] text-white/50">
        …
      </div>
    );
  }

  const navItems: { key: NavKey; label: string; icon: "calendar" | "list" | "clock" | "link" }[] =
    [
      { key: "schedule", label: t.dashSchedule, icon: "calendar" },
      { key: "list", label: t.dashList, icon: "list" },
      { key: "availability", label: t.dashAvailability, icon: "clock" },
      { key: "share", label: t.dashShareLink, icon: "link" },
    ];

  return (
    <OfficeShell
      room={flightTo ?? nav}
      walking={walking}
      sidebar={
        <>
          <Link href="/" className="font-display text-base tracking-wide">
            <span className="mr-1.5 text-accent">約</span>
            Yaku
          </Link>
          <p className="mt-1 text-[10px] tracking-[0.2em] text-white/35 uppercase">
            Office
          </p>

          <button
            type="button"
            onClick={() => {
              walkTo("share");
              void copyBookingLink();
            }}
            className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-full bg-accent px-3 text-xs font-medium text-white shadow-[0_8px_20px_rgba(225,6,0,0.24)] transition hover:brightness-110"
          >
            <Icon name="plus" className="h-3.5 w-3.5" />
            {t.dashShareLink}
          </button>

          <nav className="mt-5 space-y-1">
            {navItems.map((item) => {
              const active = (flightTo ?? nav) === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  disabled={walking}
                  onClick={() => walkTo(item.key)}
                  className={[
                    "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] transition",
                    active
                      ? "bg-[linear-gradient(135deg,rgba(196,163,90,0.35),rgba(107,122,61,0.25))] text-white ring-1 ring-[#c4a35a]/35"
                      : "text-white/65 hover:bg-white/5 hover:text-white",
                    walking ? "opacity-70" : "",
                  ].join(" ")}
                >
                  <Icon name={item.icon} className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 border-t border-white/8 pt-3">
            <div className="rounded-xl bg-white/5 px-2.5 py-2">
              <p className="truncate text-xs font-medium text-white">
                {session.displayName}
              </p>
              <p className="truncate text-[10px] text-white/40">
                {session.email}
              </p>
            </div>
            <LanguageSwitcher />
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              <Icon name="logout" className="h-3.5 w-3.5" />
              {t.logout}
            </button>
          </div>
        </>
      }
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/8 px-4 py-3 md:px-5">
        <div>
          <h1 className="font-display text-xl tracking-wide md:text-2xl">
            {t.dashMyActivity}
          </h1>
          <p className="mt-0.5 text-xs text-white/40">
            {walking ? "Drone flight…" : t.hostBookingsHint}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <IslandPill className="bg-black/40 ring-1 ring-white/10">
            <span className="h-2 w-2 rounded-full bg-[#c4a35a]" />
            <span>{confirmed.length}</span>
          </IslandPill>
          <div className="md:hidden">
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 md:hidden"
            aria-label={t.logout}
          >
            <Icon name="logout" className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto border-b border-white/8 px-3 py-2 md:hidden">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            disabled={walking}
            onClick={() => walkTo(item.key)}
            className={[
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium",
              (flightTo ?? nav) === item.key
                ? "bg-[#c4a35a]/30 text-white ring-1 ring-[#c4a35a]/40"
                : "bg-white/5 text-white/65",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        className={[
          "flex min-h-0 flex-1 flex-col transition duration-500 lg:flex-row",
          walking ? "pointer-events-none opacity-20" : "opacity-100",
        ].join(" ")}
      >
          <main
            className={[
              "flex min-h-0 min-w-0 flex-1 flex-col overflow-auto",
              nav === "schedule"
                ? "p-2 md:p-3"
                : "px-4 py-5 md:px-6 md:py-6",
            ].join(" ")}
          >
            {error ? <p className="mb-3 shrink-0 text-sm text-[#ff8a80]">{error}</p> : null}

            {nav === "availability" ? (
              <HostAvailability
                slug={host.slug}
                onSaved={(profile) => setHost(profile)}
              />
            ) : null}

            {nav === "share" ? (
              <div className="mx-auto max-w-lg office-panel p-6 ring-1 ring-white/8">
                <h2 className="font-display text-2xl">{t.dashShareLink}</h2>
                <p className="mt-2 text-sm text-white/55">
                  /b/{host.slug}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <IslandButton
                    type="button"
                    variant="accent"
                    onClick={() => void copyBookingLink()}
                  >
                    <Icon name="link" className="h-4 w-4" />
                    {copied ? t.linkCopied : t.copyLink}
                  </IslandButton>
                  <Link
                    href={`/b/${host.slug}?from=host`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    {t.openBookingLink}
                  </Link>
                </div>
              </div>
            ) : null}

            {nav === "list" ? (
              <ul className="space-y-3">
                {confirmed.length === 0 ? (
                  <li className="office-panel px-6 py-10 text-center text-white/55 ring-1 ring-white/8">
                    {t.hostBookingsEmpty}
                  </li>
                ) : (
                  confirmed.map((booking) => (
                    <li key={booking.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(booking.id);
                          setNav("schedule");
                          setWeekAnchor(startOfWeek(new Date(booking.startsAt)));
                        }}
                        className="w-full office-panel px-5 py-4 text-left ring-1 ring-white/8 transition hover:bg-[#1a1a1e]"
                      >
                        <p className="font-medium">{booking.guestName}</p>
                        <p className="mt-1 text-sm text-white/55">
                          {timeFormatter.format(new Date(booking.startsAt))} ·{" "}
                          {booking.guestEmail}
                        </p>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            ) : null}

            {nav === "schedule" ? (
              <div className="office-board overflow-hidden">
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-3 md:px-5">
                  <div>
                    <p className="text-sm text-white/55">
                      {t.dashWeekCount.replace(
                        "{n}",
                        String(weekBookings.length),
                      )}
                    </p>
                    <p className="mt-0.5 text-xs tracking-wide text-white/35">
                      {weekRangeLabel}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center rounded-xl bg-white/5 p-1">
                      <button
                        type="button"
                        aria-label={t.prevWeek}
                        onClick={() => setWeekAnchor((w) => addDays(w, -7))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                      >
                        <Icon name="chevronLeft" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeekAnchor(startOfWeek(new Date()))}
                        className="rounded-lg px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
                      >
                        {t.thisWeek}
                      </button>
                      <button
                        type="button"
                        aria-label={t.nextWeek}
                        onClick={() => setWeekAnchor((w) => addDays(w, 7))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                      >
                        <Icon name="chevronRight" className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="rounded-xl bg-[linear-gradient(135deg,#c4a35a,#6b7a3d)] px-3.5 py-2 text-xs font-medium text-[#111111] shadow-[0_8px_24px_rgba(196,163,90,0.28)]">
                      {t.viewWeek}
                    </span>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-auto">
                  <div className="grid h-full min-h-[520px] min-w-[980px] grid-cols-7">
                    {weekDays.map((day, dayIndex) => {
                      const active = sameDay(day, now);
                      const dayBookings = weekBookings
                        .filter((b) => sameDay(new Date(b.startsAt), day))
                        .sort(
                          (a, b) =>
                            +new Date(a.startsAt) - +new Date(b.startsAt),
                        );
                      return (
                        <div
                          key={day.toISOString()}
                          className={[
                            "min-h-full border-white/5 p-3 md:p-4",
                            dayIndex < 6 ? "border-r" : "",
                            active ? "bg-white/[0.03]" : "",
                          ].join(" ")}
                        >
                          <div className="mb-4 flex items-center justify-between gap-2">
                            <span className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                              {weekdayFormatter.format(day)}
                            </span>
                            <span
                              className={[
                                "inline-flex h-8 min-w-8 items-center justify-center rounded-full px-1.5 text-sm font-medium",
                                active
                                  ? "bg-[linear-gradient(135deg,#c4a35a,#6b7a3d)] text-[#111111]"
                                  : "text-white/70",
                              ].join(" ")}
                            >
                              {dayNumFormatter.format(day)}
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {dayBookings.map((booking) => {
                              const start = new Date(booking.startsAt);
                              const end = new Date(booking.endsAt);
                              const accent = accentOf(booking.id);
                              const selectedCard = selectedId === booking.id;
                              return (
                                <button
                                  key={booking.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedId(booking.id);
                                    setRescheduleId(null);
                                    setConfirmCancelId(null);
                                    setError(null);
                                  }}
                                  className={[
                                    "office-board-card relative w-full px-3.5 py-3 text-left",
                                    selectedCard
                                      ? "office-board-card-active"
                                      : "",
                                  ].join(" ")}
                                  style={
                                    selectedCard
                                      ? {
                                          boxShadow: `0 0 0 1px ${accent}55, 0 12px 32px rgba(0,0,0,0.4)`,
                                        }
                                      : undefined
                                  }
                                >
                                  <span
                                    className="absolute right-3 top-3 h-2.5 w-2.5 rounded-[3px]"
                                    style={{ backgroundColor: accent }}
                                  />
                                  <p className="pr-5 text-sm font-medium text-white">
                                    {booking.guestName}
                                  </p>
                                  <p className="mt-1 text-xs text-white/45">
                                    {timeFormatter.format(start)} ·{" "}
                                    {durationMinutes(start, end)} Min
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {weekBookings.length === 0 ? (
                  <p className="shrink-0 border-t border-white/8 px-4 py-4 text-center text-sm text-white/40">
                    {t.hostBookingsEmpty}
                  </p>
                ) : null}
              </div>
            ) : null}
          </main>

          {selected && selected.status !== "cancelled" ? (
          <aside className="office-glass w-full shrink-0 border-t border-white/8 lg:w-[280px] lg:border-t-0 lg:border-l">
            <div className="sticky top-0 max-h-[100dvh] overflow-auto p-4">
                <div
                  className="office-detail-card border-l-4 p-4"
                  style={{
                    borderLeftColor: selectedAccent,
                    boxShadow: `0 0 28px ${selectedAccent}22, 0 12px 32px rgba(0,0,0,0.3)`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-[3px]"
                          style={{ backgroundColor: selectedAccent }}
                        />
                        <span className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                          {durationMinutes(
                            new Date(selected.startsAt),
                            new Date(selected.endsAt),
                          )}{" "}
                          Min
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold tracking-tight text-white">
                        {selected.guestName}
                      </h2>
                      <p className="mt-1 text-sm text-white/55">
                        {detailDateFormatter.format(new Date(selected.startsAt))}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10"
                      aria-label={t.back}
                    >
                      <Icon name="x" className="h-4 w-4" />
                    </button>
                  </div>

                  {selected.note ? (
                    <p className="mt-4 rounded-xl bg-white/5 px-3.5 py-2.5 text-sm text-white/80">
                      {t.note}: {selected.note}
                    </p>
                  ) : null}

                  <div className="mt-5 space-y-2 text-sm">
                    <p className="inline-flex items-center gap-2 text-white/70">
                      <Icon name="mail" className="h-3.5 w-3.5" />
                      {selected.guestEmail}
                    </p>
                    <p className="inline-flex items-center gap-2 text-white/70">
                      <Icon name="clock" className="h-3.5 w-3.5" />
                      {timeFormatter.format(new Date(selected.startsAt))} –{" "}
                      {timeFormatter.format(new Date(selected.endsAt))}
                    </p>
                    <IslandPill className="mt-2 bg-[#1c3a28]">
                      <span className="h-2 w-2 rounded-full bg-[#30d158]" />
                      {t.statusConfirmed}
                    </IslandPill>
                  </div>

                  {rescheduleId === selected.id ? (
                    <div className="mt-6 border-t border-white/10 pt-5">
                      <h3 className="mb-3 text-lg font-semibold text-white">
                        {t.rescheduleTitle}
                      </h3>
                      <ReschedulePicker
                        host={host}
                        excludeBookingId={selected.id}
                        initialStartsAt={selected.startsAt}
                        onConfirm={(startsAt, endsAt) =>
                          handleReschedule(selected.id, startsAt, endsAt)
                        }
                        onCancel={() => setRescheduleId(null)}
                      />
                    </div>
                  ) : (
                    <div className="mt-8 flex flex-col gap-2">
                      <IslandButton
                        type="button"
                        variant="accent"
                        className="w-full"
                        onClick={() => downloadIcs(selected, host)}
                      >
                        <Icon name="download" className="h-4 w-4" />
                        {t.downloadIcs}
                      </IslandButton>
                      <IslandButton
                        type="button"
                        variant="islandMuted"
                        className="w-full"
                        onClick={() => {
                          setRescheduleId(selected.id);
                          setConfirmCancelId(null);
                        }}
                      >
                        <Icon name="calendar" className="h-4 w-4" />
                        {t.reschedule}
                      </IslandButton>
                      {confirmCancelId === selected.id ? (
                        <div className="flex gap-2">
                          <IslandButton
                            type="button"
                            variant="accent"
                            className="flex-1"
                            onClick={() => handleCancel(selected.id)}
                          >
                            {t.cancelBooking}
                          </IslandButton>
                          <IslandButton
                            type="button"
                            variant="islandMuted"
                            className="flex-1"
                            onClick={() => setConfirmCancelId(null)}
                          >
                            {t.back}
                          </IslandButton>
                        </div>
                      ) : (
                        <IslandButton
                          type="button"
                          variant="islandMuted"
                          className="w-full"
                          onClick={() => setConfirmCancelId(selected.id)}
                        >
                          <Icon name="x" className="h-4 w-4" />
                          {t.cancelBooking}
                        </IslandButton>
                      )}
                      <Link
                        href={`/b/${host.slug}/m/${selected.id}`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/15"
                      >
                        {t.manageTitle}
                      </Link>
                    </div>
                  )}
                </div>
            </div>
          </aside>
          ) : null}
        </div>
    </OfficeShell>
  );
}
