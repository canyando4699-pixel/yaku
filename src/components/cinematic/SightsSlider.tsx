"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { islandClass } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Messages } from "@/i18n/messages";
import {
  SIGHT_SLIDE_IDS,
  type SightSlideId,
} from "@/lib/cinematic/chapters";

function slideCopy(t: Messages, id: SightSlideId) {
  switch (id) {
    case "booking":
      return { title: t.tourBookingTitle, body: t.tourBookingBody };
    case "availability":
      return { title: t.tourAvailabilityTitle, body: t.tourAvailabilityBody };
    case "dashboard":
      return { title: t.tourDashboardTitle, body: t.tourDashboardBody };
    case "share":
      return { title: t.tourShareTitle, body: t.tourShareBody };
    case "manage":
      return { title: t.tourManageTitle, body: t.tourManageBody };
    case "series":
      return { title: t.tourSeriesTitle, body: t.tourSeriesBody };
  }
}

function SightCard({
  title,
  body,
  listed = false,
}: {
  title: string;
  body: string;
  listed?: boolean;
}) {
  return (
    <article
      data-sight-card
      role={listed ? "listitem" : undefined}
      className="cinematic-sights-card"
    >
      <span className="mb-3 inline-flex h-1.5 w-1.5 rotate-45 bg-accent" />
      <h3 className="font-display text-xl text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/60">{body}</p>
    </article>
  );
}

/**
 * Infinite left-loop feature marquee (liquid glass cards) in the mid progress band.
 */
export function SightsSlider({ active = true }: { active?: boolean }) {
  const { t } = useLocale();

  const slides = SIGHT_SLIDE_IDS.map((id) => ({
    id,
    ...slideCopy(t, id),
  }));

  return (
    <div
      className="cinematic-sights"
      data-sights
      inert={!active ? true : undefined}
      aria-hidden={!active}
    >
      <div className="cinematic-sights-viewport">
        <div className="cinematic-sights-marquee">
          <div
            className="cinematic-sights-track"
            role="list"
            aria-label={t.tourEyebrow}
          >
            {slides.map((slide) => (
              <SightCard
                key={slide.id}
                title={slide.title}
                body={slide.body}
                listed
              />
            ))}
          </div>
          <div className="cinematic-sights-track" aria-hidden="true">
            {slides.map((slide) => (
              <SightCard
                key={`dup-${slide.id}`}
                title={slide.title}
                body={slide.body}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="cinematic-sights-cta mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link href="/b/demo" className={islandClass("accent", "md")}>
          <Icon name="calendar" className="h-3.5 w-3.5" />
          {t.tryDemo}
        </Link>
        <Link href="/host" className={islandClass("soft", "md")}>
          <Icon name="list" className="h-3.5 w-3.5" />
          {t.viewBookings}
        </Link>
      </div>
    </div>
  );
}
