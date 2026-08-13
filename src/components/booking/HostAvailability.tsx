"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { defaultHostProfile } from "@/lib/booking/demo";
import {
  createEventType,
  loadHostProfile,
  saveHostProfile,
} from "@/lib/booking/hostProfile";
import {
  MAX_INVITEE_QUESTIONS,
  createInviteeQuestion,
} from "@/lib/booking/questions";
import { COMMON_TIMEZONES, formatMinutesAsTime } from "@/lib/booking/slots";
import {
  EVENT_TYPE_COLORS,
  EVENT_TYPE_PASTELS,
  type EventType,
  type EventTypeColor,
  type HostProfile,
  type InviteeQuestionType,
} from "@/lib/booking/types";

const DURATION_OPTIONS = [15, 30, 45, 60] as const;
const BUFFER_OPTIONS = [0, 5, 10, 15, 30] as const;
const NOTICE_OPTIONS = [0, 1, 2, 4, 12, 24, 48] as const;
const DAILY_MAX_OPTIONS = [0, 2, 4, 6, 8, 12] as const;
const INCREMENT_OPTIONS = [10, 15, 30] as const;
const DATE_RANGE_OPTIONS = [0, 14, 30, 60] as const;
const SERIES_MAX_OPTIONS = [2, 4, 6, 8, 12] as const;
const COLOR_LABEL: Record<EventTypeColor, "colorBlue" | "colorPurple" | "colorGreen" | "colorOrange" | "colorRed"> = {
  blue: "colorBlue",
  purple: "colorPurple",
  green: "colorGreen",
  orange: "colorOrange",
  red: "colorRed",
};
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
  const [copiedTypeId, setCopiedTypeId] = useState<string | null>(null);
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
        createEventType(t.eventTypeDefaultTitle, 30),
      ],
    }));
    setMessage(null);
  }

  async function copyTypeLink(id: string) {
    const url = `${window.location.origin}/b/${draft.slug}?type=${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedTypeId(id);
      window.setTimeout(() => setCopiedTypeId(null), 1600);
    } catch {
      /* ignore */
    }
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
            className="office-dc-input mt-1 w-full outline-none"
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
            className="office-dc-input mt-1 w-full outline-none"
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
              className="office-subcard space-y-3 rounded-2xl p-3"
            >
              <div>
                <p className="office-field text-sm">{t.eventTypeColorLabel}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EVENT_TYPE_COLORS.map((color) => {
                    const pastel = EVENT_TYPE_PASTELS[color];
                    const selected = et.color === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        aria-label={t[COLOR_LABEL[color]]}
                        onClick={() => updateEventType(et.id, { color })}
                        className="h-7 w-7 rounded-full"
                        style={{
                          backgroundColor: pastel.bg,
                          boxShadow: selected
                            ? `0 0 0 2px ${pastel.border}`
                            : `0 0 0 1px ${pastel.border}66`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <input
                value={et.title}
                onChange={(e) => updateEventType(et.id, { title: e.target.value })}
                className="office-dc-input w-full outline-none"
                aria-label={t.eventTitleLabel}
              />
              <label className="office-field block text-sm">
                {t.eventTypeDescriptionLabel}
                <textarea
                  value={et.description}
                  maxLength={400}
                  rows={2}
                  onChange={(e) =>
                    updateEventType(et.id, { description: e.target.value })
                  }
                  className="office-dc-input mt-1 w-full resize-none text-sm outline-none"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="office-field block text-sm">
                  {t.durationLabel}
                  <select
                    value={et.durationMinutes}
                    onChange={(e) => {
                      const durationMinutes = Number(e.target.value);
                      const patch: Partial<EventType> = { durationMinutes };
                      if (et.slotIncrementMinutes > durationMinutes) {
                        const next =
                          ([30, 15, 10] as const).find(
                            (n) => n <= durationMinutes,
                          ) ?? 10;
                        patch.slotIncrementMinutes = next;
                      }
                      updateEventType(et.id, patch);
                    }}
                    className="office-dc-input mt-1 w-full outline-none"
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d} className="office-option">
                        {d} min
                      </option>
                    ))}
                  </select>
                </label>
                <label className="office-field block text-sm">
                  {t.eventTypeSlotIncrementLabel}
                  <select
                    value={et.slotIncrementMinutes}
                    onChange={(e) =>
                      updateEventType(et.id, {
                        slotIncrementMinutes: Number(e.target.value) as
                          | 10
                          | 15
                          | 30,
                      })
                    }
                    className="office-dc-input mt-1 w-full outline-none"
                  >
                    {INCREMENT_OPTIONS.filter((n) => n <= et.durationMinutes).map(
                      (n) => (
                        <option key={n} value={n} className="office-option">
                          {n} min
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>
              <label className="office-field block text-sm">
                {t.eventTypeDateRangeLabel}
                <select
                  value={et.dateRangeDays}
                  onChange={(e) =>
                    updateEventType(et.id, {
                      dateRangeDays: Number(e.target.value) as 0 | 14 | 30 | 60,
                    })
                  }
                  className="office-dc-input mt-1 w-full outline-none"
                >
                  {DATE_RANGE_OPTIONS.map((n) => (
                    <option key={n} value={n} className="office-option">
                      {n === 0
                        ? t.dateRangeIndefinite
                        : t.dateRangeDays.replace("{n}", String(n))}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="office-field block text-sm">
                  {t.eventTypeMaxPerDayLabel}
                  <select
                    value={et.maxBookingsPerDay}
                    onChange={(e) =>
                      updateEventType(et.id, {
                        maxBookingsPerDay: Number(e.target.value),
                      })
                    }
                    className="office-dc-input mt-1 w-full outline-none"
                  >
                    {DAILY_MAX_OPTIONS.map((n) => (
                      <option key={n} value={n} className="office-option">
                        {n === 0 ? t.unlimited : String(n)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="office-field block text-sm">
                  {t.eventTypeMaxPerWeekLabel}
                  <select
                    value={et.maxBookingsPerWeek}
                    onChange={(e) =>
                      updateEventType(et.id, {
                        maxBookingsPerWeek: Number(e.target.value),
                      })
                    }
                    className="office-dc-input mt-1 w-full outline-none"
                  >
                    {DAILY_MAX_OPTIONS.map((n) => (
                      <option key={n} value={n} className="office-option">
                        {n === 0 ? t.unlimited : String(n)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="office-field block text-sm">
                  {t.eventTypeMaxPerMonthLabel}
                  <select
                    value={et.maxBookingsPerMonth}
                    onChange={(e) =>
                      updateEventType(et.id, {
                        maxBookingsPerMonth: Number(e.target.value),
                      })
                    }
                    className="office-dc-input mt-1 w-full outline-none"
                  >
                    {DAILY_MAX_OPTIONS.map((n) => (
                      <option key={n} value={n} className="office-option">
                        {n === 0 ? t.unlimited : String(n)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="office-field block text-sm">
                {t.eventTypeCancelPolicyLabel}
                <textarea
                  value={et.cancellationPolicy}
                  maxLength={400}
                  rows={3}
                  onChange={(e) =>
                    updateEventType(et.id, {
                      cancellationPolicy: e.target.value,
                    })
                  }
                  className="office-dc-input mt-1 w-full resize-none text-sm outline-none"
                />
                <span className="office-muted mt-1 block text-xs">
                  {t.eventTypeCancelPolicyHint}
                </span>
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="office-field text-sm">{t.inviteeQuestionsTitle}</p>
                  <button
                    type="button"
                    disabled={et.questions.length >= MAX_INVITEE_QUESTIONS}
                    onClick={() => {
                      if (et.questions.length >= MAX_INVITEE_QUESTIONS) return;
                      updateEventType(et.id, {
                        questions: [
                          ...et.questions,
                          createInviteeQuestion("text"),
                        ],
                      });
                    }}
                    className="office-chip-idle rounded-full px-3.5 py-2 text-sm disabled:opacity-30"
                  >
                    {t.addQuestion}
                  </button>
                </div>
                {et.questions.map((q) => (
                  <div key={q.id} className="space-y-3">
                    <label className="office-field block text-sm">
                      {t.questionLabel}
                      <input
                        value={q.label}
                        onChange={(e) =>
                          updateEventType(et.id, {
                            questions: et.questions.map((item) =>
                              item.id === q.id
                                ? { ...item, label: e.target.value }
                                : item,
                            ),
                          })
                        }
                        className="office-dc-input mt-1 w-full outline-none"
                      />
                    </label>
                    <label className="office-field block text-sm">
                      {t.questionType}
                      <select
                        value={q.type}
                        onChange={(e) => {
                          const type = e.target.value as InviteeQuestionType;
                          let options = q.options;
                          if (type === "radio" || type === "dropdown") {
                            options = [...options];
                            while (options.length < 2) options.push("");
                          } else if (type === "checkbox") {
                            options =
                              options.length < 1 ? [""] : [...options];
                          } else {
                            options = [];
                          }
                          updateEventType(et.id, {
                            questions: et.questions.map((item) =>
                              item.id === q.id
                                ? { ...item, type, options }
                                : item,
                            ),
                          });
                        }}
                        className="office-dc-input mt-1 w-full outline-none"
                      >
                        <option value="text" className="office-option">
                          {t.questionTypeText}
                        </option>
                        <option value="textarea" className="office-option">
                          {t.questionTypeTextarea}
                        </option>
                        <option value="phone" className="office-option">
                          {t.questionTypePhone}
                        </option>
                        <option value="radio" className="office-option">
                          {t.questionTypeRadio}
                        </option>
                        <option value="checkbox" className="office-option">
                          {t.questionTypeCheckbox}
                        </option>
                        <option value="dropdown" className="office-option">
                          {t.questionTypeDropdown}
                        </option>
                      </select>
                    </label>
                    <label className="flex items-start gap-3 office-field text-sm">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) =>
                          updateEventType(et.id, {
                            questions: et.questions.map((item) =>
                              item.id === q.id
                                ? { ...item, required: e.target.checked }
                                : item,
                            ),
                          })
                        }
                        className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
                      />
                      {t.questionRequired}
                    </label>
                    {q.type === "radio" ||
                    q.type === "checkbox" ||
                    q.type === "dropdown" ? (
                      <div className="space-y-2">
                        <p className="office-field text-sm">
                          {t.questionOptions}
                        </p>
                        {q.options.map((opt, i) => (
                          <input
                            key={`${q.id}-${i}`}
                            value={opt}
                            onChange={(e) => {
                              const options = q.options.slice();
                              options[i] = e.target.value;
                              updateEventType(et.id, {
                                questions: et.questions.map((item) =>
                                  item.id === q.id
                                    ? { ...item, options }
                                    : item,
                                ),
                              });
                            }}
                            className="office-dc-input w-full outline-none"
                          />
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            updateEventType(et.id, {
                              questions: et.questions.map((item) =>
                                item.id === q.id
                                  ? {
                                      ...item,
                                      options: [...item.options, ""],
                                    }
                                  : item,
                              ),
                            })
                          }
                          className="office-chip-idle rounded-full px-3.5 py-2 text-sm"
                        >
                          {t.addOption}
                        </button>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        updateEventType(et.id, {
                          questions: et.questions.filter(
                            (item) => item.id !== q.id,
                          ),
                        })
                      }
                      className="office-muted rounded-full px-3 py-2 text-sm hover:bg-[color:var(--office-nav-hover)] disabled:opacity-30"
                    >
                      {t.removeEventType}
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex items-start gap-3 office-field text-sm">
                <input
                  type="checkbox"
                  checked={et.secret}
                  onChange={(e) =>
                    updateEventType(et.id, { secret: e.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
                />
                <span>
                  {t.eventTypeSecretLabel}
                  <span className="office-muted mt-1 block text-xs font-normal">
                    {t.eventTypeSecretHint}
                  </span>
                </span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void copyTypeLink(et.id)}
                  className="office-chip-idle rounded-full px-3.5 py-2 text-sm"
                >
                  {copiedTypeId === et.id
                    ? t.eventTypeLinkCopied
                    : t.eventTypeCopyLink}
                </button>
                <button
                  type="button"
                  onClick={() => removeEventType(et.id)}
                  disabled={draft.eventTypes.length <= 1}
                  className="office-muted rounded-full px-3 py-2 text-sm hover:bg-[color:var(--office-nav-hover)] disabled:opacity-30"
                >
                  {t.removeEventType}
                </button>
              </div>
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

      <button
        type="submit"
        className="office-dc-btn-gold mt-8"
      >
        {t.saveAvailability}
      </button>
    </form>
  );
}
