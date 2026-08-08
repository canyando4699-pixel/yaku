"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { BrushKanji } from "@/components/BrushKanji";
import { BookingCalendar } from "@/components/BookingCalendar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NightStars } from "@/components/NightStars";
import { Icon } from "@/components/ui/Icon";
import { islandClass } from "@/components/ui/Island";
import { LocaleProvider, useLocale } from "@/i18n/LocaleProvider";
import { defaultHostProfile } from "@/lib/booking/demo";
import { loadHostProfile } from "@/lib/booking/hostProfile";
import { isBookableDay } from "@/lib/booking/slots";
import type { HostProfile } from "@/lib/booking/types";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function stage(progress: number, from: number, to: number) {
  return clamp01((progress - from) / (to - from));
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function useSectionProgress(ref: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setProgress(1);
      return;
    }

    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const travel = Math.max(vh * 0.35, el.offsetHeight - vh);
      // Begin while section is still entering; finish mid sticky-scroll.
      const startTop = vh * 0.72;
      const next = clamp01((startTop - rect.top) / (startTop + travel * 0.7));
      setProgress((prev) => (Math.abs(prev - next) < 0.002 ? prev : next));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref]);

  return progress;
}

function HomePageContent() {
  const { t } = useLocale();
  const [previewDate, setPreviewDate] = useState(() => new Date());
  const [host, setHost] = useState<HostProfile>(defaultHostProfile);
  const buildRef = useRef<HTMLElement>(null);
  const progress = useSectionProgress(buildRef);

  useEffect(() => {
    setHost(loadHostProfile(defaultHostProfile.slug));
  }, []);

  const eyebrowT = easeOutCubic(stage(progress, 0, 0.35));
  const titleT = easeOutCubic(stage(progress, 0.08, 0.48));
  const calendarT = easeOutCubic(stage(progress, 0.18, 0.88));

  const eyebrowStyle: CSSProperties = {
    opacity: eyebrowT,
    transform: `translate3d(0, ${(1 - eyebrowT) * 18}px, 0)`,
  };

  const titleStyle: CSSProperties = {
    opacity: titleT,
    transform: `translate3d(0, ${(1 - titleT) * 26}px, 0)`,
  };

  const tilt = (1 - calendarT) * 42;
  const calendarStyle: CSSProperties = {
    opacity: 0.2 + calendarT * 0.8,
    transform: `perspective(1100px) translate3d(0, ${(1 - calendarT) * 64}px, ${(1 - calendarT) * -120}px) rotateX(${tilt}deg) scale(${0.9 + calendarT * 0.1})`,
  };

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
          className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#0f0d0c] via-[#0f0d0c]/70 to-transparent"
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

      <section
        ref={buildRef}
        className="relative min-h-[145vh] bg-[#0f0d0c]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(15,13,12,0)_0%,rgba(15,13,12,1)_100%)]"
        />
        <div className="sticky top-0 flex min-h-dvh items-center justify-center px-6 py-16 md:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background: `radial-gradient(ellipse at 50% ${28 + calendarT * 18}%, rgba(225,6,0,${0.08 + calendarT * 0.12}), transparent 58%)`,
            }}
          />

          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-10">
            <div className="text-center will-change-transform">
              <p
                className="text-sm tracking-[0.2em] text-[#ff6b5e] uppercase"
                style={eyebrowStyle}
              >
                {t.pickDate}
              </p>
              <h2
                className="mt-3 font-display text-3xl text-white md:text-4xl"
                style={titleStyle}
              >
                {t.badgeFeatures}
              </h2>
            </div>

            <div className="yaku-calendar-stage w-full max-w-[360px]">
              <div
                className="will-change-transform [transform-style:preserve-3d]"
                style={calendarStyle}
              >
                <BookingCalendar
                  selected={previewDate}
                  onSelect={setPreviewDate}
                  isDayEnabled={(date) => isBookableDay(date, host)}
                />
              </div>
            </div>
          </div>
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
