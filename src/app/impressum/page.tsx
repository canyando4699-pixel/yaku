import type { Metadata } from "next";
import { LegalStub } from "@/components/LegalStub";
import { LocaleProvider } from "@/i18n/LocaleProvider";

export const metadata: Metadata = {
  title: "Impressum — Yaku",
};

export default function ImpressumPage() {
  return (
    <LocaleProvider>
      <LegalStub kind="impressum" />
    </LocaleProvider>
  );
}
