"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useLocale } from "@/i18n/LocaleProvider";
import { useTheme } from "@/i18n/ThemeProvider";
import { localeDate } from "@/i18n/messages";
import { getDailyQuote } from "@/lib/booking/dailyQuotes";
import type { Booking } from "@/lib/booking/types";

const HOUR_START = 0;
const HOUR_END = 24;
const HOUR_PX = 56;
const TIME_TOP_PAD = 16;
const TIME_BOTTOM_PAD = 24;
const PASTELS = [
  { bg: "#d6ecff", border: "#5ac8fa" },
  { bg: "#e8deff", border: "#bf5af2" },
  { bg: "#d8f5e2", border: "#30d158" },
  { bg: "#ffe8d1", border: "#ff9f0a" },
  { bg: "#ffd9d6", border: "#ff453a" },
] as const;

type CalView = "day" | "week" | "month" | "year";

type HostScheduleCalendarProps = {
  bookings: Booking[];
  focusDate: Date;
  onFocusChange: (next: Date) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const mondayOffset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - mondayOffset);
  return d;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, amount: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addYears(date: Date, amount: number) {
  return new Date(
    date.getFullYear() + amount,
    date.getMonth(),
    date.getDate(),
  );
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function minutesOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function pastelOf(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i)) % 97;
  return PASTELS[hash % PASTELS.length]!;
}

