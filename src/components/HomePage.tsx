"use client";

import Image from "next/image";
import Link from "next/link";
import { BrushKanji } from "@/components/BrushKanji";
import { FeatureScroll } from "@/components/FeatureScroll";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NightStars } from "@/components/NightStars";
import { Icon } from "@/components/ui/Icon";
import { islandClass } from "@/components/ui/Island";
import { LocaleProvider, useLocale } from "@/i18n/LocaleProvider";

function HomePageContent() {
  const { t } = useLocale();

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-[#0f0d0c]">
      <section className="relative flex min-h-dvh flex-col overflow-hidden">
        <Image
          src="/images/fuji-hero-4k.png"
          alt="Mount Fuji at night with a glowing pagoda"
          fill
          priority
          unoptimized
          quality={100}
          sizes="100vw"
          className="object-cover object-center brightness-[1.06] contrast-[1.1] saturate-[1.08]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,8,10,0.04)_0%,rgba(8,8,10,0.16)_52%,rgba(8,8,10,0.38)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[36%] bg-gradient-to-t from-[#0f0d0c] via-[#0f0d0c]/65 to-transparent"
        />
        <NightStars />

        <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
          <div className="flex items-center gap-3">
            <div className="overflow-hidden rounded-[1.15rem] shadow-[0_10px_30px_rgba(0,0,0,0.28)] ring-1 ring-white/20">
              <Image
                src="/yaku-logo.png"
                alt="Yaku"
                width={40}
                height={52}
                className="h-10 w-auto"
                priority
              />
            </div>
            <p className="font-display text-xl font-normal tracking-[0.06em] text-white/90">
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
            <a
              href="https://github.com/canyando4699-pixel/yaku"
              target="_blank"
              rel="noreferrer"
              className={[
                islandClass("islandMuted", "sm"),
                "inline-flex",
              ].join(" ")}
            >
              <span>GitHub</span>
            </a>
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
              className={islandClass("soft", "lg")}
            >
              <Icon name="list" className="h-4 w-4" />
              {t.viewBookings}
            </Link>
          </div>
        </main>
      </section>

      <FeatureScroll />
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
