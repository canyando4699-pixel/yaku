"use client";

import { useMemo, useState } from "react";
import { OfficeChaseRing } from "@/components/booking/OfficeChaseRing";
import { Icon } from "@/components/ui/Icon";
import { useLocale } from "@/i18n/LocaleProvider";
import { localeDate } from "@/i18n/messages";
import type { Booking } from "@/lib/booking/types";

const PAGE_SIZE = 8;

type HostBookingListProps = {
  bookings: Booking[];
  onOpen: (booking: Booking) => void;
};

export function HostBookingList({ bookings, onOpen }: HostBookingListProps) {
  const { locale, t } = useLocale();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(0);

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [locale],
  );

  const timeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = bookings.filter((b) => {
      if (!q) return true;
      return (
        b.guestName.toLowerCase().includes(q) ||
        b.guestEmail.toLowerCase().includes(q) ||
        (b.note ?? "").toLowerCase().includes(q) ||
        (b.eventTitle ?? "").toLowerCase().includes(q)
      );
    });
    list.sort((a, b) => {
      const diff = +new Date(a.startsAt) - +new Date(b.startsAt);
      return sort === "newest" ? -diff : diff;
    });
    return list;
  }, [bookings, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );
  const from = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const to = Math.min(filtered.length, (safePage + 1) * PAGE_SIZE);

  const pages = useMemo(() => {
    if (pageCount <= 5) {
      return Array.from({ length: pageCount }, (_, i) => i);
    }
    const set = new Set([0, pageCount - 1, safePage, safePage - 1, safePage + 1]);
    return [...set].filter((p) => p >= 0 && p < pageCount).sort((a, b) => a - b);
  }, [pageCount, safePage]);

  return (
    <div className="host-list">
      <div className="host-list-card office-ringed">
        <OfficeChaseRing />
        <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <div className="host-list-header">
          <div>
            <h2 className="host-list-title">{t.dashList}</h2>
            <p className="host-list-subtitle">{t.listActiveBookings}</p>
          </div>
          <div className="host-list-tools">
            <label className="host-list-search">
              <Icon name="search" className="h-4 w-4 text-[#7e7e7e]" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={t.listSearch}
              />
            </label>
            <label className="host-list-sort">
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as "newest" | "oldest");
                  setPage(0);
                }}
                aria-label={t.listSortNewest}
              >
                <option value="newest">{t.listSortNewest}</option>
                <option value="oldest">{t.listSortOldest}</option>
              </select>
              <Icon name="chevronDown" className="host-list-sort-icon h-3.5 w-3.5" />
            </label>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="host-list-empty">{t.hostBookingsEmpty}</p>
        ) : (
          <>
            <div className="host-list-table-wrap">
              <table className="host-list-table">
                <thead>
                  <tr>
                    <th>{t.guest}</th>
                    <th>{t.email}</th>
                    <th>{t.when}</th>
                    <th>{t.note}</th>
                    <th>{t.listStatus}</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((booking) => {
                    const start = new Date(booking.startsAt);
                    const end = new Date(booking.endsAt);
                    return (
                      <tr
                        key={booking.id}
                        onClick={() => onOpen(booking)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onOpen(booking);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                      >
                        <td>
                          <span className="host-list-name">
                            {booking.guestName}
                          </span>
                          {booking.eventTitle ? (
                            <span className="host-list-meta">
                              {booking.eventTitle}
                            </span>
                          ) : null}
                        </td>
                        <td>{booking.guestEmail}</td>
                        <td>
                          <span className="host-list-name">
                            {dateFmt.format(start)}
                          </span>
                          <span className="host-list-meta">
                            {timeFmt.format(start)} – {timeFmt.format(end)}
                          </span>
                        </td>
                        <td className="host-list-note">
                          {booking.note?.trim() ? booking.note : "—"}
                        </td>
                        <td>
                          <span className="host-list-status host-list-status-active">
                            {t.statusConfirmed}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="host-list-footer">
              <p className="host-list-count">
                {t.listShowing
                  .replace("{from}", String(from))
                  .replace("{to}", String(to))
                  .replace("{total}", String(filtered.length))}
              </p>
              <div className="host-list-pages">
                <button
                  type="button"
                  className="host-list-page"
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  aria-label={t.prevWeek}
                >
                  ‹
                </button>
                {pages.map((p, index) => {
                  const prev = pages[index - 1];
                  const gap = prev !== undefined && p - prev > 1;
                  return (
                    <span key={p} className="contents">
                      {gap ? <span className="host-list-ellipsis">…</span> : null}
                      <button
                        type="button"
                        className="host-list-page"
                        data-active={p === safePage}
                        onClick={() => setPage(p)}
                      >
                        {p + 1}
                      </button>
                    </span>
                  );
                })}
                <button
                  type="button"
                  className="host-list-page"
                  disabled={safePage >= pageCount - 1}
                  onClick={() =>
                    setPage((p) => Math.min(pageCount - 1, p + 1))
                  }
                  aria-label={t.nextWeek}
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
