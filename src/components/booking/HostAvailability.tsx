"use client";

import { useEffect, useMemo, useState } from "react";
import { IslandButton } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import { defaultHostProfile } from "@/lib/booking/demo";
import {
  loadHostProfile,
  saveHostProfile,
} from "@/lib/booking/hostProfile";
import { formatMinutesAsTime } from "@/lib/booking/slots";
import type { HostProfile } from "@/lib/booking/types";

const DURATION_OPTIONS = [15, 30, 45, 60] as const;
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
    const saved = saveHostProfile(draft);
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
        {t.eventTitleLabel}
        <input
          value={draft.eventTitle}
          onChange={(e) => {
            setDraft((p) => ({ ...p, eventTitle: e.target.value }));
            setMessage(null);
          }}
          className="mt-1 w-full rounded-full border-0 bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-accent"
        />
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

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
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

        <label className="block text-sm text-white/80">
          {t.durationLabel}
          <select
            value={draft.durationMinutes}
            onChange={(e) => {
              setDraft((p) => ({
                ...p,
                durationMinutes: Number(e.target.value),
              }));
              setMessage(null);
            }}
            className="mt-1 w-full rounded-full border-0 bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-accent"
          >
            {DURATION_OPTIONS.map((d) => (
              <option key={d} value={d} className="bg-[#111111]">
                {d} min
              </option>
            ))}
          </select>
        </label>
      </div>

      <IslandButton type="submit" variant="accent" size="lg" className="mt-8">
        {t.saveAvailability}
      </IslandButton>
    </form>
  );
}
