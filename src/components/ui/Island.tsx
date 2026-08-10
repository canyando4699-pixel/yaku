import type { ButtonHTMLAttributes, ReactNode } from "react";

export const islandBase =
  "yaku-glass inline-flex items-center justify-center gap-2 rounded-[0.95rem] font-medium";

export const islandVariants = {
  island: "text-white",
  islandMuted: "text-white/90",
  accent: "yaku-glass-accent text-white",
  soft: "text-white/90",
  success:
    "border-emerald-400/40 bg-[linear-gradient(155deg,rgba(31,143,78,0.55),rgba(31,143,78,0.22))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_28px_rgba(31,143,78,0.28)]",
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
        "yaku-glass inline-flex items-center gap-2 rounded-[0.95rem] px-3.5 py-2 text-sm text-white",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
