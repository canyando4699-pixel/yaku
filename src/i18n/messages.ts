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
  manageTitle: string;
  cancelBooking: string;
  cancelConfirm: string;
  cancelledTitle: string;
  cancelledBody: string;
  reschedule: string;
  rescheduleTitle: string;
  confirmReschedule: string;
  rescheduledBody: string;
  statusConfirmed: string;
  statusCancelled: string;
  bookingMissing: string;
  slotTaken: string;
  filterUpcoming: string;
  filterCancelled: string;
  filterAll: string;
  tabBookings: string;
  tabAvailability: string;
  availabilityTitle: string;
  availabilityHint: string;
  availabilitySaved: string;
  saveAvailability: string;
  eventTitleLabel: string;
  displayNameLabel: string;
  durationLabel: string;
  windowStartLabel: string;
  windowEndLabel: string;
  weekdaysLabel: string;
  weekdayNames: [string, string, string, string, string, string, string];
  needOneWeekday: string;
  invalidWindow: string;
};

export const messages: Record<Locale, Messages> = {
  de: {
    openSource: "Open Source",
    language: "Sprache",
    eyebrow: "ein Versprechen",
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
    manageTitle: "Dein Termin",
    cancelBooking: "Termin absagen",
    cancelConfirm: "Diesen Termin wirklich absagen?",
    cancelledTitle: "Termin abgesagt",
    cancelledBody: "Der Termin wurde abgesagt. Der Slot ist wieder frei.",
    reschedule: "Verschieben",
    rescheduleTitle: "Neuen Termin wählen",
    confirmReschedule: "Verschiebung speichern",
    rescheduledBody: "Termin wurde verschoben.",
    statusConfirmed: "Bestätigt",
    statusCancelled: "Abgesagt",
    bookingMissing: "Termin nicht gefunden (nur in diesem Browser).",
    slotTaken: "Dieser Slot ist gerade nicht mehr frei.",
    filterUpcoming: "Kommend",
    filterCancelled: "Abgesagt",
    filterAll: "Alle",
    tabBookings: "Buchungen",
    tabAvailability: "Verfügbarkeit",
    availabilityTitle: "Verfügbarkeit",
    availabilityHint:
      "Gilt für den Demo-Buchungslink. Wird lokal in diesem Browser gespeichert.",
    availabilitySaved: "Verfügbarkeit gespeichert.",
    saveAvailability: "Speichern",
    eventTitleLabel: "Termin-Titel",
    displayNameLabel: "Anzeigename",
    durationLabel: "Dauer",
    windowStartLabel: "Von",
    windowEndLabel: "Bis",
    weekdaysLabel: "Wochentage",
    weekdayNames: [
      "Sonntag",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
    ],
    needOneWeekday: "Mindestens einen Wochentag wählen.",
    invalidWindow: "Endzeit muss nach der Startzeit liegen.",
  },
  en: {
    openSource: "Open Source",
    language: "Language",
    eyebrow: "a promise",
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
    manageTitle: "Your appointment",
    cancelBooking: "Cancel appointment",
    cancelConfirm: "Really cancel this appointment?",
    cancelledTitle: "Appointment cancelled",
    cancelledBody: "The appointment was cancelled. The slot is free again.",
    reschedule: "Reschedule",
    rescheduleTitle: "Pick a new time",
    confirmReschedule: "Save new time",
    rescheduledBody: "Appointment was rescheduled.",
    statusConfirmed: "Confirmed",
    statusCancelled: "Cancelled",
    bookingMissing: "Appointment not found (only in this browser).",
    slotTaken: "That slot is no longer available.",
    filterUpcoming: "Upcoming",
    filterCancelled: "Cancelled",
    filterAll: "All",
    tabBookings: "Bookings",
    tabAvailability: "Availability",
    availabilityTitle: "Availability",
    availabilityHint:
      "Applies to the demo booking link. Stored locally in this browser.",
    availabilitySaved: "Availability saved.",
    saveAvailability: "Save",
    eventTitleLabel: "Event title",
    displayNameLabel: "Display name",
    durationLabel: "Duration",
    windowStartLabel: "From",
    windowEndLabel: "Until",
    weekdaysLabel: "Weekdays",
    weekdayNames: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    needOneWeekday: "Select at least one weekday.",
    invalidWindow: "End time must be after start time.",
  },
  ja: {
    openSource: "オープンソース",
    language: "言語",
    eyebrow: "やくそく",
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
    manageTitle: "あなたの予約",
    cancelBooking: "キャンセル",
    cancelConfirm: "この予約をキャンセルしますか？",
    cancelledTitle: "キャンセル済み",
    cancelledBody: "予約をキャンセルしました。枠が再度空きました。",
    reschedule: "変更する",
    rescheduleTitle: "新しい日時を選ぶ",
    confirmReschedule: "変更を保存",
    rescheduledBody: "予約日時を変更しました。",
    statusConfirmed: "確定",
    statusCancelled: "キャンセル",
    bookingMissing: "予約が見つかりません（このブラウザのみ）。",
    slotTaken: "その枠はすでに埋まっています。",
    filterUpcoming: "予定",
    filterCancelled: "キャンセル",
    filterAll: "すべて",
    tabBookings: "予約",
    tabAvailability: "空き時間",
    availabilityTitle: "空き時間",
    availabilityHint:
      "デモ予約リンクに適用されます。このブラウザにローカル保存されます。",
    availabilitySaved: "空き時間を保存しました。",
    saveAvailability: "保存",
    eventTitleLabel: "予定タイトル",
    displayNameLabel: "表示名",
    durationLabel: "時間",
    windowStartLabel: "開始",
    windowEndLabel: "終了",
    weekdaysLabel: "曜日",
    weekdayNames: [
      "日曜日",
      "月曜日",
      "火曜日",
      "水曜日",
      "木曜日",
      "金曜日",
      "土曜日",
    ],
    needOneWeekday: "曜日を1つ以上選んでください。",
    invalidWindow: "終了は開始より後にしてください。",
  },
};
