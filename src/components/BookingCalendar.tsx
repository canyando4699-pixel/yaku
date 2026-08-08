"use client";

import { useMemo, useState } from "react";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

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

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export function BookingCalendar() {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(2026, 1, 1));
  const [selected, setSelected] = useState(() => new Date(2026, 1, 20));

  const days = useMemo(() => buildGrid(visibleMonth), [visibleMonth]);

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
            aria-label="Previous month"
            onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-accent/50 hover:text-white"
          >
            ‹
          </button>
          <p className="text-lg font-semibold tracking-wide text-white">
            {formatMonthYear(visibleMonth)}
          </p>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-accent/50 hover:text-white"
          >
            ›
          </button>
        </div>

        <div className="relative mb-2 grid grid-cols-7 gap-y-2 text-center text-[11px] font-medium tracking-[0.14em] text-white/35">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="relative grid grid-cols-7 gap-y-1">
          {days.map((day) => {
            const inMonth = day.getMonth() === visibleMonth.getMonth();
            const isSelected = sameDay(day, selected);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => {
                  setSelected(day);
                  if (!inMonth) setVisibleMonth(startOfMonth(day));
                }}
                className={[
                  "mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition",
                  inMonth ? "text-white" : "text-white/25",
                  isSelected
                    ? "bg-accent font-semibold text-white shadow-[0_0_22px_rgba(225,6,0,0.55)]"
                    : "hover:bg-white/6",
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
