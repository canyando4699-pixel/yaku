import type { HostProfile } from "@/lib/booking/types";

export const demoHost: HostProfile = {
  slug: "demo",
  displayName: "Yaku Demo",
  eventTitle: "30-min meeting",
  durationMinutes: 30,
  timezone: "Europe/Berlin",
};

export function getHostBySlug(slug: string): HostProfile | null {
  if (slug === demoHost.slug) return demoHost;
  return null;
}
