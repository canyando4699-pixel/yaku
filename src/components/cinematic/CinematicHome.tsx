"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChapterVideo } from "@/components/cinematic/ChapterVideo";
import { CinematicFooter } from "@/components/cinematic/CinematicFooter";
import { SceneStage } from "@/components/cinematic/SceneStage";
import { SightsSlider } from "@/components/cinematic/SightsSlider";
import { StoryPanels } from "@/components/cinematic/StoryPanels";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Icon } from "@/components/ui/Icon";
import { islandClass } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import {
  CHAPTERS,
  CINEMATIC_TRACK_VH,
  type ChapterId,
} from "@/lib/cinematic/chapters";
import { createCinematicEngine } from "@/lib/cinematic/engine";

const CROSSFADE_MS = 200;

function useMatchMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);
  return matches;
}

function CinematicHeader() {
  const { t } = useLocale();
  return (
    <header className="cinematic-chrome relative z-20 flex items-center justify-between px-6 py-5 md:px-10">
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
          className={[islandClass("islandMuted", "sm"), "hidden sm:inline-flex"].join(
            " ",
          )}
        >
          <Icon name="list" className="h-3.5 w-3.5 text-white/70" />
          <span>{t.viewBookings}</span>
        </Link>
        <a
          href="https://github.com/canyando4699-pixel/yaku"
          target="_blank"
          rel="noreferrer"
          className={islandClass("islandMuted", "sm", "inline-flex")}
        >
          <span>GitHub</span>
        </a>
        <LanguageSwitcher />
      </div>
    </header>
  );
}

function ReducedMotionHome() {
  const { t } = useLocale();
  return (
    <div className="cinematic-reduced bg-[#0f0d0c] text-white">
      <CinematicHeader />
      {CHAPTERS.map((ch) => (
        <section
          key={ch.id}
          className="relative flex min-h-dvh flex-col justify-end overflow-hidden px-6 pb-16 pt-24 md:px-10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ch.poster}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#0f0d0c] via-[#0f0d0c]/70 to-black/20"
          />
          <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
            {ch.id === "intro" ? (
              <>
                <p className="text-[11px] tracking-[0.28em] text-white/50 uppercase">
                  {t.eyebrow}
                </p>
                <h1 className="mt-3 font-display text-4xl md:text-5xl">Yaku</h1>
                <p
                  lang="ja"
                  className="mt-6 font-display text-2xl leading-snug tracking-[0.06em] text-white/90"
                >
                  {t.quoteKanji}
                </p>
                <p
                  lang="ja"
                  aria-hidden
                  className="mt-4 font-display text-lg leading-none text-white/35"
                >
                  約
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white">
                  {t.quoteGloss}
                </p>
              </>
            ) : null}
            {ch.id === "mid" ? (
              <>
                <p className="text-sm tracking-[0.2em] text-[#ff6b5e] uppercase">
                  {t.tourEyebrow}
                </p>
                <h2 className="mt-3 font-display text-3xl">{t.tourBookingTitle}</h2>
                <p className="mt-3 text-sm text-white/60">{t.tourBookingBody}</p>
                <div className="mt-8">
                  <SightsSlider />
                </div>
              </>
            ) : null}
            {ch.id === "cta" ? (
              <>
                <h2 className="font-display text-3xl md:text-4xl">
                  {t.headlineLine1} {t.headlineLine2}
                </h2>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/b/demo" className={islandClass("accent", "lg")}>
                    <Icon name="calendar" className="h-4 w-4" />
                    {t.tryDemo}
                  </Link>
                  <Link href="/host" className={islandClass("soft", "lg")}>
                    <Icon name="list" className="h-4 w-4" />
                    {t.viewBookings}
                  </Link>
                </div>
              </>
            ) : null}
          </div>
        </section>
      ))}
      <CinematicFooter />
    </div>
  );
}

function CinematicMotionHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [chapterId, setChapterId] = useState<ChapterId>("intro");
  const [outgoingId, setOutgoingId] = useState<ChapterId | null>(null);
  const mobile = useMatchMedia("(max-width: 768px)");
  const prevChapter = useRef<ChapterId>("intro");
  const fadeTimerRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const engine = createCinematicEngine(root, {
      parallax: !mobile,
      onProgress: (_p, chapter) => {
        if (chapter !== prevChapter.current) {
          window.clearTimeout(fadeTimerRef.current);
          setOutgoingId(prevChapter.current);
          prevChapter.current = chapter;
          setChapterId(chapter);
          fadeTimerRef.current = window.setTimeout(() => {
            setOutgoingId(null);
          }, CROSSFADE_MS + 20);
        }
      },
    });

    return () => {
      window.clearTimeout(fadeTimerRef.current);
      engine.destroy();
    };
  }, [mobile]);

  return (
    <div
      ref={rootRef}
      className="cinematic-root bg-[#0f0d0c]"
      data-chapter={chapterId}
    >
      <div
        className="cinematic-track"
        data-cinematic-track
        style={{ height: `${CINEMATIC_TRACK_VH}vh` }}
      >
        <div className="cinematic-sticky">
          <CinematicHeader />

          <div className="cinematic-stage-wrap">
            {outgoingId && outgoingId !== chapterId ? (
              <div className="cinematic-crossfade-out" aria-hidden>
                <ChapterVideo chapterId={outgoingId} posterOnly />
              </div>
            ) : null}
            <SceneStage chapterId={chapterId} />
            <StoryPanels activeChapter={chapterId} />
            <SightsSlider active={chapterId === "mid"} />
          </div>
        </div>
      </div>
      <CinematicFooter />
    </div>
  );
}

export function CinematicHome() {
  const reduced = useMatchMedia("(prefers-reduced-motion: reduce)");
  if (reduced) return <ReducedMotionHome />;
  return <CinematicMotionHome />;
}
