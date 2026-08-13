import {
  CHAPTERS,
  chapterLocalProgress,
  getActiveChapter,
  type ChapterId,
} from "./chapters";

export type CinematicEngineOptions = {
  /** Lerp factor toward target scroll (0–1). Higher = snappier. */
  lerp?: number;
  /** Enable mouse parallax (--mx / --my). */
  parallax?: boolean;
  onProgress?: (p: number, chapter: ChapterId) => void;
};

export type CinematicEngine = {
  destroy: () => void;
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Mostar-like sticky scroll engine.
 * Writes CSS vars on `root`; never touches video.currentTime.
 */
export function createCinematicEngine(
  root: HTMLElement,
  opts: CinematicEngineOptions = {},
): CinematicEngine {
  const lerpFactor = opts.lerp ?? 0.12;
  const parallaxEnabled = opts.parallax ?? true;

  let raf = 0;
  let smoothY = 0;
  let targetY = 0;
  let mx = 0;
  let my = 0;
  let targetMx = 0;
  let targetMy = 0;
  let lastChapter: ChapterId | null = null;
  let destroyed = false;
  let trackEl: HTMLElement | null = null;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const allowParallax =
    parallaxEnabled && !reduceMotion && !coarsePointer;

  const getTrack = () => {
    if (!trackEl || !trackEl.isConnected) {
      trackEl = root.querySelector(
        "[data-cinematic-track]",
      ) as HTMLElement | null;
    }
    return trackEl;
  };

  const scrollableHeight = () => {
    const track = getTrack();
    return track
      ? Math.max(1, track.offsetHeight - window.innerHeight)
      : 1;
  };

  const readTarget = () => {
    const track = getTrack();
    if (!track) {
      targetY = window.scrollY;
      return;
    }
    const rect = track.getBoundingClientRect();
    const scrollable = Math.max(1, track.offsetHeight - window.innerHeight);
    const scrolled = Math.min(
      scrollable,
      Math.max(0, -rect.top),
    );
    targetY = scrolled;
  };

  const writeVars = (p: number, chapter: ChapterId) => {
    const ch = CHAPTERS.find((c) => c.id === chapter) ?? CHAPTERS[0];
    const local = chapterLocalProgress(p, ch);
    const p1 = chapterLocalProgress(p, CHAPTERS[0]);
    const p2 = chapterLocalProgress(p, CHAPTERS[1]);
    const p3 = chapterLocalProgress(p, CHAPTERS[2]);

    const useSettle =
      ch.motion.scaleSettle != null && ch.motion.scaleSettle > 0;
    let scale: number;
    let blur: number;
    let mxWrite: number;
    let myWrite: number;
    let originX: string;
    let originY: string;
    let focusY: string;
    let focusX: string;

    if (useSettle) {
      const t = clamp01(local / ch.motion.scaleSettle!);
      const eased = 1 - (1 - t) ** 4;
      scale = lerp(ch.motion.scaleFrom, ch.motion.scaleTo, eased);
      blur = lerp(ch.motion.blurFrom, ch.motion.blurTo, eased);
      mxWrite = mx * eased;
      myWrite = my * eased;
      originX = `${((ch.motion.originX ?? 0.5) * 100).toFixed(2)}%`;
      originY = `${((ch.motion.originY ?? 0.5) * 100).toFixed(2)}%`;
      focusY = `${((ch.motion.focusY ?? 0) * (1 - eased)).toFixed(2)}%`;
      let panFocus = 0;
      if (
        ch.motion.panX != null &&
        ch.motion.panSettle != null &&
        ch.motion.panSettle > (ch.motion.scaleSettle ?? 0)
      ) {
        const start = ch.motion.scaleSettle ?? 0;
        const panT = clamp01((local - start) / (ch.motion.panSettle - start));
        const panEased = 1 - (1 - panT) ** 3;
        panFocus = (ch.motion.panX ?? 0) * panEased;
      }
      focusX = `${panFocus.toFixed(2)}%`;
    } else {
      scale = lerp(ch.motion.scaleFrom, ch.motion.scaleTo, local);
      blur = lerp(ch.motion.blurFrom, ch.motion.blurTo, local);
      mxWrite = mx;
      myWrite = my;
      originX = "50%";
      originY = "50%";
      focusY = "0%";
      focusX = "0%";
    }

    const split = Math.sin(local * Math.PI);

    root.style.setProperty("--p", p.toFixed(4));
    root.style.setProperty("--p1", p1.toFixed(4));
    root.style.setProperty("--p2", p2.toFixed(4));
    root.style.setProperty("--p3", p3.toFixed(4));
    root.style.setProperty("--scale", scale.toFixed(4));
    root.style.setProperty("--blur", `${blur.toFixed(2)}px`);
    root.style.setProperty("--split", split.toFixed(4));
    root.style.setProperty("--mx", mxWrite.toFixed(4));
    root.style.setProperty("--my", myWrite.toFixed(4));
    root.style.setProperty("--origin-x", originX);
    root.style.setProperty("--origin-y", originY);
    root.style.setProperty("--focus-y", focusY);
    root.style.setProperty("--focus-x", focusX);
    root.dataset.chapter = chapter;
  };

  const emitProgress = (p: number, chapter: ChapterId) => {
    if (chapter === lastChapter) return;
    lastChapter = chapter;
    opts.onProgress?.(p, chapter);
  };

  const syncImmediate = () => {
    readTarget();
    const p = clamp01(targetY / scrollableHeight());
    const chapter = getActiveChapter(p);
    writeVars(p, chapter);
    emitProgress(p, chapter);
  };

  const tick = () => {
    if (destroyed) return;

    readTarget();
    smoothY = lerp(smoothY, targetY, lerpFactor);
    mx = lerp(mx, targetMx, 0.08);
    my = lerp(my, targetMy, 0.08);

    const p = clamp01(smoothY / scrollableHeight());
    const chapter = getActiveChapter(p);
    writeVars(p, chapter);
    emitProgress(p, chapter);

    raf = requestAnimationFrame(tick);
  };

  const onScroll = () => {
    readTarget();
  };

  const onResize = () => {
    trackEl = null;
    readTarget();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!allowParallax) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetMx = clamp01((e.clientX - cx) / cx + 0.5) * 2 - 1;
    targetMy = clamp01((e.clientY - cy) / cy + 0.5) * 2 - 1;
  };

  readTarget();
  smoothY = targetY;

  window.addEventListener("resize", onResize);
  if (allowParallax) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
  }

  if (reduceMotion) {
    syncImmediate();
    window.addEventListener("scroll", syncImmediate, { passive: true });
    return {
      destroy: () => {
        destroyed = true;
        window.removeEventListener("scroll", syncImmediate);
        window.removeEventListener("resize", onResize);
      },
    };
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  raf = requestAnimationFrame(tick);

  return {
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
    },
  };
}
