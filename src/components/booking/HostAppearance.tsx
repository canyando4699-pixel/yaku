"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import {
  BOOKING_BACKGROUNDS,
  resolveBookingBackgroundSrc,
} from "@/lib/booking/backgrounds";
import { defaultHostProfile } from "@/lib/booking/demo";
import {
  loadHostProfile,
  saveHostProfile,
} from "@/lib/booking/hostProfile";
import type { HostProfile } from "@/lib/booking/types";

type HostAppearanceProps = {
  slug?: string;
  onSaved?: (profile: HostProfile) => void;
};

export function HostAppearance({
  slug = defaultHostProfile.slug,
  onSaved,
}: HostAppearanceProps) {
  const { t } = useLocale();
  const [draft, setDraft] = useState<HostProfile>(() => loadHostProfile(slug));

  function selectBackground(id: string) {
    const match = BOOKING_BACKGROUNDS.find((b) => b.id === id);
    if (!match || match.src === null) return;
    const saved = saveHostProfile({ ...draft, backgroundId: id });
    setDraft(saved);
    onSaved?.(saved);
  }

  const initial = draft.displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="office-dc-card p-6 md:p-7">
      <h2 className="font-display text-2xl">{t.dashAppearance}</h2>
      <p className="office-muted mt-2 text-sm">{t.appearanceHint}</p>

      <div className="relative mt-6 aspect-video min-h-[220px] overflow-hidden rounded-[10px] bg-[#12110f]">
        <Image
          src={resolveBookingBackgroundSrc(draft.backgroundId)}
          alt=""
          fill
          className="object-cover object-center"
          aria-hidden
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,17,15,0.78)_0%,rgba(18,17,15,0.68)_45%,rgba(18,17,15,0.82)_100%)]"
        />
        <div className="booking-card absolute bottom-3 left-3 rounded-[1rem] p-3">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden ${draft.avatarShape === "square" ? "rounded-[8px]" : "rounded-full"} bg-white/10 text-sm font-medium ring-1 ring-white/15`}>
              <span aria-hidden>{initial}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{draft.displayName}</p>
              <p className="office-muted text-[11px]">
                {t.appearancePreviewLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {BOOKING_BACKGROUNDS.map((bg) => {
          if (bg.src !== null) {
            return (
              <button
                key={bg.id}
                type="button"
                data-active={draft.backgroundId === bg.id ? "true" : "false"}
                onClick={() => selectBackground(bg.id)}
                className="relative aspect-video overflow-hidden rounded-[8px] ring-1 ring-[color:var(--office-border)] data-[active=true]:ring-2 data-[active=true]:ring-[color:var(--office-chip-active-border)]"
              >
                {
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bg.src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                }
              </button>
            );
          }

          return (
            <div
              key={bg.id}
              aria-disabled="true"
              className="flex aspect-video items-center justify-center rounded-[8px] border border-dashed border-[color:var(--office-border)]"
            >
              <span className="office-muted text-xs">{t.appearanceSoon}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
