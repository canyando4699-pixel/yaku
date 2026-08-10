"use client";

import Spline, { type SplineEvent } from "@splinetool/react-spline";
import type { Application } from "@splinetool/runtime";
import {
  Component,
  useCallback,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { useTheme } from "@/i18n/ThemeProvider";

const SCENE =
  "https://prod.spline.design/UoE14L13W2wrHidZ/scene.splinecode";

function themeFromSplineEvent(e: SplineEvent): "light" | "dark" | "toggle" {
  const name = (e.target?.name ?? "").toLowerCase();
  if (/light|sun|day|hell|tag/.test(name)) return "light";
  if (/dark|moon|night|dunkel|nacht/.test(name)) return "dark";
  return "toggle";
}

function ThemeFallbackButtons() {
  const { t } = useLocale();
  const { theme, setTheme } = useTheme();

  return (
    <div className="office-theme-switch" role="group" aria-label="Theme">
      <button
        type="button"
        className="office-theme-switch-btn"
        data-active={theme === "light"}
        aria-pressed={theme === "light"}
        onClick={() => setTheme("light")}
      >
        {t.themeLight}
      </button>
      <button
        type="button"
        className="office-theme-switch-btn"
        data-active={theme === "dark"}
        aria-pressed={theme === "dark"}
        onClick={() => setTheme("dark")}
      >
        {t.themeDark}
      </button>
    </div>
  );
}

class SplineErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Spline theme toggle failed", error, info);
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function SplineThemeScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { setTheme, toggleTheme } = useTheme();
  const [ready, setReady] = useState(false);

  const hideSplineBadge = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const kill = (el: Element) => {
      if (!(el instanceof HTMLElement)) return;
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("opacity", "0", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("pointer-events", "none", "important");
      el.remove();
    };

    root.querySelectorAll("a, button, div, span, img").forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      if (el.tagName === "CANVAS") return;
      if (el.querySelector?.("canvas")) return;
      const href = el.getAttribute("href") ?? "";
      const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      const isBadge =
        href.includes("spline") ||
        /built\s*with\s*spline/i.test(text) ||
        (/^spline$/i.test(text) && text.length < 40);
      if (isBadge) kill(el);
    });
  }, []);

  const disableSplineLogo = useCallback((app: Application) => {
    // Logo is a WebGL overlay pass, not only a DOM node.
    const renderer = (
      app as Application & {
        _renderer?: {
          pipeline?: {
            setWatermark?: (tex: null) => void;
            logoOverlayPass?: { enabled: boolean };
          };
        };
      }
    )._renderer;
    const pipeline = renderer?.pipeline;
    pipeline?.setWatermark?.(null);
    if (pipeline?.logoOverlayPass) {
      pipeline.logoOverlayPass.enabled = false;
    }
  }, []);

  const onSplineMouseDown = useCallback(
    (e: SplineEvent) => {
      const next = themeFromSplineEvent(e);
      if (next === "light") setTheme("light");
      else if (next === "dark") setTheme("dark");
      else toggleTheme();
    },
    [setTheme, toggleTheme],
  );

  const onLoad = useCallback(
    (app: Application) => {
      app.setBackgroundColor("transparent");
      app.setZoom(1);
      disableSplineLogo(app);

      hideSplineBadge();
      const root = rootRef.current;
      if (root) {
        const observer = new MutationObserver(() => hideSplineBadge());
        observer.observe(root, { childList: true, subtree: true });
        window.setTimeout(() => observer.disconnect(), 8000);
      }
      window.setTimeout(() => disableSplineLogo(app), 50);
      window.setTimeout(() => disableSplineLogo(app), 300);
      window.setTimeout(hideSplineBadge, 50);
      window.setTimeout(hideSplineBadge, 300);
      window.setTimeout(hideSplineBadge, 1000);
      window.setTimeout(hideSplineBadge, 2500);

      // Fade in after first paint so it doesn't pop in blank/half-loaded.
      window.requestAnimationFrame(() => {
        window.setTimeout(() => setReady(true), 80);
      });
    },
    [disableSplineLogo, hideSplineBadge],
  );

  return (
    <div
      ref={rootRef}
      className={[
        "office-theme-spline",
        ready ? "office-theme-spline-ready" : "",
      ].join(" ")}
      role="group"
      aria-label="Theme"
    >
      <Spline
        scene={SCENE}
        onLoad={onLoad}
        onSplineMouseDown={onSplineMouseDown}
        className="office-theme-spline-canvas"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

export function OfficeThemeToggle({
  mode = "spline",
}: {
  mode?: "spline" | "buttons";
}) {
  if (mode === "buttons") return <ThemeFallbackButtons />;

  return (
    <SplineErrorBoundary fallback={<ThemeFallbackButtons />}>
      <SplineThemeScene />
    </SplineErrorBoundary>
  );
}
