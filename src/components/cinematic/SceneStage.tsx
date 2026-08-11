"use client";

import { ChapterVideo } from "@/components/cinematic/ChapterVideo";
import type { ChapterId } from "@/lib/cinematic/chapters";

type SceneStageProps = {
  chapterId: ChapterId;
  posterOnly?: boolean;
};

/**
 * Sticky full-bleed stage. Transforms driven by CSS vars from the engine.
 */
export function SceneStage({
  chapterId,
  posterOnly = false,
}: SceneStageProps) {
  return (
    <div className="cinematic-stage" data-cinematic-stage>
      <div className="cinematic-stage-media">
        <ChapterVideo
          key={chapterId}
          chapterId={chapterId}
          posterOnly={posterOnly}
        />
      </div>

      <div className="cinematic-stage-vignette" aria-hidden />
      <div className="cinematic-stage-bottom-fade" aria-hidden />
      <div className="cinematic-stage-split" aria-hidden />
    </div>
  );
}
