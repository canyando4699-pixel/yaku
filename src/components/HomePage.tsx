"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BookingCalendar } from "@/components/BookingCalendar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Icon } from "@/components/ui/Icon";
import { IslandPill, islandClass } from "@/components/ui/Island";
import { LocaleProvider, useLocale } from "@/i18n/LocaleProvider";
import { isBookableDay } from "@/lib/booking/slots";

function HomePageContent() {
  const { t } = useLocale();
  const [previewDate, setPreviewDate] = useState(() => new Date());

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(225,6,0,0.08)_0%,transparent_42%),radial-gradient(ellipse_at_10%_80%,rgba(17,17,17,0.05)_0%,transparent_50%)]"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-3">
          <Image
            src="/yaku-logo.png"
            alt="Yaku"
            width={40}
            height={52}
            className="h-10 w-auto"
            priority
          />
          <p className="font-display text-xl tracking-wide text-ink">Yaku</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/host"
            className={[
              islandClass("island", "sm"),
              "hidden sm:inline-flex",
            ].join(" ")}
          >
            <Icon name="list" className="h-3.5 w-3.5 text-white/70" />
            <span>{t.viewBookings}</span>
          </Link>
          <IslandPill className="hidden md:inline-flex">
            <span className="h-2 w-2 rounded-full bg-[#30d158]" />
            <span>{t.openSource}</span>
          </IslandPill>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-12 px-6 pb-20 pt-6 md:px-10">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-medium tracking-[0.2em] text-accent">
            {t.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] text-ink md:text-7xl">
            {t.headlineLine1}
            <br />
            {t.headlineLine2}
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-muted md:text-xl">
            {t.subcopy}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/b/demo" className={islandClass("accent", "lg")}>
              <Icon name="calendar" className="h-4 w-4" />
              {t.tryDemo}
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
            <Link href="/host" className={islandClass("soft", "lg")}>
              <Icon name="list" className="h-4 w-4" />
              {t.viewBookings}
            </Link>
          </div>
        </div>

        <div className="mx-auto shrink-0">
          <BookingCalendar
            selected={previewDate}
            onSelect={setPreviewDate}
            isDayEnabled={isBookableDay}
          />
        </div>
      </main>
    </div>
  );
}

export function HomePage() {
  return (
    <LocaleProvider>
      <HomePageContent />
    </LocaleProvider>
  );
}
