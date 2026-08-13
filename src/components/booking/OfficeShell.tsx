"use client";

import type { ReactNode } from "react";
import { useTheme } from "@/i18n/ThemeProvider";

export type OfficeRoom =
  | "schedule"
  | "list"
  | "availability"
  | "appearance"
  | "share"
  | "integrations";

type OfficeShellProps = {
  children: ReactNode;
  sidebar: ReactNode;
};

export function OfficeShell({ children, sidebar }: OfficeShellProps) {
  const { theme } = useTheme();

  return (
    <div
      className="office-shell relative flex h-full min-h-0 flex-1 overflow-hidden"
      data-theme={theme}
    >
      <aside className="office-dc-side relative z-10 hidden w-[220px] shrink-0 flex-col md:flex">
        <div className="relative z-[1] flex min-h-0 flex-1 flex-col">{sidebar}</div>
      </aside>

      <div className="office-content relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
