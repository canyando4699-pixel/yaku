"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

const MAX_TILT_X = 1.5;
const MAX_TILT_Y = 2;

function applyTilt(
  el: HTMLElement | null,
  clientX: number,
  clientY: number,
) {
  if (!el) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return;
  const px = (clientX - r.left) / r.width;
  const py = (clientY - r.top) / r.height;
  const rotateX = (0.5 - py) * MAX_TILT_X * 2;
  const rotateY = (px - 0.5) * MAX_TILT_Y * 2;
  el.style.setProperty("--office-tilt-x", `${rotateX.toFixed(2)}deg`);
  el.style.setProperty("--office-tilt-y", `${rotateY.toFixed(2)}deg`);
}

function resetTilt(el: HTMLElement | null) {
  if (!el) return;
  el.style.setProperty("--office-tilt-x", "0deg");
  el.style.setProperty("--office-tilt-y", "0deg");
}

type DivProps = {
  className?: string;
  children: ReactNode;
};

export function OfficeTiltDiv({ className, children }: DivProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={(e: PointerEvent<HTMLDivElement>) =>
        applyTilt(ref.current, e.clientX, e.clientY)
      }
      onPointerLeave={() => resetTilt(ref.current)}
    >
      {children}
    </div>
  );
}
