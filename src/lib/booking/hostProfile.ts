import { defaultHostProfile } from "@/lib/booking/demo";
import type { HostProfile } from "@/lib/booking/types";

function storageKey(slug: string) {
  return `yaku-host-${slug}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function normalizeHost(raw: Partial<HostProfile> & { slug: string }): HostProfile {
  const base =
    raw.slug === defaultHostProfile.slug
      ? defaultHostProfile
      : { ...defaultHostProfile, slug: raw.slug };

  const weekdays =
    Array.isArray(raw.weekdays) && raw.weekdays.length > 0
      ? raw.weekdays.filter((d) => d >= 0 && d <= 6)
      : base.weekdays;

  const durationMinutes = raw.durationMinutes ?? base.durationMinutes;
  let windowStartMinutes = raw.windowStartMinutes ?? base.windowStartMinutes;
  let windowEndMinutes = raw.windowEndMinutes ?? base.windowEndMinutes;

  if (windowEndMinutes <= windowStartMinutes) {
    windowStartMinutes = base.windowStartMinutes;
    windowEndMinutes = base.windowEndMinutes;
  }

  return {
    slug: raw.slug,
    displayName: raw.displayName?.trim() || base.displayName,
    eventTitle: raw.eventTitle?.trim() || base.eventTitle,
    durationMinutes: [15, 30, 45, 60].includes(durationMinutes)
      ? durationMinutes
      : base.durationMinutes,
    timezone: raw.timezone || base.timezone,
    weekdays,
    windowStartMinutes,
    windowEndMinutes,
  };
}

export function loadHostProfile(slug: string): HostProfile {
  if (!canUseStorage()) {
    return slug === defaultHostProfile.slug
      ? defaultHostProfile
      : { ...defaultHostProfile, slug };
  }

  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) {
      return slug === defaultHostProfile.slug
        ? defaultHostProfile
        : { ...defaultHostProfile, slug };
    }
    const parsed = JSON.parse(raw) as Partial<HostProfile>;
    return normalizeHost({ ...parsed, slug });
  } catch {
    return slug === defaultHostProfile.slug
      ? defaultHostProfile
      : { ...defaultHostProfile, slug };
  }
}

export function saveHostProfile(profile: HostProfile): HostProfile {
  const next = normalizeHost(profile);
  if (canUseStorage()) {
    window.localStorage.setItem(storageKey(next.slug), JSON.stringify(next));
  }
  return next;
}
