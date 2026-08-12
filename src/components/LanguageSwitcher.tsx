"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { IslandButton } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import { localeLabels, locales, type Locale } from "@/i18n/messages";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dcNav = className.includes("office-dc-nav-row");
  const sideBtn = className.includes("office-side-btn") || dcNav;
  const glass = className.includes("office-glass") || sideBtn;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(next: Locale) {
    setLocale(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={sideBtn ? "relative w-full" : "relative"}>
      {sideBtn ? (
        <button
          type="button"
          className={
            dcNav
              ? className
              : ["yaku-glass office-glass-btn", className].join(" ")
          }
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={t.language}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="flex-1 text-left">{localeLabels[locale]}</span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <Icon name="globe" className="h-3.5 w-3.5 opacity-80" />
            <Icon
              name="chevronDown"
              className={[
                "h-3.5 w-3.5 opacity-55 transition",
                open ? "rotate-180" : "",
              ].join(" ")}
            />
          </span>
        </button>
      ) : (
        <IslandButton
          type="button"
          size="sm"
          variant="island"
          className={className}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={t.language}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name="globe" className="h-3.5 w-3.5 opacity-80" />
          <span>{localeLabels[locale]}</span>
          <Icon
            name="chevronDown"
            className={[
              "h-3.5 w-3.5 opacity-55 transition",
              open ? "rotate-180" : "",
            ].join(" ")}
          />
        </IslandButton>
      )}

      {open ? (
        <ul
          role="listbox"
          aria-label={t.language}
          className={[
            "absolute right-0 z-20 mt-2 min-w-[10.5rem] overflow-hidden p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.28)]",
            dcNav
              ? "office-dc-card !rounded-[10px]"
              : glass
                ? "office-liquid-glass rounded-[1.35rem]"
                : "rounded-[1.35rem] bg-[#111111]",
          ].join(" ")}
        >
          {locales.map((code) => {
            const active = code === locale;
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => choose(code)}
                  className={[
                    "flex w-full items-center justify-between gap-6 text-left text-sm transition",
                    dcNav
                      ? [
                          "rounded-[8px] px-3 py-2",
                          active
                            ? "office-dc-slot-active"
                            : "opacity-80 hover:bg-[color:var(--office-nav-hover)]",
                        ].join(" ")
                      : [
                          "rounded-full px-3.5 py-2.5",
                          active
                            ? glass
                              ? "office-liquid-glass"
                              : "bg-white text-ink"
                            : glass
                              ? "opacity-80 hover:bg-white/10"
                              : "text-white/85 hover:bg-white/10",
                        ].join(" "),
                  ].join(" ")}
                >
                  <span>{localeLabels[code]}</span>
                  {active ? (
                    <Icon
                      name="check"
                      className={[
                        "h-3.5 w-3.5",
                        dcNav ? "text-[color:var(--dc-blue)]" : "text-accent",
                      ].join(" ")}
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
