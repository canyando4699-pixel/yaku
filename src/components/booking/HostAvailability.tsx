"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { OfficeChaseRing } from "@/components/booking/OfficeChaseRing";
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
const AVATAR_MAX_PX = 256;

function timeOptions() {
  const options: number[] = [];
  for (let m = 0; m <= 24 * 60; m += 30) options.push(m);
  return options;
}

function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("image failed"));
      img.onload = () => {
        const scale = Math.min(
          1,
          AVATAR_MAX_PX / Math.max(img.width, img.height),
        );
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas failed"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
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
  const avatarInputRef = useRef<HTMLInputElement>(null);

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

  async function handleAvatarChange(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setDraft((p) => ({ ...p, avatarDataUrl: dataUrl }));
      setMessage(null);
      setError(null);
    } catch {
      /* ignore unreadable images */
    }
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

  const initial = draft.displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <form
      onSubmit={handleSave}
      className="office-form office-ringed p-6 md:p-7"
    >
      <OfficeChaseRing />
      <div className="relative z-[1]">
      <h2 className="font-display text-2xl">{t.availabilityTitle}</h2>
      <p className="office-muted mt-2 text-sm">{t.availabilityHint}</p>

      {message ? (
        <p className="mt-4 rounded-full bg-[#1f8f4e]/20 px-4 py-2 text-sm text-[#7ddea8]">
          {message}
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-[#ff453a]">{error}</p> : null}

      <label className="mt-6 office-field block text-sm">
        {t.displayNameLabel}
        <input
          value={draft.displayName}
          onChange={(e) => {
            setDraft((p) => ({ ...p, displayName: e.target.value }));
            setMessage(null);
          }}
          className="office-input mt-1 w-full rounded-full border-0 px-4 py-3 outline-none ring-1 focus:ring-accent"
        />
      </label>

      <div className="mt-8 border-t border-white/10 pt-6">
        <h3 className="font-display text-xl">{t.businessCardTitle}</h3>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[color:var(--office-nav-hover)] text-2xl font-medium text-[color:var(--office-text)] ring-1 ring-[color:var(--office-border)]">
            {draft.avatarDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.avatarDataUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span aria-hidden>{initial}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label={t.avatarLabel}
              onChange={(e) => {
                void handleAvatarChange(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="office-chip-idle rounded-full px-3.5 py-2 text-sm"
            >
              {t.uploadAvatar}
            </button>
            {draft.avatarDataUrl ? (
              <button
                type="button"
                onClick={() => {
                  setDraft((p) => ({ ...p, avatarDataUrl: "" }));
                  setMessage(null);
                }}
                className="office-muted rounded-full px-3 py-2 text-sm hover:bg-[color:var(--office-nav-hover)]"
              >
                {t.removeAvatar}
              </button>
            ) : null}
          </div>
        </div>

        <label className="mt-4 office-field block text-sm">
          {t.bioLabel}
          <textarea
            value={draft.bio}
            maxLength={400}
            rows={4}
            onChange={(e) => {
              setDraft((p) => ({ ...p, bio: e.target.value }));
              setMessage(null);
            }}
            className="office-input mt-1 w-full resize-none rounded-[1rem] border-0 px-4 py-3 text-sm outline-none ring-1 focus:ring-accent"
          />
        </label>
      </div>

      <label className="mt-4 office-field block text-sm">
        {t.hostTimezoneLabel}
        <select
          value={draft.timezone}
          onChange={(e) => {
            setDraft((p) => ({ ...p, timezone: e.target.value }));
            setMessage(null);
          }}
          className="office-input mt-1 w-full rounded-full border-0 px-4 py-3 outline-none ring-1 focus:ring-accent"
        >
          {[draft.timezone, ...COMMON_TIMEZONES]
            .filter((tz, i, arr) => arr.indexOf(tz) === i)
            .map((tz) => (
              <option key={tz} value={tz} className="office-option">
                {tz}
              </option>
            ))}
        </select>
      </label>

      <fieldset className="mt-6">
        <legend className="office-field text-sm">{t.weekdaysLabel}</legend>
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
                  active ? "office-liquid-glass" : "office-chip-idle",
                ].join(" ")}
              >
                {t.weekdayNames[day]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="office-field block text-sm">
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
            className="office-input mt-1 w-full rounded-full border-0 px-4 py-3 outline-none ring-1 focus:ring-accent"
          >
            {times
              .filter((m) => m < 24 * 60)
              .map((m) => (
                <option key={m} value={m} className="office-option">
                  {formatMinutesAsTime(m)}
                </option>
              ))}
          </select>
        </label>

        <label className="office-field block text-sm">
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
            className="office-input mt-1 w-full rounded-full border-0 px-4 py-3 outline-none ring-1 focus:ring-accent"
          >
            {times
              .filter((m) => m > 0)
              .map((m) => (
                <option key={m} value={m} className="office-option">
                  {formatMinutesAsTime(m)}
                </option>
              ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="office-field block text-sm">
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
            className="office-input mt-1 w-full rounded-full border-0 px-4 py-3 outline-none ring-1 focus:ring-accent"
          >
            {BUFFER_OPTIONS.map((m) => (
              <option key={m} value={m} className="office-option">
                {m} min
              </option>
            ))}
          </select>
        </label>
        <label className="office-field block text-sm">
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
            className="office-input mt-1 w-full rounded-full border-0 px-4 py-3 outline-none ring-1 focus:ring-accent"
          >
            {BUFFER_OPTIONS.map((m) => (
              <option key={m} value={m} className="office-option">
                {m} min
              </option>
            ))}
          </select>
        </label>
        <label className="office-field block text-sm">
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
            className="office-input mt-1 w-full rounded-full border-0 px-4 py-3 outline-none ring-1 focus:ring-accent"
          >
            {NOTICE_OPTIONS.map((h) => (
              <option key={h} value={h} className="office-option">
                {h === 0 ? t.noticeNone : `${h} h`}
              </option>
            ))}
          </select>
        </label>
        <label className="office-field block text-sm">
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
            className="office-input mt-1 w-full rounded-full border-0 px-4 py-3 outline-none ring-1 focus:ring-accent"
          >
            {DAILY_MAX_OPTIONS.map((n) => (
              <option key={n} value={n} className="office-option">
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
            className="office-chip-idle rounded-full px-3.5 py-2 text-sm"
          >
            {t.addEventType}
          </button>
        </div>
        <p className="office-muted mt-1 text-sm">{t.eventTypesHint}</p>
        <ul className="mt-4 space-y-3">
          {draft.eventTypes.map((et) => (
            <li
              key={et.id}
              className="office-subcard grid gap-3 rounded-2xl p-3 sm:grid-cols-[1fr_120px_auto]"
            >
              <input
                value={et.title}
                onChange={(e) => updateEventType(et.id, { title: e.target.value })}
                className="office-input rounded-full border-0 px-4 py-2.5 outline-none ring-1 focus:ring-accent"
                aria-label={t.eventTitleLabel}
              />
              <select
                value={et.durationMinutes}
                onChange={(e) =>
                  updateEventType(et.id, {
                    durationMinutes: Number(e.target.value),
                  })
                }
                className="office-input rounded-full border-0 px-3 py-2.5 outline-none ring-1 focus:ring-accent"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d} className="office-option">
                    {d} min
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeEventType(et.id)}
                disabled={draft.eventTypes.length <= 1}
                className="office-muted rounded-full px-3 py-2 text-sm hover:bg-[color:var(--office-nav-hover)] disabled:opacity-30"
              >
                {t.removeEventType}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <label className="flex items-center gap-3 office-field text-sm">
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
          <label className="mt-4 block max-w-xs office-field text-sm">
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
              className="office-input mt-1 w-full rounded-full border-0 px-4 py-3 outline-none ring-1 focus:ring-accent"
            >
              {SERIES_MAX_OPTIONS.map((n) => (
                <option key={n} value={n} className="office-option">
                  {n}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <IslandButton
        type="submit"
        variant="island"
        size="lg"
        className="office-glass-btn mt-8"
      >
        {t.saveAvailability}
      </IslandButton>
      </div>
    </form>
  );
}
