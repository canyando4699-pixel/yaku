export type ChapterId = "intro" | "mid" | "cta";

export type ChapterDef = {
  id: ChapterId;
  src: string;
  poster: string;
  /** Global progress [0,1] when this chapter starts owning the stage */
  enter: number;
  /** Global progress [0,1] when ownership ends */
  exit: number;
  motion: {
    scaleFrom: number;
    scaleTo: number;
    blurFrom: number;
    blurTo: number;
  };
};

/** Scroll track height in CSS viewport units (Mostar-scale sticky). */
export const CINEMATIC_TRACK_VH = 360;

export const CHAPTERS: readonly ChapterDef[] = [
  {
    id: "intro",
    src: "/videos/yaku-ch1-intro.mp4",
    poster: "/videos/yaku-ch1-intro-poster.jpg",
    enter: 0,
    exit: 0.36,
    motion: {
      scaleFrom: 1.08,
      scaleTo: 1,
      blurFrom: 0,
      blurTo: 2,
    },
  },
  {
    id: "mid",
    src: "/videos/yaku-ch2-mid.mp4",
    poster: "/videos/yaku-ch2-mid-poster.jpg",
    enter: 0.28,
    exit: 0.72,
    motion: {
      scaleFrom: 1.04,
      scaleTo: 1,
      blurFrom: 1,
      blurTo: 0,
    },
  },
  {
    id: "cta",
    src: "/videos/yaku-ch3-cta.mp4",
    poster: "/videos/yaku-ch3-cta-poster.jpg",
    enter: 0.64,
    exit: 1,
    motion: {
      scaleFrom: 1.06,
      scaleTo: 1,
      blurFrom: 1.5,
      blurTo: 0,
    },
  },
] as const;

export const SIGHT_SLIDE_IDS = [
  "booking",
  "availability",
  "dashboard",
  "share",
  "manage",
  "series",
] as const;

export type SightSlideId = (typeof SIGHT_SLIDE_IDS)[number];

/** Local chapter progress 0…1 within [enter, exit]. */
export function chapterLocalProgress(
  globalP: number,
  chapter: ChapterDef,
): number {
  const span = chapter.exit - chapter.enter;
  if (span <= 0) return 0;
  return Math.min(1, Math.max(0, (globalP - chapter.enter) / span));
}

/** Active chapter for decoder swap — prefers highest enter ≤ p. */
export function getActiveChapter(p: number): ChapterId {
  let active: ChapterId = CHAPTERS[0].id;
  for (const ch of CHAPTERS) {
    if (p >= ch.enter) active = ch.id;
  }
  // Soft handoff: if past previous exit and into next enter, prefer later chapter
  for (let i = CHAPTERS.length - 1; i >= 0; i--) {
    const ch = CHAPTERS[i];
    if (p >= ch.enter && p <= ch.exit) return ch.id;
  }
  return active;
}

export function getChapter(id: ChapterId): ChapterDef {
  return CHAPTERS.find((c) => c.id === id) ?? CHAPTERS[0];
}
