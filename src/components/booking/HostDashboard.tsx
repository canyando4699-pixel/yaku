"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { HostAppearance } from "@/components/booking/HostAppearance";
import { HostAvailability } from "@/components/booking/HostAvailability";
import { HostBookingList } from "@/components/booking/HostBookingList";
import { HostScheduleCalendar } from "@/components/booking/HostScheduleCalendar";
import { OfficeEmptyState } from "@/components/booking/OfficeEmptyState";
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
import {
  loadHostProfile,
  resolveEventTypeOrFallback,
} from "@/lib/booking/hostProfile";
import { downloadIcs } from "@/lib/booking/ics";
import {
  cancelBooking,
  listBookings,
  rescheduleBooking,
} from "@/lib/booking/storage";
import {
  pastelForBooking,
  pastelForEventType,
  type Booking,
  type HostProfile,
} from "@/lib/booking/types";

type NavKey = OfficeRoom;
type SchedulingTab = "eventTypes" | "oneOff" | "polls";
type MeetingsTab = "plan" | "list";
type IntegrationsTab = "discover" | "manage";
type SidebarRoom =
  | "scheduling"
  | "meetings"
  | "availability"
  | "contacts"
  | "workflows"
  | "integrations"
  | "routing";
type IconName =
  | "list"
  | "calendar"
  | "clock"
  | "user"
  | "settings"
  | "grid"
  | "arrowRight";

