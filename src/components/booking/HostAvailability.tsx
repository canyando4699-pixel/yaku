"use client";

import { useRef, useState } from "react";
import { HostScheduleHours } from "@/components/booking/HostScheduleHours";
import { useLocale } from "@/i18n/LocaleProvider";
import { defaultHostProfile } from "@/lib/booking/demo";
import { DE_HOLIDAY_IDS } from "@/lib/booking/holidays";
import {
  loadHostProfile,
  prepareHostProfileSave,
  saveHostProfile,
} from "@/lib/booking/hostProfile";
import { COMMON_TIMEZONES } from "@/lib/booking/slots";
import type { HostProfile } from "@/lib/booking/types";

const BUFFER_OPTIONS = [0, 5, 10, 15, 30] as const;
const NOTICE_OPTIONS = [0, 1, 2, 4, 12, 24, 48] as const;
const SERIES_MAX_OPTIONS = [2, 4, 6, 8, 12] as const;
const AVATAR_MAX_PX = 256;
const AVAIL_TABS = ["schedules", "calendars", "advanced"] as const;
type AvailTab = (typeof AVAIL_TABS)[number];

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
  const [tab, setTab] = useState<AvailTab>("schedules");
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
    const result = prepareHostProfileSave(draft);
    if (!result.ok) {
      setError(t[result.reason]);
      return;
    }
    const saved = saveHostProfile(result.profile);
    setDraft(saved);
    setError(null);
    setMessage(t.availabilitySaved);
    onSaved?.(saved);
  }

  const initial = draft.displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <form
      onSubmit={handleSave}
      className="office-dc-card p-6 md:p-7"
    >
      <h2 className="font-display text-2xl">{t.availabilityTitle}</h2>
      <p className="office-muted mt-2 text-sm">{t.availabilityHint}</p>

      {message ? (
        <p className="mt-4 rounded-[8px] bg-[#1f8f4e]/20 px-4 py-2 text-sm text-[#7ddea8]">
          {message}
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-[#ff453a]">{error}</p> : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {AVAIL_TABS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
            className={[
              "rounded-full px-3.5 py-2 text-sm font-medium transition",
              tab === id ? "office-liquid-glass" : "office-chip-idle",
            ].join(" ")}
          >
            {id === "schedules"
              ? t.availTabSchedules
              : id === "calendars"
                ? t.availTabCalendars
                : t.availTabAdvanced}
          </button>
        ))}
      </div>

      {tab === "schedules" ? (
        <>
      <HostScheduleHours
        weeklyHours={draft.weeklyHours}
        dateOverrides={draft.dateOverrides}
        onChangeWeekly={(weeklyHours) => {
          setDraft((p) => ({ ...p, weeklyHours }));
          setMessage(null);
          setError(null);
        }}
        onChangeOverrides={(dateOverrides) => {
          setDraft((p) => ({ ...p, dateOverrides }));
          setMessage(null);
          setError(null);
        }}
      />

      <label className="mt-6 office-field block text-sm">
        {t.displayNameLabel}
        <input
          value={draft.displayName}
          onChange={(e) => {
            setDraft((p) => ({ ...p, displayName: e.target.value }));
            setMessage(null);
          }}
          className="office-dc-input mt-1 w-full outline-none"
        />
      </label>

      <div className="mt-8 border-t border-white/10 pt-6">
        <h3 className="font-display text-xl">{t.businessCardTitle}</h3>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden ${draft.avatarShape === "square" ? "rounded-[8px]" : "rounded-full"} bg-[color:var(--office-nav-hover)] text-2xl font-medium text-[color:var(--office-text)] ring-1 ring-[color:var(--office-border)]`}>
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

        <fieldset className="mt-4">
          <legend className="office-field text-sm">{t.avatarShapeLabel}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setDraft((p) => ({ ...p, avatarShape: "round" }));
                setMessage(null);
              }}
              className={[
                "rounded-full px-3.5 py-2 text-sm font-medium transition",
                draft.avatarShape === "round"
                  ? "office-liquid-glass"
                  : "office-chip-idle",
              ].join(" ")}
            >
              {t.avatarShapeRound}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft((p) => ({ ...p, avatarShape: "square" }));
                setMessage(null);
              }}
              className={[
                "rounded-full px-3.5 py-2 text-sm font-medium transition",
                draft.avatarShape === "square"
                  ? "office-liquid-glass"
                  : "office-chip-idle",
              ].join(" ")}
            >
              {t.avatarShapeSquare}
            </button>
          </div>
        </fieldset>

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
            className="office-dc-input mt-1 w-full resize-none text-sm outline-none"
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
          className="office-dc-input mt-1 w-full outline-none"
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            className="office-dc-input mt-1 w-full outline-none"
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
            className="office-dc-input mt-1 w-full outline-none"
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
            className="office-dc-input mt-1 w-full outline-none"
          >
            {NOTICE_OPTIONS.map((h) => (
              <option key={h} value={h} className="office-option">
                {h === 0 ? t.noticeNone : `${h} h`}
              </option>
            ))}
          </select>
        </label>
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
            className="h-4 w-4 accent-[var(--office-text)]"
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
              className="office-dc-input mt-1 w-full outline-none"
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
        </>
      ) : tab === "calendars" ? (
        <div className="mt-6">
          <h3 className="font-display text-xl">{t.availTabCalendars}</h3>
          <p className="office-muted mt-2 text-sm">{t.availCalendarStub}</p>
        </div>
      ) : (
        <div className="mt-6">
          <label className="flex items-start gap-3 office-field text-sm">
            <input
              type="checkbox"
              checked={draft.holidayCalendarEnabled}
              onChange={(e) => {
                setDraft((p) => ({
                  ...p,
                  holidayCalendarEnabled: e.target.checked,
                }));
                setMessage(null);
              }}
              className="mt-0.5 h-4 w-4 accent-[var(--office-text)]"
            />
            <span>
              {t.holidayMasterLabel}
              <span className="office-muted mt-1 block text-xs font-normal">
                {t.holidayMasterHint}
              </span>
            </span>
          </label>
          <ul
            className={[
              "mt-4 space-y-2",
              draft.holidayCalendarEnabled ? "" : "opacity-50",
            ].join(" ")}
          >
            {DE_HOLIDAY_IDS.map((id) => (
              <li key={id}>
                <label className="flex items-center gap-3 office-field text-sm">
                  <input
                    type="checkbox"
                    disabled={!draft.holidayCalendarEnabled}
                    checked={draft.enabledHolidayIds.includes(id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setDraft((p) => ({
                        ...p,
                        enabledHolidayIds: checked
                          ? DE_HOLIDAY_IDS.filter(
                              (hid) =>
                                p.enabledHolidayIds.includes(hid) || hid === id,
                            )
                          : p.enabledHolidayIds.filter((hid) => hid !== id),
                      }));
                      setMessage(null);
                    }}
                    className="h-4 w-4 accent-[var(--office-text)]"
                  />
                  {t[`holidayName_${id}`]}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        className="office-dc-btn-gold mt-8"
      >
        {t.saveAvailability}
      </button>
    </form>
  );
}
