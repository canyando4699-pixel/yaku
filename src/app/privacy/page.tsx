import type { Metadata } from "next";
import { LegalStub } from "@/components/LegalStub";
import { LocaleProvider } from "@/i18n/LocaleProvider";

export const metadata: Metadata = {
  title: "Datenschutz — Yaku",
};

export default function PrivacyPage() {
  return (
    <LocaleProvider>
      <LegalStub kind="privacy" />
    </LocaleProvider>
  );
}
