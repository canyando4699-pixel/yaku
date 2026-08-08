"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Icon } from "@/components/ui/Icon";
import { IslandPill, islandClass } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import { localeDate } from "@/i18n/messages";
import { demoHost } from "@/lib/booking/demo";
import { listBookings } from "@/lib/booking/storage";
import type { Booking } from "@/lib/booking/types";

export function HostBookings() {
  const { locale, t } = useLocale();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setBookings(
      listBookings(demoHost.slug).sort(
        (a, b) => +new Date(a.startsAt) - +new Date(b.startsAt),
      ),
    );
  }, []);

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeDate[locale], {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  );

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="font-display text-xl tracking-wide text-ink">
          <span className="mr-2 text-accent">約</span>
          Yaku
        </Link>
        <div className="flex items-center gap-2.5">
          <Link href="/b/demo" className={islandClass("island", "sm")}>
            <Icon name="calendar" className="h-3.5 w-3.5 text-white/70" />
            {t.tryDemo}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16 md:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-ink md:text-4xl">
            {t.hostBookingsTitle}
          </h1>
          <IslandPill>
            <span className="h-2 w-2 rounded-full bg-[#30d158]" />
            <span>{bookings.length}</span>
          </IslandPill>
        </div>
        <p className="mt-2 text-sm text-muted">{t.hostBookingsHint}</p>

        {bookings.length === 0 ? (
          <div className="mt-10 rounded-[2rem] bg-[#111111] px-6 py-10 text-center text-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <Icon name="calendar" className="mx-auto h-6 w-6 text-white/40" />
            <p className="mt-3">{t.hostBookingsEmpty}</p>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="rounded-[1.75rem] bg-[#111111] px-5 py-4 text-white shadow-[0_16px_40px_rgba(0,0,0,0.16)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <IslandPill className="bg-[#1c1c1e]">
                    <Icon name="clock" className="h-3.5 w-3.5 text-white/70" />
                    <span>{formatter.format(new Date(booking.startsAt))}</span>
                  </IslandPill>
                </div>
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/80">
                  <Icon name="user" className="h-3.5 w-3.5 text-white/55" />
                  {booking.guestName}
                </p>
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-white/55">
                  <Icon name="mail" className="h-3.5 w-3.5" />
                  {booking.guestEmail}
                </p>
                {booking.note ? (
                  <p className="mt-3 text-sm text-white/75">{booking.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
