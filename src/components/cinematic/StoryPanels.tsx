"use client";

import Link from "next/link";
import { BrushKanji } from "@/components/BrushKanji";
import { Icon } from "@/components/ui/Icon";
import { islandClass } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import type { ChapterId } from "@/lib/cinematic/chapters";

function CinematicHairline({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`.trim()}>
      <span className="h-px w-10 bg-white/35 md:w-14" />
      <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
      <span className="h-px w-10 bg-white/35 md:w-14" />
    </div>
  );
}

/**
 * Absolute overlays keyed to --p1 / --p2 / --p3 chapter windows.
 */
export function StoryPanels({ activeChapter }: { activeChapter: ChapterId }) {
  const { t } = useLocale();

  return (
    <div className="cinematic-panels">
      {/* Chapter 1 — brand / promise */}
      <div
        className="cinematic-panel cinematic-panel-intro"
        data-panel="intro"
        inert={activeChapter !== "intro" ? true : undefined}
        aria-hidden={activeChapter !== "intro"}
      >
        <div className="cinematic-panel-inner">
          <div className="relative flex flex-col items-center">
            <div className="relative flex h-[7.5rem] items-center justify-center md:h-[11rem]">
              <BrushKanji className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[8rem] leading-none md:text-[12rem]" />
              <h1 className="yaku-wordmark relative z-10 font-display text-[3rem] font-normal leading-none tracking-[0.08em] text-white drop-shadow-[0_10px_32px_rgba(0,0,0,0.65)] md:text-[5rem] md:tracking-[0.1em]">
                Yaku
              </h1>
            </div>
            <CinematicHairline className="mt-3" />
            <p className="mt-3 text-[11px] tracking-[0.28em] text-white/50 uppercase">
              {t.eyebrow}
            </p>
          </div>
          <p className="mx-auto mt-4 max-w-md font-display text-xl leading-snug text-white/88 md:text-2xl">
            {t.headlineLine1}
            <span className="mx-2 text-white/30">·</span>
            {t.headlineLine2}
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/55 md:text-base">
            {t.subcopy}
          </p>
          <p className="cinematic-scroll-hint mt-8 text-[11px] tracking-[0.22em] text-white/40 uppercase">
            {t.cinematicScrollHint}
          </p>
        </div>
      </div>

      {/* Chapter 2 — product story (title band; slider sits below) */}
      <div
        className="cinematic-panel cinematic-panel-mid"
        data-panel="mid"
        inert={activeChapter !== "mid" ? true : undefined}
        aria-hidden={activeChapter !== "mid"}
      >
        <div className="cinematic-panel-inner cinematic-panel-frost cinematic-panel-inner-mid">
          <span
            aria-hidden="true"
            className="block font-display text-[2.25rem] leading-none text-white/30 md:text-[2.5rem]"
          >
            約
          </span>
          <p className="mt-4 text-[11px] tracking-[0.28em] text-accent uppercase">
            {t.tourEyebrow}
          </p>
          <CinematicHairline className="mt-4" />
          <h2 className="mt-5 font-display text-3xl tracking-[0.06em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.72)] md:text-4xl md:tracking-[0.08em]">
            {t.tourBookingTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-white/70 drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)] md:text-base">
            {t.tourBookingBody}
          </p>
        </div>
      </div>

      {/* Chapter 3 — CTAs */}
      <div
        className="cinematic-panel cinematic-panel-cta"
        data-panel="cta"
        inert={activeChapter !== "cta" ? true : undefined}
        aria-hidden={activeChapter !== "cta"}
      >
        <div className="cinematic-panel-inner cinematic-panel-frost">
          <p className="text-[11px] tracking-[0.28em] text-white/50 uppercase">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl text-white md:text-5xl">
            {t.headlineLine1} {t.headlineLine2}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/60 md:text-base">
            {t.subcopy}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
      </div>
    </div>
  );
}
