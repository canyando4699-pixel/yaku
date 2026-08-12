"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";

export function CinematicFooter() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#0f0d0c] px-6 py-10 text-sm text-white/55 md:px-10">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <p className="text-white/45">© Yaku {year}</p>
        <nav
          className="flex flex-wrap items-center gap-x-5 gap-y-3"
          aria-label={`${t.footerPrivacy} / ${t.footerImprint}`}
        >
          <Link
            href="/privacy"
            className="transition-colors hover:text-white/80"
          >
            {t.footerPrivacy}
          </Link>
          <Link
            href="/impressum"
            className="transition-colors hover:text-white/80"
          >
            {t.footerImprint}
          </Link>
        </nav>
        <a
          href="https://github.com/canyando4699-pixel/yaku"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-white/80"
        >
          GitHub
        </a>
        <span className="text-white/40">{t.openSource}</span>
      </div>
    </footer>
  );
}
