import type { ButtonHTMLAttributes, ReactNode } from "react";

export const islandBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition active:scale-[0.98]";

export const islandVariants = {
  island:
    "bg-[#111111] text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:bg-black",
  islandMuted:
    "bg-[#1c1c1e] text-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.14)] hover:bg-[#2c2c2e]",
  accent:
    "bg-accent text-white shadow-[0_10px_28px_rgba(225,6,0,0.35)] hover:brightness-110",
  soft: "bg-white/80 text-ink shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/5 hover:bg-white",
  success:
    "bg-[#1f8f4e] text-white shadow-[0_10px_28px_rgba(31,143,78,0.35)]",
} as const;

export const islandSizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
  icon: "h-10 w-10",
  iconSm: "h-9 w-9",
} as const;

export function islandClass(
  variant: keyof typeof islandVariants = "island",
  size: keyof typeof islandSizes = "md",
  className = "",
) {
  return [
    islandBase,
    islandVariants[variant],
    islandSizes[size],
    className,
  ].join(" ");
}

type IslandButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof islandVariants;
  size?: keyof typeof islandSizes;
  children: ReactNode;
};

export function IslandButton({
  variant = "island",
  size = "md",
  className = "",
  children,
  ...props
}: IslandButtonProps) {
  return (
    <button className={islandClass(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function IslandPill({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full bg-[#111111] px-3.5 py-2 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.16)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
