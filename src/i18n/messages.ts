export type Locale = "de" | "en" | "ja";

export const locales: Locale[] = ["de", "en", "ja"];

export const localeLabels: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  ja: "日本語",
};

export const localeHtmlLang: Record<Locale, string> = {
  de: "de",
  en: "en",
  ja: "ja",
};

export const localeDate: Record<Locale, string> = {
  de: "de-DE",
  en: "en-US",
  ja: "ja-JP",
};

export type Messages = {
  openSource: string;
  language: string;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  subcopy: string;
  badgeMvp: string;
  badgeFeatures: string;
  tryDemo: string;
  viewBookings: string;
  prevMonth: string;
  nextMonth: string;
  weekdays: [string, string, string, string, string, string, string];
  bookingWith: string;
  pickDate: string;
  pickTime: string;
  yourDetails: string;
  noSlots: string;
  name: string;
  email: string;
  note: string;
  noteOptional: string;
  confirmBooking: string;
  back: string;
  bookedTitle: string;
  bookedBody: string;
  downloadIcs: string;
  bookAnother: string;
  hostBookingsTitle: string;
  hostBookingsEmpty: string;
  hostBookingsHint: string;
  guest: string;
  when: string;
  demoOnly: string;
  notFound: string;
};

export const messages: Record<Locale, Messages> = {
  de: {
    openSource: "Open Source",
    language: "Sprache",
    eyebrow: "約 — ein Versprechen",
    headlineLine1: "Ein Termin.",
    headlineLine2: "Ohne Ballast.",
    subcopy:
      "Yaku macht aus freier Zeit echte Termine. Leichtgewichtig, open source, selbst hostbar — ein Buchungslink ohne Lock-in.",
    badgeMvp: "MVP in Arbeit",
    badgeFeatures: "Buchungslink · Verfügbarkeit · Dashboard",
    tryDemo: "Demo buchen",
    viewBookings: "Buchungen ansehen",
    prevMonth: "Vorheriger Monat",
    nextMonth: "Nächster Monat",
    weekdays: ["MO", "DI", "MI", "DO", "FR", "SA", "SO"],
    bookingWith: "Termin mit",
    pickDate: "Datum wählen",
    pickTime: "Uhrzeit wählen",
    yourDetails: "Deine Daten",
    noSlots: "Keine freien Zeiten an diesem Tag.",
    name: "Name",
    email: "E-Mail",
    note: "Notiz",
    noteOptional: "optional",
    confirmBooking: "Termin buchen",
    back: "Zurück",
    bookedTitle: "Termin gebucht",
    bookedBody: "Deine Verabredung steht. Lade den Kalendereintrag herunter.",
    downloadIcs: "Kalenderdatei (.ics)",
    bookAnother: "Weiteren Termin buchen",
    hostBookingsTitle: "Eingehende Buchungen",
    hostBookingsEmpty: "Noch keine Buchungen.",
    hostBookingsHint: "Demo speichert Buchungen lokal in diesem Browser.",
    guest: "Gast",
    when: "Wann",
    demoOnly: "Demo · lokal gespeichert",
    notFound: "Dieser Buchungslink existiert nicht.",
  },
  en: {
    openSource: "Open Source",
    language: "Language",
    eyebrow: "約 — a promise",
    headlineLine1: "One appointment.",
    headlineLine2: "No bloat.",
    subcopy:
      "Yaku turns open time into real appointments. Lightweight, open source, self-hostable — a booking link without the lock-in.",
    badgeMvp: "MVP in progress",
    badgeFeatures: "Booking link · Availability · Dashboard",
    tryDemo: "Try demo booking",
    viewBookings: "View bookings",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    weekdays: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
    bookingWith: "Meeting with",
    pickDate: "Pick a date",
    pickTime: "Pick a time",
    yourDetails: "Your details",
    noSlots: "No open times on this day.",
    name: "Name",
    email: "Email",
    note: "Note",
    noteOptional: "optional",
    confirmBooking: "Book appointment",
    back: "Back",
    bookedTitle: "Appointment booked",
    bookedBody: "Your meeting is set. Download the calendar invite.",
    downloadIcs: "Calendar file (.ics)",
    bookAnother: "Book another",
    hostBookingsTitle: "Incoming bookings",
    hostBookingsEmpty: "No bookings yet.",
    hostBookingsHint: "Demo stores bookings locally in this browser.",
    guest: "Guest",
    when: "When",
    demoOnly: "Demo · stored locally",
    notFound: "This booking link does not exist.",
  },
  ja: {
    openSource: "オープンソース",
    language: "言語",
    eyebrow: "約 — やくそく",
    headlineLine1: "ひとつの約束。",
    headlineLine2: "余分なものはなし。",
    subcopy:
      "Yakuは空き時間を、ほんとうの予定に変えます。軽くて、オープンソースで、自分でホストできる。しばられない予約リンク。",
    badgeMvp: "MVP開発中",
    badgeFeatures: "予約リンク · 空き時間 · ダッシュボード",
    tryDemo: "デモを予約",
    viewBookings: "予約一覧",
    prevMonth: "前の月",
    nextMonth: "次の月",
    weekdays: ["月", "火", "水", "木", "金", "土", "日"],
    bookingWith: "ミーティング：",
    pickDate: "日付を選ぶ",
    pickTime: "時間を選ぶ",
    yourDetails: "あなたの情報",
    noSlots: "この日は空きがありません。",
    name: "名前",
    email: "メール",
    note: "メモ",
    noteOptional: "任意",
    confirmBooking: "予約する",
    back: "戻る",
    bookedTitle: "予約完了",
    bookedBody: "約束が決まりました。カレンダーファイルをダウンロードできます。",
    downloadIcs: "カレンダーファイル (.ics)",
    bookAnother: "別の予約をする",
    hostBookingsTitle: "受信した予約",
    hostBookingsEmpty: "まだ予約はありません。",
    hostBookingsHint: "デモは予約をこのブラウザにローカル保存します。",
    guest: "ゲスト",
    when: "日時",
    demoOnly: "デモ · ローカル保存",
    notFound: "この予約リンクは存在しません。",
  },
};
