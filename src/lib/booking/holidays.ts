export const DE_HOLIDAY_IDS = [
  "new_year",
  "good_friday",
  "easter_monday",
  "labour_day",
  "ascension",
  "whit_monday",
  "german_unity",
  "christmas_day",
  "boxing_day",
] as const;
export type DeHolidayId = (typeof DE_HOLIDAY_IDS)[number];

export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
  );
}

export function holidayDate(id: DeHolidayId, year: number): Date {
  switch (id) {
    case "new_year":
      return new Date(year, 0, 1);
    case "good_friday":
      return addDays(easterSunday(year), -2);
    case "easter_monday":
      return addDays(easterSunday(year), 1);
    case "labour_day":
      return new Date(year, 4, 1);
    case "ascension":
      return addDays(easterSunday(year), 39);
    case "whit_monday":
      return addDays(easterSunday(year), 50);
    case "german_unity":
      return new Date(year, 9, 3);
    case "christmas_day":
      return new Date(year, 11, 25);
    case "boxing_day":
      return new Date(year, 11, 26);
  }
}

export function deHolidayOn(
  year: number,
  monthIndex: number,
  day: number,
  enabledIds: readonly DeHolidayId[],
): DeHolidayId | null {
  for (const id of enabledIds) {
    const at = holidayDate(id, year);
    if (
      at.getFullYear() === year &&
      at.getMonth() === monthIndex &&
      at.getDate() === day
    ) {
      return id;
    }
  }
  return null;
}

export function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
