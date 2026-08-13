"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { HostAppearance } from "@/components/booking/HostAppearance";
import { HostAvailability } from "@/components/booking/HostAvailability";
import { HostBookingList } from "@/components/booking/HostBookingList";
import { HostScheduleCalendar } from "@/components/booking/HostScheduleCalendar";
import { OfficeShell, type OfficeRoom } from "@/components/booking/OfficeShell";
import { ReschedulePicker } from "@/components/booking/ReschedulePicker";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { OfficeThemeToggle } from "@/components/booking/OfficeThemeToggle";
import { Icon } from "@/components/ui/Icon";
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

const PASTELS = [
  { bg: "#d6ecff", border: "#5ac8fa" },
  { bg: "#e8deff", border: "#bf5af2" },
  { bg: "#d8f5e2", border: "#30d158" },
  { bg: "#ffe8d1", border: "#ff9f0a" },
  { bg: "#ffd9d6", border: "#ff453a" },
] as const;

function pastelOf(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i)) % 97;
  return PASTELS[hash % PASTELS.length]!;
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
  const [host, setHost] = useState<HostProfile>(() =>
    loadHostProfile(defaultHostProfile.slug),
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [focusDate, setFocusDate] = useState(() => new Date());
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

  const confirmed = useMemo(
    () => bookings.filter((b) => b.status === "confirmed"),
    [bookings],
  );

  const selected = useMemo(
    () => bookings.find((b) => b.id === selectedId) ?? null,
    [bookings, selectedId],
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

  const selectedPastel = selected ? pastelOf(selected.id) : PASTELS[0]!;

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

  function handleLogout() {
    signOut();
    router.replace("/login");
  }

  if (!ready || !session) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-[#12110f] text-white/50">
        …
      </div>
    );
  }

  const navItems: {
    key: NavKey;
    label: string;
    icon: "calendar" | "list" | "clock" | "settings" | "link" | "grid";
  }[] = [
    { key: "schedule", label: t.dashSchedule, icon: "calendar" },
    { key: "list", label: t.dashList, icon: "list" },
    { key: "availability", label: t.dashAvailability, icon: "clock" },
    { key: "appearance", label: t.dashAppearance, icon: "settings" },
    { key: "share", label: t.dashShareLink, icon: "link" },
    { key: "integrations", label: t.dashIntegrations, icon: "grid" },
  ];

  return (
    <OfficeShell
      sidebar={
        <>
          <Link href="/" className="font-display text-base tracking-wide">
            <span className="office-brand-mark mr-1.5">約</span>
            Yaku
          </Link>
          <p className="office-eyebrow mt-1 text-[10px] tracking-[0.2em] uppercase">
            Office
          </p>

          <button
            type="button"
            onClick={() => {
              setNav("share");
              void copyBookingLink();
            }}
            className="office-dc-btn-gold mt-4 w-full justify-start"
          >
            <Icon name="plus" className="h-3.5 w-3.5" />
            <span>{t.dashShareLink}</span>
          </button>

          <nav className="mt-5 flex flex-col">
            {navItems.map((item, index) => {
              const active = nav === item.key;
              return (
                <div key={item.key}>
                  {index > 0 ? <div className="office-dc-nav-divider" /> : null}
                  <button
                    type="button"
                    onClick={() => setNav(item.key)}
                    className="office-dc-nav-row"
                    data-active={active ? "true" : "false"}
                  >
                    <span>{item.label}</span>
                    <Icon name={item.icon} className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </nav>

          <div className="office-nav-footer mt-auto space-y-2 border-t border-[color:var(--office-border)] pt-3">
            <div className="office-dc-nav-row pointer-events-none">
              <div className="min-w-0 leading-tight">
                <p className="truncate text-xs font-medium">{session.displayName}</p>
                <p className="office-muted truncate text-[10px]">{session.email}</p>
              </div>
            </div>
            <LanguageSwitcher className="office-dc-nav-row" />
            <button
              type="button"
              onClick={handleLogout}
              className="office-dc-nav-row"
            >
              <span>{t.logout}</span>
              <Icon name="logout" className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      }
    >
      <header className="office-header flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 md:px-5">
        <div>
          <h1 className="font-display text-xl tracking-wide md:text-2xl">
            {t.dashMyActivity}
          </h1>
          <p className="office-muted mt-0.5 text-xs">{t.hostBookingsHint}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="office-dc-count">
            <span className="office-status-dot h-2 w-2 rounded-full" />
            <span>{confirmed.length}</span>
          </div>
          <div className="office-theme-spline-header">
            <OfficeThemeToggle />
          </div>
        </div>
      </header>

      <div className="office-mobile-nav flex gap-2 overflow-x-auto border-b px-3 py-2 md:hidden">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setNav(item.key)}
            className="office-dc-chip shrink-0"
            data-active={nav === item.key ? "true" : "false"}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <main
            className={[
              "flex min-h-0 min-w-0 flex-1 flex-col",
              nav === "schedule"
                ? "overflow-hidden p-2 md:p-3"
                : nav === "list"
                  ? "office-list-main overflow-hidden p-3 md:p-5"
                  : "overflow-auto px-4 py-5 md:px-6 md:py-6",
            ].join(" ")}
          >
            {error ? <p className="mb-3 shrink-0 text-sm text-[#ff8a80]">{error}</p> : null}

            {nav === "availability" ? (
              <HostAvailability
                slug={host.slug}
                onSaved={(profile) => setHost(profile)}
              />
            ) : null}

            {nav === "appearance" ? (
              <HostAppearance slug={host.slug} onSaved={setHost} />
            ) : null}

            {nav === "share" ? (
              <div className="office-dc-card mx-auto max-w-lg p-6">
                <h2 className="font-display text-2xl">{t.dashShareLink}</h2>
                <p className="office-muted mt-2 text-sm">
                  /b/{host.slug}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="office-dc-btn-gold"
                    onClick={() => void copyBookingLink()}
                  >
                    <Icon name="link" className="h-4 w-4" />
                    {copied ? t.linkCopied : t.copyLink}
                  </button>
                  <Link
                    href={`/b/${host.slug}?from=host`}
                    className="office-dc-btn-dark"
                  >
                    {t.openBookingLink}
                  </Link>
                </div>
              </div>
            ) : null}

            {nav === "integrations" ? (
              <div className="office-dc-card mx-auto max-w-lg p-6">
                <h2 className="font-display text-2xl">{t.integrationsTitle}</h2>
                <p className="office-muted mt-2 text-sm">{t.integrationsHint}</p>
              </div>
            ) : null}

            {nav === "list" ? (
              <HostBookingList
                bookings={confirmed}
                onOpen={(booking) => {
                  setSelectedId(booking.id);
                  setNav("schedule");
                  setFocusDate(new Date(booking.startsAt));
                }}
              />
            ) : null}

            {nav === "schedule" ? (
              <HostScheduleCalendar
                bookings={confirmed}
                focusDate={focusDate}
                onFocusChange={setFocusDate}
                selectedId={selectedId}
                onSelect={(id) => {
                  setSelectedId(id);
                  setRescheduleId(null);
                  setConfirmCancelId(null);
                  setError(null);
                }}
              />
            ) : null}
          </main>

          {selected && selected.status !== "cancelled" ? (
            <div
              className="office-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
              role="presentation"
              onClick={() => {
                setSelectedId(null);
                setRescheduleId(null);
                setConfirmCancelId(null);
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label={selected.guestName}
                className="office-dc-modal max-h-[min(90dvh,720px)] w-full max-w-[420px] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="office-dc-modal-hero relative px-5 pb-4 pt-5"
                  style={{ backgroundColor: selectedPastel.bg }}
                >
                  <div
                    className="absolute inset-y-0 left-0 w-1.5 rounded-l-[10px]"
                    style={{ backgroundColor: selectedPastel.border }}
                  />
                  <div className="flex items-start justify-between gap-3 pl-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-semibold tracking-tight text-[#111]">
                        {selected.guestName}
                      </h2>
                      <p className="mt-1 text-sm text-[#111]/70">
                        {detailDateFormatter.format(new Date(selected.startsAt))}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-[#111]/85">
                        {timeFormatter.format(new Date(selected.startsAt))} –{" "}
                        {timeFormatter.format(new Date(selected.endsAt))}
                        <span className="mx-1.5 text-[#111]/35">·</span>
                        {durationMinutes(
                          new Date(selected.startsAt),
                          new Date(selected.endsAt),
                        )}{" "}
                        Min
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(null);
                        setRescheduleId(null);
                        setConfirmCancelId(null);
                      }}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-black/5 text-[#111]/55 hover:bg-black/10 hover:text-[#111]"
                      aria-label={t.back}
                    >
                      <Icon name="x" className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="office-dc-modal-body space-y-3 px-5 py-4">
                  <div className="flex items-start gap-3 text-sm">
                    <Icon
                      name="mail"
                      className="office-muted mt-0.5 h-4 w-4 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="office-muted text-[11px] font-medium uppercase tracking-wide">
                        {t.email}
                      </p>
                      <p className="truncate">{selected.guestEmail}</p>
                    </div>
                  </div>

                  {selected.note ? (
                    <div className="flex items-start gap-3 text-sm">
                      <Icon
                        name="list"
                        className="office-muted mt-0.5 h-4 w-4 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="office-muted text-[11px] font-medium uppercase tracking-wide">
                          {t.note}
                        </p>
                        <p>{selected.note}</p>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2 pt-1">
                    <span className="h-2 w-2 rounded-full bg-[#30d158]" />
                    <span className="text-sm opacity-80">{t.statusConfirmed}</span>
                  </div>
                </div>

                {rescheduleId === selected.id ? (
                  <div className="office-dc-modal-footer px-5 py-4">
                    <h3 className="mb-3 text-base font-semibold">
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
                  <div className="office-dc-modal-footer px-4 py-3">
                    {confirmCancelId === selected.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCancel(selected.id)}
                          className="flex-1 rounded-[8px] bg-[#ff3b30] px-3 py-2.5 text-sm font-semibold text-white hover:brightness-110"
                        >
                          {t.cancelBooking}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmCancelId(null)}
                          className="office-dc-btn-dark flex-1"
                        >
                          {t.back}
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setRescheduleId(selected.id);
                              setConfirmCancelId(null);
                            }}
                            className="office-soft-btn flex flex-col items-center gap-1.5 rounded-[8px] px-2 py-2.5"
                          >
                            <Icon name="calendar" className="h-4 w-4" />
                            <span className="text-[11px] font-medium">
                              {t.reschedule}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadIcs(selected, host)}
                            className="office-soft-btn flex flex-col items-center gap-1.5 rounded-[8px] px-2 py-2.5"
                          >
                            <Icon name="download" className="h-4 w-4" />
                            <span className="text-[11px] font-medium">.ics</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmCancelId(selected.id)}
                            className="flex flex-col items-center gap-1.5 rounded-[8px] px-2 py-2.5 text-[#ff3b30] hover:bg-[#ff3b30]/10"
                          >
                            <Icon name="x" className="h-4 w-4" />
                            <span className="text-[11px] font-medium">
                              {t.cancelBooking}
                            </span>
                          </button>
                        </div>
                        <Link
                          href={`/b/${host.slug}/m/${selected.id}`}
                          className="office-muted mt-2 flex w-full items-center justify-center rounded-[8px] px-3 py-2 text-xs font-medium hover:bg-[color:var(--office-nav-hover)]"
                        >
                          {t.manageTitle}
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
    </OfficeShell>
  );
}
