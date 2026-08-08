"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BrushKanji } from "@/components/BrushKanji";
import { BookingCalendar } from "@/components/BookingCalendar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NightStars } from "@/components/NightStars";
import { Icon } from "@/components/ui/Icon";
import { IslandPill, islandClass } from "@/components/ui/Island";
import { LocaleProvider, useLocale } from "@/i18n/LocaleProvider";
import { isBookableDay } from "@/lib/booking/slots";

function HomePageContent() {
  const { t } = useLocale();
  const [previewDate, setPreviewDate] = useState(() => new Date());

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <section className="relative flex min-h-dvh flex-col overflow-hidden">
        <Image
          src="/images/fuji-hero.jpg"
          alt="Mount Fuji at night with a glowing pagoda"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.4)_0%,rgba(8,8,10,0.22)_38%,rgba(8,8,10,0.58)_100%)]"
        />
        <NightStars />

        <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
          <div className="flex items-center gap-3">
            <Image
              src="/yaku-logo.png"
              alt="Yaku"
              width={40}
              height={52}
              className="h-10 w-auto drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
              priority
            />
            <p className="font-display text-xl tracking-wide text-white">
              Yaku
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/host"
              className={[
                islandClass("islandMuted", "sm"),
                "hidden sm:inline-flex",
              ].join(" ")}
            >
              <Icon name="list" className="h-3.5 w-3.5 text-white/70" />
              <span>{t.viewBookings}</span>
            </Link>
            <IslandPill className="hidden bg-black/55 md:inline-flex">
              <span className="h-2 w-2 rounded-full bg-[#30d158]" />
              <span>{t.openSource}</span>
            </IslandPill>
            <LanguageSwitcher />
          </div>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pb-16 pt-8 text-center md:px-10">
          <div className="relative flex flex-col items-center">
            <div className="relative flex h-[9.5rem] items-center justify-center md:h-[14rem]">
              <BrushKanji className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] leading-none md:text-[15rem]" />
              <h1 className="yaku-wordmark relative z-10 font-display text-[3.75rem] font-normal leading-none tracking-[0.08em] text-white drop-shadow-[0_10px_32px_rgba(0,0,0,0.65)] md:text-[6rem] md:tracking-[0.1em]">
                Yaku
              </h1>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="h-px w-12 bg-white/35 md:w-16" />
              <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
              <span className="h-px w-12 bg-white/35 md:w-16" />
            </div>

            <p className="mt-4 text-[11px] tracking-[0.28em] text-white/50 uppercase">
              {t.eyebrow}
            </p>
          </div>

          <p className="mx-auto mt-5 max-w-md font-display text-xl leading-snug text-white/88 md:text-2xl">
            {t.headlineLine1}
            <span className="mx-2 text-white/30">·</span>
            {t.headlineLine2}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/b/demo" className={islandClass("accent", "lg")}>
              <Icon name="calendar" className="h-4 w-4" />
              {t.tryDemo}
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
            <Link
              href="/host"
              className={islandClass(
                "soft",
                "lg",
                "bg-white/12 text-white ring-white/15 hover:bg-white/18",
              )}
            >
              <Icon name="list" className="h-4 w-4" />
              {t.viewBookings}
            </Link>
          </div>
        </main>
      </section>

      <section className="relative bg-[#0f0d0c] px-6 py-20 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10">
          <div className="text-center">
            <p className="text-sm tracking-[0.2em] text-[#ff6b5e] uppercase">
              {t.pickDate}
            </p>
            <h2 className="mt-3 font-display text-3xl text-white md:text-4xl">
              {t.badgeFeatures}
            </h2>
          </div>
          <BookingCalendar
            selected={previewDate}
            onSelect={setPreviewDate}
            isDayEnabled={isBookableDay}
          />
        </div>
      </section>
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
