"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { BookingCalendar } from "@/components/BookingCalendar";
import { Icon } from "@/components/ui/Icon";
import { islandClass } from "@/components/ui/Island";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Messages } from "@/i18n/messages";
import { defaultHostProfile } from "@/lib/booking/demo";
import { loadHostProfile } from "@/lib/booking/hostProfile";
import { isBookableDay } from "@/lib/booking/slots";
import type { HostProfile } from "@/lib/booking/types";

const FEATURE_IDS = [
  "booking",
  "availability",
  "dashboard",
  "share",
  "manage",
  "series",
] as const;

type FeatureId = (typeof FEATURE_IDS)[number];

const CARD_W = 260;
const CARD_H = 320;
const RADIUS = 340;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function useSectionEnter(ref: RefObject<HTMLElement | null>) {
  const [enter, setEnter] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setEnter(1);
      return;
    }

    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.18;
      const end = vh * -0.08;
      const next = clamp01((start - rect.top) / (start - end));
      setEnter((prev) => (Math.abs(prev - next) < 0.002 ? prev : next));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref]);

  return enter;
}

function useAutoRotation(
  active: boolean,
  ringRef: RefObject<HTMLDivElement | null>,
  onIndex: (index: number) => void,
  degPerSec = 18,
) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !active) return;

    let frame = 0;
    let last = performance.now();
    let angle = 0;
    let lastIndex = -1;
    const step = 360 / FEATURE_IDS.length;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      angle = (angle + degPerSec * dt) % 360;
      const el = ringRef.current;
      if (el) el.style.transform = `rotateY(${angle}deg)`;

      const index =
        ((Math.round(-angle / step) % FEATURE_IDS.length) +
          FEATURE_IDS.length) %
        FEATURE_IDS.length;
      if (index !== lastIndex) {
        lastIndex = index;
        onIndex(index);
      }

      const cards = el?.children;
      if (cards) {
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i] as HTMLElement;
          const cardAngle = i * step;
          const facing = Math.cos(((cardAngle + angle) * Math.PI) / 180);
          const lit = clamp01((facing - 0.35) / 0.65);
          const visible = facing > 0.55;
          card.style.opacity = visible ? String(0.45 + lit * 0.55) : "0";
          card.style.visibility = visible ? "visible" : "hidden";
          card.style.filter = facing > 0.92 ? "none" : `brightness(${0.55 + lit * 0.35}) blur(${(1 - lit) * 1.2}px)`;
          card.style.pointerEvents = facing > 0.85 ? "auto" : "none";
          card.style.zIndex = String(Math.round(facing * 100));
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, degPerSec, onIndex, ringRef]);
}

function featureCopy(t: Messages, id: FeatureId) {
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

function PanelShell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#121214] shadow-[0_28px_70px_rgba(0,0,0,0.55)]"
      style={{ width: CARD_W, height: CARD_H }}
    >
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
        <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
        <p className="text-[10px] tracking-[0.22em] text-white/45 uppercase">
          {label}
        </p>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}

