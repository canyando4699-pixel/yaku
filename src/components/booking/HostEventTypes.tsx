"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { defaultHostProfile } from "@/lib/booking/demo";
import {
  createEventType,
  loadHostProfile,
  prepareHostProfileSave,
  saveHostProfile,
} from "@/lib/booking/hostProfile";
import {
  MAX_INVITEE_QUESTIONS,
  createInviteeQuestion,
} from "@/lib/booking/questions";
import {
  EVENT_TYPE_COLORS,
  EVENT_TYPE_PASTELS,
  type EventType,
  type EventTypeColor,
  type HostProfile,
  type InviteeQuestionType,
} from "@/lib/booking/types";

const DURATION_OPTIONS = [15, 30, 45, 60] as const;
const DAILY_MAX_OPTIONS = [0, 2, 4, 6, 8, 12] as const;
const INCREMENT_OPTIONS = [10, 15, 30] as const;
const DATE_RANGE_OPTIONS = [0, 14, 30, 60] as const;
const COLOR_LABEL: Record<EventTypeColor, "colorBlue" | "colorPurple" | "colorGreen" | "colorOrange" | "colorRed"> = {
  blue: "colorBlue",
  purple: "colorPurple",
  green: "colorGreen",
  orange: "colorOrange",
  red: "colorRed",
};

type HostEventTypesProps = {
  slug?: string;
  onSaved?: (profile: HostProfile) => void;
  spawnEventTypeKey?: number;
  onSpawnHandled?: () => void;
};

export function HostEventTypes({
  slug = defaultHostProfile.slug,
  onSaved,
  spawnEventTypeKey = 0,
  onSpawnHandled,
}: HostEventTypesProps) {
  const { t } = useLocale();
  const [draft, setDraft] = useState<HostProfile>(() => loadHostProfile(slug));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedTypeId, setCopiedTypeId] = useState<string | null>(null);
  const spawnHandledRef = useRef(0);

  useEffect(() => {
    if (spawnEventTypeKey === 0) {
      spawnHandledRef.current = 0;
      return;
    }
    if (spawnHandledRef.current === spawnEventTypeKey) return;
    spawnHandledRef.current = spawnEventTypeKey;
    setDraft((prev) => ({
      ...prev,
      eventTypes: [
        ...prev.eventTypes,
        createEventType(t.eventTypeDefaultTitle, 30),
      ],
    }));
    setMessage(null);
    onSpawnHandled?.();
  }, [onSpawnHandled, spawnEventTypeKey, t.eventTypeDefaultTitle]);

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

  return (
    <form
      onSubmit={handleSave}
      className="office-dc-card p-6 md:p-7"
    >
      <h2 className="font-display text-2xl">{t.eventTypesTitle}</h2>
      <p className="office-muted mt-2 text-sm">{t.eventTypesHint}</p>

      {message ? (
        <p className="mt-4 rounded-[8px] bg-[#1f8f4e]/20 px-4 py-2 text-sm text-[#7ddea8]">
          {message}
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-[#ff453a]">{error}</p> : null}

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
                        className="mt-0.5 h-4 w-4 accent-[var(--office-text)]"
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
                  className="mt-0.5 h-4 w-4 accent-[var(--office-text)]"
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

      <button
        type="submit"
        className="office-dc-btn-gold mt-8"
      >
        {t.saveAvailability}
      </button>
    </form>
  );
}
