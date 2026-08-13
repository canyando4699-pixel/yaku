"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useLocale } from "@/i18n/LocaleProvider";
import { localeDate } from "@/i18n/messages";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildGrid(month: Date) {
  const first = startOfMonth(month);
  const mondayIndex = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - mondayIndex);

  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + i);
    return day;
  });
}

type BookingCalendarProps = {
  selected: Date;
  onSelect: (date: Date) => void;
  isDayEnabled?: (date: Date) => boolean;
  variant?: "hero" | "embedded";
  className?: string;
};

export function BookingCalendar({
  selected,
  onSelect,
  isDayEnabled,
  variant = "hero",
  className,
}: BookingCalendarProps) {
  const { locale, t } = useLocale();
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(selected),
  );

  const days = useMemo(() => buildGrid(visibleMonth), [visibleMonth]);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        month: "short",
        year: "numeric",
      }).format(visibleMonth),
    [locale, visibleMonth],
  );

  if (variant === "embedded") {
    return (
      <div
        className={[
          "relative w-full overflow-hidden rounded-[1rem] border border-[color:var(--office-border)] bg-[color:var(--office-surface-soft)] px-3 pb-3 pt-2.5",
          className ?? "max-w-[260px]",
        ].join(" ")}
      >
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            aria-label={t.prevMonth}
            onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
            className="office-icon-btn flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[color:var(--office-nav-hover)]"
          >
            <Icon name="chevronLeft" className="h-3.5 w-3.5" />
          </button>
          <p className="text-sm font-semibold tracking-wide text-[color:var(--office-text)]">
            {monthLabel}
          </p>
          <button
            type="button"
            aria-label={t.nextMonth}
            onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
            className="office-icon-btn flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[color:var(--office-nav-hover)]"
          >
            <Icon name="chevronRight" className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="office-muted mb-1.5 grid grid-cols-7 gap-y-1 text-center text-[10px] font-medium tracking-[0.12em]">
          {t.weekdays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-0.5">
          {days.map((day) => {
            const inMonth = day.getMonth() === visibleMonth.getMonth();
            const isSelected = sameDay(day, selected);
            const enabled = isDayEnabled ? isDayEnabled(day) : true;

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={!enabled}
                onClick={() => {
                  onSelect(day);
                  if (!inMonth) setVisibleMonth(startOfMonth(day));
                }}
                className={[
                  "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs transition",
                  !enabled
                    ? "cursor-not-allowed opacity-20"
                    : inMonth
                      ? "text-[color:var(--office-text)] hover:bg-[color:var(--office-nav-hover)]"
                      : "office-muted hover:bg-[color:var(--office-nav-hover)]",
                  isSelected && enabled
                    ? "office-chip-active font-semibold"
                    : "",
                ].join(" ")}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[360px]">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_50%_0%,rgba(225,6,0,0.22),transparent_55%)] blur-2xl"
      />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#14110f] px-5 pb-5 pt-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c8 8 8 16 0 24-8-8-8-16 0-24zm0 24c8 8 8 16 0 24-8-8-8-16 0-24zm-24 0c8 8 8 16 0 24-8-8-8-16 0-24zm48 0c8 8 8 16 0 24-8-8-8-16 0-24z' fill='none' stroke='%23e10600' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(225,6,0,0.18),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(255,248,235,0.04),transparent_40%)]"
        />

        <div className="relative mx-auto mb-4 h-1 w-10 rounded-full bg-accent shadow-[0_0_18px_rgba(225,6,0,0.7)]" />

        <div className="relative mb-5 flex items-center justify-between">
          <button
            type="button"
            aria-label={t.prevMonth}
            onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-white transition hover:bg-white/14"
          >
            <Icon name="chevronLeft" className="h-4 w-4" />
          </button>
          <p className="text-lg font-semibold tracking-wide text-white">
            {monthLabel}
          </p>
          <button
            type="button"
            aria-label={t.nextMonth}
            onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-white transition hover:bg-white/14"
          >
            <Icon name="chevronRight" className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mb-2 grid grid-cols-7 gap-y-2 text-center text-[11px] font-medium tracking-[0.14em] text-white/35">
          {t.weekdays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="relative grid grid-cols-7 gap-y-1">
          {days.map((day) => {
            const inMonth = day.getMonth() === visibleMonth.getMonth();
            const isSelected = sameDay(day, selected);
            const enabled = isDayEnabled ? isDayEnabled(day) : true;

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={!enabled}
                onClick={() => {
                  onSelect(day);
                  if (!inMonth) setVisibleMonth(startOfMonth(day));
                }}
                className={[
                  "mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition",
                  !enabled
                    ? "cursor-not-allowed text-white/15"
                    : inMonth
                      ? "text-white hover:bg-white/6"
                      : "text-white/25 hover:bg-white/6",
                  isSelected && enabled
                    ? "bg-accent font-semibold text-white shadow-[0_0_22px_rgba(225,6,0,0.55)] hover:bg-accent"
                    : "",
                ].join(" ")}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