function FeaturePanel({
  id,
  host,
  previewDate,
  onSelectDate,
  t,
}: {
  id: FeatureId;
  host: HostProfile;
  previewDate: Date;
  onSelectDate: (d: Date) => void;
  t: Messages;
}) {
  if (id === "booking") {
    return (
      <PanelShell label={t.tourBookingTitle}>
        <div className="origin-center scale-[0.72]">
          <BookingCalendar
            selected={previewDate}
            onSelect={onSelectDate}
            isDayEnabled={(date) => isBookableDay(date, host)}
          />
        </div>
      </PanelShell>
    );
  }

  if (id === "availability") {
    return (
      <PanelShell label={t.availabilityTitle}>
        <div className="w-full space-y-2.5">
          {[
            [t.windowStartLabel, "09:00"],
            [t.windowEndLabel, "17:00"],
            [t.durationLabel, "30 min"],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between rounded-xl bg-white/[0.05] px-3 py-2.5 text-sm text-white/80"
            >
              <span className="text-white/40">{k}</span>
              <span>{v}</span>
            </div>
          ))}
          <div className="flex flex-wrap gap-1 pt-1">
            {t.weekdays.slice(0, 5).map((d) => (
              <span
                key={d}
                className="rounded-md bg-accent/15 px-2 py-1 text-[10px] text-accent"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </PanelShell>
    );
  }

  if (id === "dashboard") {
    return (
      <PanelShell label={t.viewBookings}>
        <div className="w-full space-y-2">
          {[
            { icon: "calendar" as const, label: t.dashSchedule, on: true },
            { icon: "list" as const, label: t.dashList, on: false },
            { icon: "clock" as const, label: t.dashAvailability, on: false },
            { icon: "link" as const, label: t.dashShareLink, on: false },
          ].map((row) => (
            <div
              key={row.label}
              className={[
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm",
                row.on
                  ? "bg-white/10 text-white ring-1 ring-white/10"
                  : "bg-white/[0.03] text-white/50",
              ].join(" ")}
            >
              <Icon name={row.icon} className="h-3.5 w-3.5" />
              {row.label}
            </div>
          ))}
        </div>
      </PanelShell>
    );
  }

  if (id === "share") {
    return (
      <PanelShell label={t.dashShareLink}>
        <div className="w-full space-y-4 text-center">
          <Icon name="link" className="mx-auto h-8 w-8 text-accent" />
          <div className="rounded-xl bg-white/[0.05] px-3 py-3 font-mono text-xs text-white/70">
            yaku.app/b/demo
          </div>
          <div
            className={islandClass(
              "accent",
              "md",
              "pointer-events-none w-full justify-center",
            )}
          >
            {t.copyLink}
          </div>
        </div>
      </PanelShell>
    );
  }

  if (id === "manage") {
    return (
      <PanelShell label={t.manageTitle}>
        <div className="w-full space-y-4">
          <div className="rounded-xl bg-white/[0.05] px-3 py-3">
            <p className="text-sm text-white/90">Alex · 30 min</p>
            <p className="mt-1 text-xs text-accent">{t.statusConfirmed}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="rounded-xl bg-white/10 px-3 py-2.5 text-center text-xs text-white/80">
              {t.reschedule}
            </span>
            <span className="rounded-xl bg-white/[0.05] px-3 py-2.5 text-center text-xs text-white/50">
              {t.cancelBooking}
            </span>
          </div>
        </div>
      </PanelShell>
    );
  }

  return (
    <PanelShell label={t.eventTypesTitle}>
      <div className="w-full space-y-2">
        <div className="rounded-xl bg-accent/15 px-3 py-2.5 text-sm text-accent">
          {t.seriesWeekly.replace("{n}", "4")}
        </div>
        <div className="rounded-xl bg-white/[0.05] px-3 py-2.5 text-sm text-white/55">
          {t.connectGoogleCalendar}
        </div>
        <div className="rounded-xl bg-white/[0.05] px-3 py-2.5 text-sm text-white/55">
          {t.connectAppleCalendar}
        </div>
      </div>
    </PanelShell>
  );
}

export function FeatureScroll() {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const enter = useSectionEnter(sectionRef);
  const [previewDate, setPreviewDate] = useState(() => new Date());
  const [host, setHost] = useState<HostProfile>(defaultHostProfile);
  const [radius, setRadius] = useState(RADIUS);
  const [activeIndex, setActiveIndex] = useState(0);
  const enterT = easeOutCubic(enter);
  const handleIndex = useCallback((i: number) => setActiveIndex(i), []);

  useAutoRotation(enterT > 0.55, ringRef, handleIndex);

  useEffect(() => {
    setHost(loadHostProfile(defaultHostProfile.slug));
  }, []);

  useEffect(() => {
    const sync = () => {
      const w = window.innerWidth;
      if (w < 640) setRadius(220);
      else if (w < 1024) setRadius(280);
      else setRadius(RADIUS);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const count = FEATURE_IDS.length;
  const step = 360 / count;
  const copy = featureCopy(t, FEATURE_IDS[activeIndex]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[160vh] bg-[#0f0d0c]"
      aria-label={t.tourEyebrow}
    >
      <div className="sticky top-0 flex min-h-dvh flex-col">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <iframe
            src="https://my.spline.design/100followers-PkU5UZJQoYCU6oJ0j4y2OgzW/"
            title=""
            loading="lazy"
            className="absolute left-1/2 top-1/2 h-[120%] w-[120%] max-w-none -translate-x-1/2 -translate-y-1/2 border-0"
            style={{ opacity: 0.35 + enterT * 0.65 }}
            allow="autoplay"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, rgba(15,13,12,${0.55 - enterT * 0.25}) 0%, rgba(15,13,12,0.35) 40%, rgba(15,13,12,0.75) 100%)`,
            }}
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: enterT,
            background:
              "radial-gradient(ellipse at 50% 42%, rgba(225,6,0,0.1), transparent 52%)",
          }}
        />

        <div
          className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-12 will-change-[opacity,transform] md:px-10"
          style={{
            opacity: enterT,
            transform: `translate3d(0, ${(1 - enterT) * 28}px, 0)`,
          }}
        >
          <div className="relative z-20 flex h-[9.5rem] w-full max-w-lg shrink-0 flex-col items-center px-2 pb-4 text-center md:h-[10.5rem]">
            <p className="text-sm tracking-[0.2em] text-[#ff6b5e] uppercase">
              {t.tourEyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl text-white md:text-4xl">
              {copy.title}
            </h2>
            <p className="mx-auto mt-3 line-clamp-2 max-w-md text-sm leading-relaxed text-white/60 md:text-base">
              {copy.body}
            </p>
          </div>

          <div
            className="relative z-0 mt-2 h-[460px] w-full max-w-6xl shrink-0 sm:h-[520px]"
            style={{
              perspective: "1600px",
              perspectiveOrigin: "50% 50%",
            }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                ref={ringRef}
                className="relative will-change-transform"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  transformStyle: "preserve-3d",
                  transform: "rotateY(0deg)",
                }}
              >
                {FEATURE_IDS.map((id, i) => {
                  const angle = i * step;
                  return (
                    <div
                      key={id}
                      className="absolute left-0 top-0"
                      style={{
                        width: CARD_W,
                        height: CARD_H,
                        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                        transformStyle: "preserve-3d",
                      }}
                      aria-hidden={i !== activeIndex}
                    >
                      <FeaturePanel
                        id={id}
                        host={host}
                        previewDate={previewDate}
                        onSelectDate={setPreviewDate}
                        t={t}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative z-20 mt-3 flex shrink-0 items-center gap-2">
            {FEATURE_IDS.map((id, i) => (
              <span
                key={id}
                className={[
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activeIndex ? "w-7 bg-accent" : "w-1.5 bg-white/25",
                ].join(" ")}
              />
            ))}
          </div>

          <div className="relative z-20 mt-5 flex shrink-0 flex-wrap items-center justify-center gap-3">
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
      </div>
    </section>
  );
}