function buildMonthGrid(month: Date) {
  const first = startOfMonth(month);
  const mondayIndex = (first.getDay() + 6) % 7;
  const gridStart = addDays(first, -mondayIndex);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

function eventLayout(booking: Booking) {
  const start = new Date(booking.startsAt);
  const end = new Date(booking.endsAt);
  const startMin = Math.max(minutesOfDay(start), HOUR_START * 60);
  const endMin = Math.min(minutesOfDay(end), HOUR_END * 60);
  if (endMin <= HOUR_START * 60 || startMin >= HOUR_END * 60) return null;
  return {
    start,
    end,
    top: TIME_TOP_PAD + ((startMin - HOUR_START * 60) / 60) * HOUR_PX,
    height: Math.max(40, ((endMin - startMin) / 60) * HOUR_PX - 2),
  };
}

export function HostScheduleCalendar({
  bookings,
  focusDate,
  onFocusChange,
  selectedId,
  onSelect,
}: HostScheduleCalendarProps) {
  const { locale, t } = useLocale();
  const { theme } = useTheme();
  const [view, setView] = useState<CalView>("week");
  const [sidebarMonth, setSidebarMonth] = useState(() =>
    startOfMonth(focusDate),
  );
  const timeScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSidebarMonth(startOfMonth(focusDate));
  }, [focusDate]);

  useEffect(() => {
    if (view !== "day" && view !== "week") return;
    const el = timeScrollRef.current;
    if (!el) return;
    const hour = Math.min(Math.max(new Date().getHours() - 1, 0), 20);
    const headerOffset = 72;
    el.scrollTop = TIME_TOP_PAD + hour * HOUR_PX + headerOffset;
  }, [view]);

  const focus = startOfDay(focusDate);
  const weekStartMs = startOfWeek(focus).getTime();
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        addDays(new Date(weekStartMs), i),
      ),
    [weekStartMs],
  );
  const hours = useMemo(
    () => Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i),
    [],
  );
  const gridHeight =
    hours.length * HOUR_PX + TIME_TOP_PAD + TIME_BOTTOM_PAD;
  const now = new Date();
  const quote = getDailyQuote(now);
  const miniDays = useMemo(() => buildMonthGrid(sidebarMonth), [sidebarMonth]);
  const monthDays = useMemo(() => buildMonthGrid(focus), [focus]);

  const dayBookings = useMemo(
    () =>
      bookings
        .filter((b) => sameDay(new Date(b.startsAt), focus))
        .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)),
    [bookings, focus],
  );

  const weekBookings = useMemo(() => {
    const end = addDays(weekDays[weekDays.length - 1]!, 1);
    return bookings.filter((b) => {
      const d = new Date(b.startsAt);
      return d >= weekDays[0]! && d < end;
    });
  }, [bookings, weekDays]);

  const monthBookings = useMemo(() => {
    const start = startOfMonth(focus);
    const end = addMonths(start, 1);
    return bookings.filter((b) => {
      const d = new Date(b.startsAt);
      return d >= start && d < end;
    });
  }, [bookings, focus]);

  const yearBookingsByMonth = useMemo(() => {
    const year = focus.getFullYear();
    const counts = Array.from({ length: 12 }, () => 0);
    for (const b of bookings) {
      const d = new Date(b.startsAt);
      if (d.getFullYear() === year) counts[d.getMonth()] += 1;
    }
    return counts;
  }, [bookings, focus]);

  const agendaGroups = useMemo(() => {
    const today = startOfDay(new Date());
    const nextDay = addDays(today, 1);
    const upcoming = bookings
      .filter((b) => new Date(b.startsAt) >= today)
      .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));

    const groups: { key: string; label: string; date: Date; items: Booking[] }[] =
      [];
    for (const booking of upcoming) {
      const date = new Date(booking.startsAt);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const existing = groups.find((g) => g.key === key);
      if (existing) {
        existing.items.push(booking);
        continue;
      }
      let label: string;
      if (sameDay(date, today)) label = t.agendaToday;
      else if (sameDay(date, nextDay)) label = t.agendaTomorrow;
      else {
        label = new Intl.DateTimeFormat(localeDate[locale], {
          weekday: "long",
        }).format(date);
      }
      groups.push({ key, label, date, items: [booking] });
    }
    return groups.slice(0, 8);
  }, [bookings, locale, t.agendaToday, t.agendaTomorrow]);

  const sidebarMonthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        month: "long",
        year: "numeric",
      }).format(sidebarMonth),
    [locale, sidebarMonth],
  );

  const weekdayShort = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        weekday: "short",
      }),
    [locale],
  );

  const dayNum = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        day: "numeric",
      }),
    [locale],
  );

  const timeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        hour: "numeric",
        minute: "2-digit",
      }),
    [locale],
  );

  const hourFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        hour: "numeric",
      }),
    [locale],
  );

  const monthNameFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        month: "long",
      }),
    [locale],
  );

  const monthShortFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        month: "short",
      }),
    [locale],
  );

  const rangeLabel = useMemo(() => {
    if (view === "day") {
      return new Intl.DateTimeFormat(localeDate[locale], {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(focus);
    }
    if (view === "month") {
      return new Intl.DateTimeFormat(localeDate[locale], {
        month: "long",
        year: "numeric",
      }).format(focus);
    }
    if (view === "year") {
      return String(focus.getFullYear());
    }
    const fmt = new Intl.DateTimeFormat(localeDate[locale], {
      day: "numeric",
      month: "short",
    });
    return `${fmt.format(weekDays[0]!)} – ${fmt.format(weekDays[6]!)}`;
  }, [focus, locale, view, weekDays]);

  function selectBooking(id: string) {
    onSelect(id);
    const booking = bookings.find((b) => b.id === id);
    if (booking) onFocusChange(new Date(booking.startsAt));
  }

  function goToday() {
    onFocusChange(new Date());
  }

  function goPrev() {
    if (view === "day") onFocusChange(addDays(focus, -1));
    else if (view === "week") onFocusChange(addDays(focus, -7));
    else if (view === "month") onFocusChange(addMonths(focus, -1));
    else onFocusChange(addYears(focus, -1));
  }

  function goNext() {
    if (view === "day") onFocusChange(addDays(focus, 1));
    else if (view === "week") onFocusChange(addDays(focus, 7));
    else if (view === "month") onFocusChange(addMonths(focus, 1));
    else onFocusChange(addYears(focus, 1));
  }

  function renderTimeColumn(
    day: Date,
    events: Booking[],
    key: string,
    isToday: boolean,
  ) {
    return (
      <div
        key={key}
        className="host-cal-daycol"
        data-today={isToday}
        style={{ height: gridHeight }}
      >
        {hours.map((hour) => (
          <div
            key={hour}
            className="host-cal-hour-line"
            style={{ top: TIME_TOP_PAD + (hour - HOUR_START) * HOUR_PX }}
          />
        ))}
        {events.map((booking) => {
          const layout = eventLayout(booking);
          if (!layout) return null;
          const color = pastelOf(booking.id);
          return (
            <button
              key={booking.id}
              type="button"
              className="host-cal-event"
              data-selected={selectedId === booking.id}
              style={{
                top: layout.top,
                height: layout.height,
                backgroundColor: color.bg,
                borderLeftColor: color.border,
              }}
              onClick={() => onSelect(booking.id)}
            >
              <span className="block truncate text-[12px] font-semibold leading-tight text-[#111]">
                {booking.guestName}
              </span>
              <span className="mt-0.5 block truncate text-[10px] font-medium leading-tight text-[#111]/80">
                {timeFmt.format(layout.start)}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  function renderHourGutter() {
    return (
      <div className="host-cal-gutter" style={{ height: gridHeight }}>
        {hours.map((hour) => {
          const labelDate = new Date();
          labelDate.setHours(hour, 0, 0, 0);
          const isFirst = hour === HOUR_START;
          return (
            <div
              key={hour}
              className="host-cal-hour-label"
              data-edge={isFirst ? "start" : undefined}
              style={{
                top: TIME_TOP_PAD + (hour - HOUR_START) * HOUR_PX,
              }}
            >
              {hourFmt.format(labelDate)}
            </div>
          );
        })}
      </div>
    );
  }

  const views: { id: CalView; label: string }[] = [
    { id: "day", label: t.viewDay },
    { id: "week", label: t.viewWeek },
    { id: "month", label: t.viewMonth },
    { id: "year", label: t.viewYear },
  ];

  return (
    <div className="host-cal" data-theme={theme}>
      <aside className="host-cal-sidebar relative z-[1]">
        <div className="host-cal-mini-nav">
          <p className="text-sm font-semibold tracking-tight">
            {sidebarMonthLabel}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={t.prevMonth}
              className="host-cal-mini-nav-btn"
              onClick={() => setSidebarMonth((m) => addMonths(m, -1))}
            >
              <Icon name="chevronLeft" className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label={t.nextMonth}
              className="host-cal-mini-nav-btn"
              onClick={() => setSidebarMonth((m) => addMonths(m, 1))}
            >
              <Icon name="chevronRight" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="host-cal-mini-grid">
          {t.weekdays.map((label) => (
            <span key={label} className="host-cal-mini-wd">
              {label.slice(0, 1)}
            </span>
          ))}
          {miniDays.map((day) => {
            const inMonth = day.getMonth() === sidebarMonth.getMonth();
            const isToday = sameDay(day, now);
            const selected =
              view === "week"
                ? weekDays.some((d) => sameDay(d, day))
                : sameDay(day, focus);
            return (
              <button
                key={day.toISOString()}
                type="button"
                className="host-cal-mini-cell"
                data-muted={!inMonth}
                data-today={isToday}
                data-selected={selected}
                onClick={() => {
                  onFocusChange(day);
                  if (view === "year") setView("day");
                }}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>

        <div className="host-cal-agenda">
          <blockquote className="host-cal-quote">
            <p lang="ja" className="host-cal-quote-kanji font-display">{quote.kanji}</p>
            <p className="host-cal-quote-gloss">{quote.gloss[locale]}</p>
            <footer className="host-cal-quote-footer">
              <cite className="host-cal-quote-source font-display">{quote.source[locale]}</cite>
            </footer>
          </blockquote>
          {agendaGroups.length === 0 ? (
            <p className="host-cal-agenda-empty">{t.hostBookingsEmpty}</p>
          ) : (
            agendaGroups.map((group) => (
              <div key={group.key} className="host-cal-agenda-day">
                <div className="host-cal-agenda-label flex items-baseline justify-between gap-2">
                  <span>{group.label}</span>
                  <span className="host-cal-agenda-date">
                    {dayNum.format(group.date)}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {group.items.map((booking) => {
                    const start = new Date(booking.startsAt);
                    const end = new Date(booking.endsAt);
                    const color = pastelOf(booking.id);
                    return (
                      <button
                        key={booking.id}
                        type="button"
                        className="host-cal-agenda-item"
                        data-selected={selectedId === booking.id}
                        onClick={() => selectBooking(booking.id)}
                      >
                        <span
                          className="host-cal-agenda-dot"
                          style={{ backgroundColor: color.border }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[11px] opacity-70">
                            {timeFmt.format(start)} – {timeFmt.format(end)}
                          </span>
                          <span className="block truncate text-[13px] font-medium">
                            {booking.guestName}
                          </span>
                          {booking.eventTitle ? (
                            <span className="mt-0.5 block truncate text-[11px] opacity-55">
                              {booking.eventTitle}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <div className="host-cal-main relative z-[1]">
        <div className="host-cal-toolbar">
          <button type="button" className="host-cal-btn" onClick={goToday}>
            {t.today}
          </button>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              aria-label={t.prevWeek}
              className="host-cal-btn host-cal-btn-icon"
              onClick={goPrev}
            >
              <Icon name="chevronLeft" className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={t.nextWeek}
              className="host-cal-btn host-cal-btn-icon"
              onClick={goNext}
            >
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm font-medium text-[color:var(--hc-main-muted)]">
            {rangeLabel}
          </p>

          <div className="mx-auto host-cal-views">
            {views.map((item) => (
              <button
                key={item.id}
                type="button"
                className="host-cal-view"
                data-active={view === item.id}
                onClick={() => setView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {view === "day" ? (
          <div ref={timeScrollRef} className="host-cal-day-grid">
            <div className="host-cal-corner" />
            <div
              className="host-cal-dayhead"
              data-today={sameDay(focus, now)}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--hc-main-muted)]">
                {weekdayShort.format(focus)}
              </p>
              <p
                className={[
                  "mt-1 inline-flex h-8 min-w-8 items-center justify-center rounded-full text-lg font-semibold",
                  sameDay(focus, now)
                    ? "bg-[color:var(--hc-today-dot)] text-white"
                    : "",
                ].join(" ")}
              >
                {dayNum.format(focus)}
              </p>
            </div>
            {renderHourGutter()}
            {renderTimeColumn(
              focus,
              dayBookings,
              focus.toISOString(),
              sameDay(focus, now),
            )}
          </div>
        ) : null}

        {view === "week" ? (
          <div ref={timeScrollRef} className="host-cal-week min-w-[720px]">
            <div className="host-cal-corner" />
            {weekDays.map((day) => {
              const isToday = sameDay(day, now);
              return (
                <div
                  key={`h-${day.toISOString()}`}
                  className="host-cal-dayhead"
                  data-today={isToday}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--hc-main-muted)]">
                    {weekdayShort.format(day)}
                  </p>
                  <p
                    className={[
                      "mt-1 inline-flex h-8 min-w-8 items-center justify-center rounded-full text-lg font-semibold",
                      isToday
                        ? "bg-[color:var(--hc-today-dot)] text-white"
                        : "",
                    ].join(" ")}
                  >
                    {dayNum.format(day)}
                  </p>
                </div>
              );
            })}
            {renderHourGutter()}
            {weekDays.map((day) =>
              renderTimeColumn(
                day,
                weekBookings.filter((b) =>
                  sameDay(new Date(b.startsAt), day),
                ),
                day.toISOString(),
                sameDay(day, now),
              ),
            )}
          </div>
        ) : null}

        {view === "month" ? (
          <div className="host-cal-month">
            <div className="host-cal-month-head">
              {t.weekdays.map((label) => (
                <div key={label} className="host-cal-month-head-cell">
                  {label}
                </div>
              ))}
            </div>
            <div className="host-cal-month-grid">
              {monthDays.map((day) => {
                const inMonth = day.getMonth() === focus.getMonth();
                const isToday = sameDay(day, now);
                const events = monthBookings.filter((b) =>
                  sameDay(new Date(b.startsAt), day),
                );
                return (
                  <div
                    key={day.toISOString()}
                    className="host-cal-month-cell"
                    data-muted={!inMonth}
                    data-today={isToday}
                    data-focus={sameDay(day, focus)}
                  >
                    <button
                      type="button"
                      className="host-cal-month-daynum"
                      onClick={() => {
                        onFocusChange(day);
                        setView("day");
                      }}
                    >
                      {day.getDate()}
                    </button>
                    <div className="host-cal-month-events">
                      {events.slice(0, 3).map((booking) => {
                        const color = pastelOf(booking.id);
                        return (
                          <button
                            key={booking.id}
                            type="button"
                            className="host-cal-month-chip"
                            style={{
                              backgroundColor: color.bg,
                              borderLeftColor: color.border,
                              color: "#111",
                            }}
                            onClick={() => {
                              onSelect(booking.id);
                              onFocusChange(new Date(booking.startsAt));
                            }}
                          >
                            {timeFmt.format(new Date(booking.startsAt))}{" "}
                            {booking.guestName}
                          </button>
                        );
                      })}
                      {events.length > 3 ? (
                        <span className="host-cal-month-more">
                          +{events.length - 3}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {view === "year" ? (
          <div className="host-cal-year">
            {Array.from({ length: 12 }, (_, monthIndex) => {
              const monthDate = new Date(focus.getFullYear(), monthIndex, 1);
              const days = buildMonthGrid(monthDate);
              const count = yearBookingsByMonth[monthIndex] ?? 0;
              return (
                <button
                  key={monthIndex}
                  type="button"
                  className="host-cal-year-month"
                  data-current={monthIndex === now.getMonth() && focus.getFullYear() === now.getFullYear()}
                  onClick={() => {
                    onFocusChange(monthDate);
                    setView("month");
                  }}
                >
                  <div className="flex items-baseline justify-between gap-2 px-1 pb-2">
                    <span className="text-sm font-semibold">
                      {monthNameFmt.format(monthDate)}
                    </span>
                    {count > 0 ? (
                      <span className="text-[11px] text-[color:var(--hc-main-muted)]">
                        {count}
                      </span>
                    ) : null}
                  </div>
                  <div className="host-cal-year-grid">
                    {t.weekdays.map((label) => (
                      <span key={label} className="host-cal-year-wd">
                        {label.slice(0, 1)}
                      </span>
                    ))}
                    {days.map((day) => {
                      const inMonth = day.getMonth() === monthIndex;
                      const isToday = sameDay(day, now);
                      return (
                        <span
                          key={day.toISOString()}
                          className="host-cal-year-day"
                          data-muted={!inMonth}
                          data-today={isToday}
                        >
                          {day.getDate()}
                        </span>
                      );
                    })}
                  </div>
                  <span className="sr-only">{monthShortFmt.format(monthDate)}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
