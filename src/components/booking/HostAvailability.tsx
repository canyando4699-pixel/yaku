"use client";

import { useEffect, useMemo, useState } from "react";
import { IslandButton } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import { defaultHostProfile } from "@/lib/booking/demo";
import {
  loadHostProfile,
  saveHostProfile,
} from "@/lib/booking/hostProfile";
import { COMMON_TIMEZONES, formatMinutesAsTime } from "@/lib/booking/slots";
import type { EventType, HostProfile } from "@/lib/booking/types";

const DURATION_OPTIONS = [15, 30, 45, 60] as const;
const BUFFER_OPTIONS = [0, 5, 10, 15, 30] as const;
const NOTICE_OPTIONS = [0, 1, 2, 4, 12, 24, 48] as const;
const DAILY_MAX_OPTIONS = [0, 2, 4, 6, 8, 12] as const;
const SERIES_MAX_OPTIONS = [2, 4, 6, 8, 12] as const;
/** Mon→Sun display order with JS getDay values */
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

function timeOptions() {
  const options: number[] = [];
  for (let m = 0; m <= 24 * 60; m += 30) options.push(m);
  return options;
}

type HostAvailabilityProps = {
  slug?: string;
  onSaved?: (profile: HostProfile) => void;
};

export function HostAvailability({
  slug = defaultHostProfile.slug,
  onSaved,
}: HostAvailabilityProps) {
  const { t } = useLocale();
  const [draft, setDraft] = useState<HostProfile>(() => loadHostProfile(slug));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(loadHostProfile(slug));
  }, [slug]);

  const times = useMemo(() => timeOptions(), []);

  function toggleWeekday(day: number) {
    setDraft((prev) => {
      const has = prev.weekdays.includes(day);
      const weekdays = has
        ? prev.weekdays.filter((d) => d !== day)
        : [...prev.weekdays, day].sort((a, b) => a - b);
      return { ...prev, weekdays };
    });
    setMessage(null);
    setError(null);
  }

  function updateEventType(id: string, patch: Partial<EventType>) {
    setDraft((prev) => ({
      ...prev,
      eventTypes: prev.eventTypes.map((et) =>
        et.id === id ? { ...et, ...patch } : et,
      ),
    }));
    setMessage(null);
  }

  function addEventType() {
    setDraft((prev) => ({
      ...prev,
      eventTypes: [
        ...prev.eventTypes,
        {
          id: `et_${Date.now().toString(36)}`,
          title: t.eventTypeDefaultTitle,
          durationMinutes: 30,
        },
      ],
    }));
    setMessage(null);
  }

  function removeEventType(id: string) {
    setDraft((prev) => ({
      ...prev,
      eventTypes:
        prev.eventTypes.length <= 1
          ? prev.eventTypes
          : prev.eventTypes.filter((et) => et.id !== id),
    }));
    setMessage(null);
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (draft.weekdays.length === 0) {
      setError(t.needOneWeekday);
      return;
    }
    if (draft.windowEndMinutes <= draft.windowStartMinutes) {
      setError(t.invalidWindow);
      return;
    }
    if (draft.eventTypes.length === 0) {
      setError(t.needOneEventType);
      return;
    }
    const saved = saveHostProfile({
      ...draft,
      durationMinutes: draft.eventTypes[0]?.durationMinutes ?? draft.durationMinutes,
      eventTitle: draft.eventTypes[0]?.title ?? draft.eventTitle,
    });
    setDraft(saved);
    setError(null);
    setMessage(t.availabilitySaved);
    onSaved?.(saved);
  }

  return (
    <form
      onSubmit={handleSave}
      className="rounded-[2rem] bg-[#111111] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] md:p-7"
    >
      <h2 className="font-display text-2xl text-white">{t.availabilityTitle}</h2>
      <p className="mt-2 text-sm text-white/55">{t.availabilityHint}</p>

      {message ? (
        <p className="mt-4 rounded-full bg-[#1f8f4e]/20 px-4 py-2 text-sm text-[#7ddea8]">
          {message}
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-[#ff453a]">{error}</p> : null}

      <label className="mt-6 block text-sm text-white/80">
        {t.displayNameLabel}
        <input
          value={draft.displayName}
          onChange={(e) => {
            setDraft((p) => ({ ...p, displayName: e.target.value }));
            setMessage(null);
          }}
          className="mt-1 w-full rounded-full border-0 bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-accent"
        />
      </label>

      <label className="mt-4 block text-sm text-white/80">
        {t.hostTimezoneLabel}
        <select
          value={draft.timezone}
          onChange={(e) => {
            setDraft((p) => ({ ...p, timezone: e.target.value }));
            setMessage(null);
          }}
          className="mt-1 w-full rounded-full border-0 bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-accent"
        >
          {[draft.timezone, ...COMMON_TIMEZONES]
            .filter((tz, i, arr) => arr.indexOf(tz) === i)
            .map((tz) => (
              <option key={tz} value={tz} className="bg-[#111111]">
                {tz}
              </option>
            ))}
        </select>
      </label>

      <fieldset className="mt-6">
        <legend className="text-sm text-white/80">{t.weekdaysLabel}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {WEEKDAY_ORDER.map((day) => {
            const active = draft.weekdays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleWeekday(day)}
                className={[
                  "rounded-full px-3.5 py-2 text-sm font-medium transition",
                  active
                    ? "bg-accent text-white"
                    : "bg-white/10 text-white/70 ring-1 ring-white/10 hover:bg-white/15",
                ].join(" ")}
              >
                {t.weekdayNames[day]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-white/80">
          {t.windowStartLabel}
          <select
            value={draft.windowStartMinutes}
            onChange={(e) => {
              setDraft((p) => ({
                ...p,
                windowStartMinutes: Number(e.target.value),
              }));
              setMessage(null);
            }}
            className="mt-1 w-full rounded-full border-0 bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-accent"
          >
            {times
              .filter((m) => m < 24 * 60)
              .map((m) => (
                <option key={m} value={m} className="bg-[#111111]">
                  {formatMinutesAsTime(m)}
                </option>
              ))}
          </select>
        </label>

        <label className="block text-sm text-white/80">
          {t.windowEndLabel}
          <select
            value={draft.windowEndMinutes}
            onChange={(e) => {
              setDraft((p) => ({
                ...p,
                windowEndMinutes: Number(e.target.value),
              }));
              setMessage(null);
            }}
            className="mt-1 w-full rounded-full border-0 bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-accent"
          >
            {times
              .filter((m) => m > 0)
              .map((m) => (
                <option key={m} value={m} className="bg-[#111111]">
                  {formatMinutesAsTime(m)}
                </option>
              ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm text-white/80">
          {t.bufferBeforeLabel}
          <select
            value={draft.bufferBeforeMinutes}
            onChange={(e) => {
              setDraft((p) => ({
                ...p,
                bufferBeforeMinutes: Number(e.target.value),
              }));
              setMessage(null);
            }}
            className="mt-1 w-full rounded-full border-0 bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-accent"
          >
            {BUFFER_OPTIONS.map((m) => (
              <option key={m} value={m} className="bg-[#111111]">
                {m} min
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-white/80">
          {t.bufferAfterLabel}
          <select
            value={draft.bufferAfterMinutes}
            onChange={(e) => {
              setDraft((p) => ({
                ...p,
                bufferAfterMinutes: Number(e.target.value),
              }));
              setMessage(null);
            }}
            className="mt-1 w-full rounded-full border-0 bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-accent"
          >
            {BUFFER_OPTIONS.map((m) => (
              <option key={m} value={m} className="bg-[#111111]">
                {m} min
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-white/80">
          {t.minNoticeLabel}
          <select
            value={draft.minNoticeHours}
            onChange={(e) => {
              setDraft((p) => ({
                ...p,
                minNoticeHours: Number(e.target.value),
              }));
              setMessage(null);
            }}
            className="mt-1 w-full rounded-full border-0 bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-accent"
          >
            {NOTICE_OPTIONS.map((h) => (
              <option key={h} value={h} className="bg-[#111111]">
                {h === 0 ? t.noticeNone : `${h} h`}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-white/80">
          {t.maxPerDayLabel}
          <select
            value={draft.maxBookingsPerDay}
            onChange={(e) => {
              setDraft((p) => ({
                ...p,
                maxBookingsPerDay: Number(e.target.value),
              }));
              setMessage(null);
            }}
            className="mt-1 w-full rounded-full border-0 bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-accent"
          >
            {DAILY_MAX_OPTIONS.map((n) => (
              <option key={n} value={n} className="bg-[#111111]">
                {n === 0 ? t.unlimited : String(n)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl">{t.eventTypesTitle}</h3>
          <button
            type="button"
            onClick={addEventType}
            className="rounded-full bg-white/10 px-3.5 py-2 text-sm text-white/85 ring-1 ring-white/10 hover:bg-white/15"
          >
            {t.addEventType}
          </button>
        </div>
        <p className="mt-1 text-sm text-white/50">{t.eventTypesHint}</p>
        <ul className="mt-4 space-y-3">
          {draft.eventTypes.map((et) => (
            <li
              key={et.id}
              className="grid gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 sm:grid-cols-[1fr_120px_auto]"
            >
              <input
                value={et.title}
                onChange={(e) => updateEventType(et.id, { title: e.target.value })}
                className="rounded-full border-0 bg-white/10 px-4 py-2.5 text-white outline-none ring-1 ring-white/10 focus:ring-accent"
                aria-label={t.eventTitleLabel}
              />
              <select
                value={et.durationMinutes}
                onChange={(e) =>
                  updateEventType(et.id, {
                    durationMinutes: Number(e.target.value),
                  })
                }
                className="rounded-full border-0 bg-white/10 px-3 py-2.5 text-white outline-none ring-1 ring-white/10 focus:ring-accent"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d} className="bg-[#111111]">
                    {d} min
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeEventType(et.id)}
                disabled={draft.eventTypes.length <= 1}
                className="rounded-full px-3 py-2 text-sm text-white/60 hover:bg-white/10 disabled:opacity-30"
              >
                {t.removeEventType}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <label className="flex items-center gap-3 text-sm text-white/80">
          <input
            type="checkbox"
            checked={draft.allowSeries}
            onChange={(e) => {
              setDraft((p) => ({ ...p, allowSeries: e.target.checked }));
              setMessage(null);
            }}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          {t.allowSeriesLabel}
        </label>
        {draft.allowSeries ? (
          <label className="mt-4 block max-w-xs text-sm text-white/80">
            {t.maxSeriesLabel}
            <select
              value={draft.maxSeriesCount}
              onChange={(e) => {
                setDraft((p) => ({
                  ...p,
                  maxSeriesCount: Number(e.target.value),
                }));
                setMessage(null);
              }}
              className="mt-1 w-full rounded-full border-0 bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-accent"
            >
              {SERIES_MAX_OPTIONS.map((n) => (
                <option key={n} value={n} className="bg-[#111111]">
                  {n}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <IslandButton type="submit" variant="accent" size="lg" className="mt-8">
        {t.saveAvailability}
      </IslandButton>
    </form>
  );
}
