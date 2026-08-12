"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";

export function LegalStub({ kind }: { kind: "privacy" | "impressum" }) {
  const { t } = useLocale();
  const title = kind === "privacy" ? t.privacyTitle : t.imprintTitle;
  const body = kind === "privacy" ? t.privacyStub : t.imprintStub;

  return (
    <main className="min-h-dvh bg-[#0f0d0c] px-6 py-16 text-white md:px-10">
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-3xl">{title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60">{body}</p>
        <Link
          href="/"
          className="mt-10 inline-block text-sm text-white/70 transition-colors hover:text-white"
        >
          ← Yaku
        </Link>
      </div>
    </main>
  );
}
