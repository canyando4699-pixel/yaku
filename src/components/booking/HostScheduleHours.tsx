"use client";

import { useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { toYmd } from "@/lib/booking/holidays";
import { formatMinutesAsTime } from "@/lib/booking/slots";
import {
  MAX_DATE_OVERRIDES,
  MAX_INTERVALS_PER_DAY,
  YMD_RE,
  type DateOverride,
  type DateOverrideKind,
  type TimeInterval,
  type WeeklyHours,
} from "@/lib/booking/types";

/** Mon→Sun display order with JS getDay values */
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
const DEFAULT_INTERVAL: TimeInterval = {
  startMinutes: 540,
  endMinutes: 1020,
};

function timeOptions() {
  const options: number[] = [];
  for (let m = 0; m <= 24 * 60; m += 30) options.push(m);
  return options;
}

const TIMES = timeOptions();

function IntervalEditor({
  intervals,
  onChange,
  minCount = 0,
}: {
  intervals: TimeInterval[];
  onChange: (next: TimeInterval[]) => void;
  minCount?: number;
}) {
  const { t } = useLocale();

  function patch(index: number, field: keyof TimeInterval, value: number) {
    onChange(
      intervals.map((iv, i) => (i === index ? { ...iv, [field]: value } : iv)),
    );
  }

  function addInterval() {
    if (intervals.length >= MAX_INTERVALS_PER_DAY) return;
    onChange([...intervals, { ...DEFAULT_INTERVAL }]);
  }

  return (
    <div className="mt-2 space-y-2">
      {intervals.map((iv, index) => (
        <div key={index} className="flex flex-wrap items-end gap-2">
          <label className="office-field block text-sm">
            {t.windowStartLabel}
            <select
              value={iv.startMinutes}
              onChange={(e) =>
                patch(index, "startMinutes", Number(e.target.value))
              }
              className="office-dc-input mt-1 w-full outline-none"
            >
              {TIMES.filter((m) => m < 24 * 60).map((m) => (
                <option key={m} value={m} className="office-option">
                  {formatMinutesAsTime(m)}
                </option>
              ))}
            </select>
          </label>
          <label className="office-field block text-sm">
            {t.windowEndLabel}
            <select
              value={iv.endMinutes}
              onChange={(e) =>
                patch(index, "endMinutes", Number(e.target.value))
              }
              className="office-dc-input mt-1 w-full outline-none"
            >
              {TIMES.filter((m) => m > 0).map((m) => (
                <option key={m} value={m} className="office-option">
                  {formatMinutesAsTime(m)}
                </option>
              ))}
            </select>
          </label>
          {intervals.length > minCount ? (
            <button
              type="button"
              onClick={() => onChange(intervals.filter((_, i) => i !== index))}
              className="office-muted rounded-full px-3 py-2 text-sm hover:bg-[color:var(--office-nav-hover)]"
            >
              {t.removeInterval}
            </button>
          ) : null}
        </div>
      ))}
      {intervals.length < MAX_INTERVALS_PER_DAY ? (
        <button
          type="button"
          onClick={addInterval}
          className="office-chip-idle rounded-full px-3.5 py-2 text-sm"
        >
          {t.addInterval}
        </button>
      ) : null}
    </div>
  );
}

function setDay(
  weeklyHours: WeeklyHours,
  day: number,
  intervals: TimeInterval[],
): WeeklyHours {
  const next = weeklyHours.slice() as WeeklyHours;
  next[day] = intervals;
  return next;
}

function formatOverrideHours(override: DateOverride, unavailable: string) {
  if (override.kind === "unavailable") return unavailable;
  return override.intervals
    .map(
      (iv) =>
        `${formatMinutesAsTime(iv.startMinutes)}–${formatMinutesAsTime(iv.endMinutes)}`,
    )
    .join(", ");
}

type HostScheduleHoursProps = {
  weeklyHours: WeeklyHours;
  dateOverrides: DateOverride[];
  onChangeWeekly: (next: WeeklyHours) => void;
  onChangeOverrides: (next: DateOverride[]) => void;
};

export function HostScheduleHours({
  weeklyHours,
  dateOverrides,
  onChangeWeekly,
  onChangeOverrides,
}: HostScheduleHoursProps) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [startDate, setStartDate] = useState(() => toYmd(new Date()));
  const [endDate, setEndDate] = useState(() => toYmd(new Date()));
  const [range, setRange] = useState(false);
  const [kind, setKind] = useState<DateOverrideKind>("hours");
  const [draftIntervals, setDraftIntervals] = useState<TimeInterval[]>([
    { ...DEFAULT_INTERVAL },
  ]);

  function toggleDay(day: number, checked: boolean) {
    if (!checked) {
      onChangeWeekly(setDay(weeklyHours, day, []));
      return;
    }
    if (weeklyHours[day].length === 0) {
      onChangeWeekly(setDay(weeklyHours, day, [{ ...DEFAULT_INTERVAL }]));
    }
  }

  function applyOverride() {
    const start = startDate;
    const end = range ? endDate : startDate;
    if (!YMD_RE.test(start) || !YMD_RE.test(end) || end < start) return;
    const intervals =
      kind === "hours"
        ? draftIntervals
            .filter((iv) => iv.endMinutes > iv.startMinutes)
            .map((iv) => ({ ...iv }))
        : [];
    if (kind === "hours" && intervals.length < 1) return;

    const row: DateOverride = {
      id: `ovr_${Date.now().toString(36)}_${dateOverrides.length}`,
      startDate: start,
      endDate: end,
      kind,
      intervals: kind === "unavailable" ? [] : intervals,
    };
    const idx = dateOverrides.findIndex(
      (o) => o.startDate === start && o.endDate === end,
    );
    if (idx >= 0) {
      const next = dateOverrides.slice();
      next[idx] = { ...row, id: dateOverrides[idx].id };
      onChangeOverrides(next);
      return;
    }
    if (dateOverrides.length >= MAX_DATE_OVERRIDES) return;
    onChangeOverrides([...dateOverrides, row]);
  }

  function removeOverride(id: string) {
    onChangeOverrides(dateOverrides.filter((o) => o.id !== id));
  }

  return (
    <div className="mt-6">
      <h3 className="font-display text-xl">{t.scheduleDefaultName}</h3>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="office-field text-sm">{t.weeklyHoursLabel}</p>
          <ul className="mt-3 space-y-3">
            {WEEKDAY_ORDER.map((day) => {
              const intervals = weeklyHours[day];
              const checked = intervals.length > 0;
              return (
                <li
                  key={day}
                  className="office-subcard space-y-2 rounded-2xl p-3"
                >
                  <label className="flex items-center gap-3 office-field text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => toggleDay(day, e.target.checked)}
                      className="h-4 w-4 accent-[var(--office-text)]"
                    />
                    {t.weekdayNames[day]}
                  </label>
                  {checked ? (
                    <IntervalEditor
                      intervals={intervals}
                      onChange={(next) =>
                        onChangeWeekly(setDay(weeklyHours, day, next))
                      }
                    />
                  ) : (
                    <p className="office-muted text-sm">{t.dayUnavailable}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="office-field text-sm">{t.overridesTitle}</p>
          {dateOverrides.length === 0 ? (
            <p className="office-muted mt-3 text-sm">{t.overridesEmpty}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {dateOverrides.map((override) => (
                <li
                  key={override.id}
                  className="office-subcard flex flex-wrap items-center justify-between gap-2 rounded-2xl p-3"
                >
                  <div>
                    <p className="text-sm">
                      {override.startDate === override.endDate
                        ? override.startDate
                        : `${override.startDate} – ${override.endDate}`}
                    </p>
                    <p className="office-muted text-sm">
                      {formatOverrideHours(override, t.overrideUnavailable)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOverride(override.id)}
                    className="office-muted rounded-full px-3 py-2 text-sm hover:bg-[color:var(--office-nav-hover)]"
                  >
                    {t.removeInterval}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="office-chip-idle mt-3 rounded-full px-3.5 py-2 text-sm"
          >
            {t.overrideAddHours}
          </button>
          {expanded ? (
            <div className="office-subcard mt-3 space-y-3 rounded-2xl p-3">
              <label className="office-field block text-sm">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStartDate(value);
                    if (!range) setEndDate(value);
                  }}
                  className="office-dc-input mt-1 w-full outline-none"
                />
              </label>
              <label className="flex items-center gap-3 office-field text-sm">
                <input
                  type="checkbox"
                  checked={range}
                  onChange={(e) => {
                    const on = e.target.checked;
                    setRange(on);
                    if (!on) setEndDate(startDate);
                    else if (endDate < startDate) setEndDate(startDate);
                  }}
                  className="h-4 w-4 accent-[var(--office-text)]"
                />
                {t.overrideRange}
              </label>
              {range ? (
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="office-dc-input w-full outline-none"
                />
              ) : null}
              <div className="flex flex-wrap gap-2">
                {(["hours", "unavailable"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setKind(id);
                      if (id === "hours" && draftIntervals.length === 0) {
                        setDraftIntervals([{ ...DEFAULT_INTERVAL }]);
                      }
                    }}
                    className={[
                      "rounded-full px-3.5 py-2 text-sm font-medium transition",
                      kind === id ? "office-liquid-glass" : "office-chip-idle",
                    ].join(" ")}
                  >
                    {id === "hours"
                      ? t.overrideKindHours
                      : t.overrideUnavailable}
                  </button>
                ))}
              </div>
              {kind === "hours" ? (
                <IntervalEditor
                  intervals={draftIntervals}
                  onChange={(next) =>
                    setDraftIntervals(
                      next.length > 0 ? next : [{ ...DEFAULT_INTERVAL }],
                    )
                  }
                  minCount={1}
                />
              ) : null}
              <button
                type="button"
                onClick={applyOverride}
                className="office-chip-idle rounded-full px-3.5 py-2 text-sm"
              >
                {t.overrideApply}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
