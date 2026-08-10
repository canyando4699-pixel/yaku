"use client";

import Spline from "@splinetool/react-spline";
import type { Application } from "@splinetool/runtime";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { useTheme, type ThemeMode } from "@/i18n/ThemeProvider";

const SCENE =
  "https://prod.spline.design/UoE14L13W2wrHidZ/scene.splinecode";

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

function flipSpline(app: Application) {
  const preferred = ["Toggle BG", "toggle", "Toggle", "sun", "darkness"];
  for (const name of preferred) {
    if (app.findObjectByName(name)) {
      app.emitEvent("mouseDown", name);
      return true;
    }
  }

  const match = app
    .getAllObjects()
    .find((o) => /toggle|sun|darkness/i.test(o.name ?? ""));
  if (!match?.name) return false;
  app.emitEvent("mouseDown", match.name);
  return true;
}

function SplineThemeScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const themeRef = useRef<ThemeMode>("dark");
  const visualRef = useRef<ThemeMode>("dark");
  const { theme, setTheme } = useTheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    if (!ready) return;
    const app = appRef.current;
    if (!app) return;
    if (visualRef.current === theme) return;
    if (flipSpline(app)) visualRef.current = theme;
  }, [ready, theme]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onPointerDown = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const next: ThemeMode =
        e.clientX < rect.left + rect.width / 2 ? "dark" : "light";

      if (themeRef.current === next) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      themeRef.current = next;
      visualRef.current = next;
      setTheme(next);
    };

    root.addEventListener("pointerdown", onPointerDown, true);
    return () => root.removeEventListener("pointerdown", onPointerDown, true);
  }, [setTheme]);

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

  const onLoad = useCallback(
    (app: Application) => {
      appRef.current = app;
      visualRef.current = "dark";
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

      if (themeRef.current === "light" && flipSpline(app)) {
        visualRef.current = "light";
      }

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
