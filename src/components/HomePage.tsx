"use client";

import { CinematicHome } from "@/components/cinematic/CinematicHome";
import { LocaleProvider } from "@/i18n/LocaleProvider";

export function HomePage() {
  return (
    <LocaleProvider>
      <CinematicHome />
    </LocaleProvider>
  );
}