function CreateMenu({
  variant,
  copied,
  onAction,
}: {
  variant: "gold" | "chip";
  copied: boolean;
  onAction: (action: "eventType" | "oneOff" | "polls" | "copy") => void;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(action: "eventType" | "oneOff" | "polls" | "copy") {
    onAction(action);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={variant === "gold" ? "relative w-full" : "relative shrink-0"}>
      <button
        type="button"
        className={
          variant === "gold"
            ? "office-dc-btn-gold mt-4 w-full justify-start"
            : "office-dc-chip shrink-0"
        }
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {variant === "gold" ? <Icon name="plus" className="h-3.5 w-3.5" /> : null}
        <span>{copied ? t.linkCopied : t.dashCreate}</span>
      </button>
      {open ? (
        <div
          role="menu"
          className={
            variant === "gold"
              ? "absolute z-20 mt-1 w-full office-dc-card p-1"
              : "absolute z-30 mt-1 min-w-[12.5rem] office-dc-card p-1"
          }
        >
          <button
            type="button"
            role="menuitem"
            className="office-dc-nav-row"
            onClick={() => choose("eventType")}
          >
            <span>{t.dashCreateEventType}</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="office-dc-nav-row"
            onClick={() => choose("oneOff")}
          >
            <span>{t.dashCreateOneOff}</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="office-dc-nav-row"
            onClick={() => choose("polls")}
          >
            <span>{t.dashCreatePoll}</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="office-dc-nav-row"
            onClick={() => choose("copy")}
          >
            <span>{t.dashCreateCopyLink}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function durationMinutes(start: Date, end: Date) {
  return Math.max(1, Math.round((+end - +start) / 60000));
}

export function HostDashboard() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [nav, setNav] = useState<NavKey>("scheduling");
  const [schedulingTab, setSchedulingTab] = useState<SchedulingTab>("eventTypes");
  const [meetingsTab, setMeetingsTab] = useState<MeetingsTab>("plan");
  const [integrationsTab, setIntegrationsTab] = useState<IntegrationsTab>("discover");
  const [spawnEventTypeKey, setSpawnEventTypeKey] = useState(0);
  const spawnConsumedRef = useRef(0);
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

  const selectedPastel = selected
    ? pastelForBooking(selected, host.eventTypes)
    : pastelForEventType();

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

  function applyCreate(action: "eventType" | "oneOff" | "polls" | "copy") {
    if (action === "eventType") {
      setNav("scheduling");
      setSchedulingTab("eventTypes");
      setSpawnEventTypeKey((k) => k + 1);
      return;
    }
    if (action === "oneOff") {
      setNav("scheduling");
      setSchedulingTab("oneOff");
      return;
    }
    if (action === "polls") {
      setNav("scheduling");
      setSchedulingTab("polls");
      return;
    }
    void copyBookingLink();
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
    key: SidebarRoom;
    label: string;
    icon: IconName;
  }[] = [
    { key: "scheduling", label: t.dashScheduling, icon: "list" },
    { key: "meetings", label: t.dashMeetings, icon: "calendar" },
    { key: "availability", label: t.dashAvailability, icon: "clock" },
    { key: "contacts", label: t.dashContacts, icon: "user" },
    { key: "workflows", label: t.dashWorkflows, icon: "settings" },
    { key: "integrations", label: t.dashIntegrations, icon: "grid" },
    { key: "routing", label: t.dashRouting, icon: "arrowRight" },
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

          <CreateMenu
            variant="gold"
            copied={copied}
            onAction={applyCreate}
          />

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
            <button
              type="button"
              onClick={() => setNav("upgrade")}
              className="office-dc-nav-row"
              data-active={nav === "upgrade" ? "true" : "false"}
            >
              <span>{t.dashUpgrade}</span>
            </button>
            <button
              type="button"
              onClick={() => setNav("analytics")}
              className="office-dc-nav-row"
              data-active={nav === "analytics" ? "true" : "false"}
            >
              <span>{t.dashAnalytics}</span>
            </button>
            <button type="button" disabled className="office-dc-nav-row">
              <span>{t.dashAdmin}</span>
            </button>
            <div className="office-dc-nav-row pointer-events-none">
              <div className="min-w-0 leading-tight">
                <p className="truncate text-xs font-medium">{session.displayName}</p>
                <p className="office-muted truncate text-[10px]">{session.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNav("appearance")}
              className="office-dc-nav-row"
              data-active={nav === "appearance" ? "true" : "false"}
            >
              <span>{t.dashAppearance}</span>
              <Icon name="settings" className="h-3.5 w-3.5" />
            </button>
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

      <div className="office-mobile-nav flex items-center gap-2 border-b px-3 py-2 md:hidden">
        <CreateMenu
          variant="chip"
          copied={copied}
          onAction={applyCreate}
        />
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
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
        <button
          type="button"
          onClick={() => setNav("appearance")}
          className="office-dc-chip shrink-0"
          data-active={nav === "appearance" ? "true" : "false"}
        >
          {t.dashAppearance}
        </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <main
            className={[
              "flex min-h-0 min-w-0 flex-1 flex-col",
              nav === "meetings" && meetingsTab === "plan"
                ? "overflow-hidden p-2 md:p-3"
                : nav === "meetings" && meetingsTab === "list"
                  ? "office-list-main overflow-hidden p-3 md:p-5"
                  : "overflow-auto px-4 py-5 md:px-6 md:py-6",
            ].join(" ")}
          >
            {error ? <p className="mb-3 shrink-0 text-sm text-[#ff8a80]">{error}</p> : null}

            {nav === "scheduling" ? (
              <div className="mb-4 flex flex-wrap gap-2">
                {(
                  [
                    ["eventTypes", t.dashTabEventTypes],
                    ["oneOff", t.dashTabOneOff],
                    ["polls", t.dashTabPolls],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={schedulingTab === id}
                    onClick={() => setSchedulingTab(id)}
                    className={[
                      "rounded-full px-3.5 py-2 text-sm font-medium transition",
                      schedulingTab === id ? "office-liquid-glass" : "office-chip-idle",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}

            {nav === "meetings" ? (
              <div className="mb-4 flex flex-wrap gap-2">
                {(
                  [
                    ["plan", t.dashSchedule],
                    ["list", t.dashList],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={meetingsTab === id}
                    onClick={() => setMeetingsTab(id)}
                    className={[
                      "rounded-full px-3.5 py-2 text-sm font-medium transition",
                      meetingsTab === id ? "office-liquid-glass" : "office-chip-idle",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}

            {nav === "integrations" ? (
              <div className="mb-4 flex flex-wrap gap-2">
                {(
                  [
                    ["discover", t.dashTabDiscover],
                    ["manage", t.dashTabManage],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={integrationsTab === id}
                    onClick={() => setIntegrationsTab(id)}
                    className={[
                      "rounded-full px-3.5 py-2 text-sm font-medium transition",
                      integrationsTab === id ? "office-liquid-glass" : "office-chip-idle",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}

            {nav === "scheduling" && schedulingTab === "eventTypes" ? (
              <HostAvailability
                slug={host.slug}
                section="eventTypes"
                spawnEventTypeKey={spawnEventTypeKey}
                spawnConsumedRef={spawnConsumedRef}
                onSaved={(p) => setHost(p)}
              />
            ) : null}

            {nav === "scheduling" && schedulingTab === "oneOff" ? (
              <OfficeEmptyState
                title={t.dashEmptyOneOffTitle}
                body={t.dashEmptyOneOffBody}
              />
            ) : null}

            {nav === "scheduling" && schedulingTab === "polls" ? (
              <OfficeEmptyState
                title={t.dashEmptyPollsTitle}
                body={t.dashEmptyPollsBody}
              />
            ) : null}

            {nav === "meetings" && meetingsTab === "plan" ? (
              <HostScheduleCalendar
                bookings={confirmed}
                eventTypes={host.eventTypes}
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

            {nav === "meetings" && meetingsTab === "list" ? (
              <HostBookingList
                bookings={confirmed}
                onOpen={(booking) => {
                  setSelectedId(booking.id);
                  setFocusDate(new Date(booking.startsAt));
                }}
              />
            ) : null}

            {nav === "availability" ? (
              <HostAvailability
                slug={host.slug}
                section="hours"
                onSaved={(profile) => setHost(profile)}
              />
            ) : null}

            {nav === "appearance" ? (
              <HostAppearance slug={host.slug} onSaved={setHost} />
            ) : null}

            {nav === "contacts" ? (
              <OfficeEmptyState
                title={t.dashEmptyContactsTitle}
                body={t.dashEmptyContactsBody}
              />
            ) : null}

            {nav === "workflows" ? (
              <OfficeEmptyState
                title={t.dashEmptyWorkflowsTitle}
                body={t.dashEmptyWorkflowsBody}
              />
            ) : null}

            {nav === "integrations" && integrationsTab === "discover" ? (
              <OfficeEmptyState
                title={t.dashEmptyIntegrationsDiscoverTitle}
                body={t.dashEmptyIntegrationsDiscoverBody}
              />
            ) : null}

            {nav === "integrations" && integrationsTab === "manage" ? (
              <OfficeEmptyState
                title={t.dashEmptyIntegrationsManageTitle}
                body={t.dashEmptyIntegrationsManageBody}
              />
            ) : null}

            {nav === "routing" ? (
              <OfficeEmptyState
                title={t.dashEmptyRoutingTitle}
                body={t.dashEmptyRoutingBody}
              />
            ) : null}

            {nav === "upgrade" ? (
              <OfficeEmptyState
                title={t.dashEmptyUpgradeTitle}
                body={t.dashEmptyUpgradeBody}
              />
            ) : null}

            {nav === "analytics" ? (
              <OfficeEmptyState
                title={t.dashEmptyAnalyticsTitle}
                body={t.dashEmptyAnalyticsBody}
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
                className={
                  rescheduleId === selected.id
                    ? "office-dc-modal max-h-[min(92dvh,960px)] w-full max-w-[760px] overflow-auto"
                    : "office-dc-modal max-h-[min(90dvh,720px)] w-full max-w-[420px] overflow-auto"
                }
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

                  {(selected.answers ?? []).length ? (
                    <div className="space-y-2 text-sm">
                      {(selected.answers ?? []).map((a) => (
                        <div key={a.questionId}>
                          <p className="office-muted text-[11px] font-medium uppercase tracking-wide">
                            {a.label}
                          </p>
                          <p>
                            {Array.isArray(a.value)
                              ? a.value.join(", ")
                              : a.value}
                          </p>
                        </div>
                      ))}
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
                      eventType={resolveEventTypeOrFallback(
                        host.eventTypes,
                        selected.eventTypeId,
                        host.eventTitle,
                        host.durationMinutes,
                      )}
                      relaxHorizon={true}
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
