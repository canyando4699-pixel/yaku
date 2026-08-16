"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { getChapter, type ChapterId } from "@/lib/cinematic/chapters";

type ChapterVideoProps = {
  chapterId: ChapterId;
  /** When true, skip play() and show poster only. */
  posterOnly?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Single active muted loop video per chapter.
 * Brief CSS crossfade on swap; never scrubs currentTime.
 */
export function ChapterVideo({
  chapterId,
  posterOnly = false,
  className = "",
  style,
}: ChapterVideoProps) {
  const { t } = useLocale();
  const chapter = getChapter(chapterId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (posterOnly) return;

    let cancelled = false;

    const el = videoRef.current;
    if (!el) return;

    el.src = chapter.src;
    el.muted = true;

    const onCanPlay = () => {
      if (cancelled) return;
      setReady(true);
      el.muted = true;
      void el.play().then(
        () => {
          if (!cancelled) setNeedsGesture(false);
        },
        () => {
          if (!cancelled) setNeedsGesture(true);
        },
      );
    };
    const onError = () => {
      if (cancelled) return;
      setFailed(true);
    };

    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("error", onError);
    if (el.readyState >= 3) onCanPlay();

    return () => {
      cancelled = true;
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("error", onError);
      el.pause();
    };
  }, [chapterId, chapter.src, posterOnly]);

  useEffect(() => {
    if (!ready || posterOnly) return;
    const id = requestAnimationFrame(() => setFadeIn(true));
    return () => cancelAnimationFrame(id);
  }, [ready, posterOnly]);

  return (
    <div
      className={["cinematic-video-layer", className].filter(Boolean).join(" ")}
      style={style}
      data-ready={ready ? "1" : "0"}
      data-failed={failed ? "1" : "0"}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={chapter.poster}
        alt=""
        className="cinematic-video-poster"
        draggable={false}
      />

      {!posterOnly ? (
        <video
          ref={videoRef}
          className="cinematic-video-el"
          src={chapter.src}
          poster={chapter.poster}
          muted
          playsInline
          loop
          autoPlay
          preload="auto"
          aria-hidden
          style={{
            opacity: fadeIn && !failed ? 1 : 0,
            transition: "opacity 200ms",
          }}
        />
      ) : null}

      {needsGesture ? (
        <button
          type="button"
          className="cinematic-video-play"
          aria-label={t.cinematicPlay}
          onClick={() => {
            const el = videoRef.current;
            if (!el) return;
            el.muted = true;
            void el.play().then(
              () => setNeedsGesture(false),
              () => setNeedsGesture(true),
            );
          }}
        >
          {t.cinematicPlay}
        </button>
      ) : null}
    </div>
  );
}
