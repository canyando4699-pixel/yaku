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
  stepSchedule: string;
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
  businessCardTitle: string;
  avatarLabel: string;
  uploadAvatar: string;
  removeAvatar: string;
  bioLabel: string;
  durationLabel: string;
  windowStartLabel: string;
  windowEndLabel: string;
  weekdaysLabel: string;
  weekdayNames: [string, string, string, string, string, string, string];
  needOneWeekday: string;
  invalidWindow: string;
  password: string;
  passwordConfirm: string;
  signIn: string;
  createAccount: string;
  alreadyHaveAccount: string;
  noAccountYet: string;
  logout: string;
  authHintLocal: string;
  authErrorExists: string;
  authErrorInvalid: string;
  authErrorMismatch: string;
  authErrorWeak: string;
  continueWithGoogle: string;
  continueWithApple: string;
  orContinueWithEmail: string;
  authOauthSoon: string;
  dashSchedule: string;
  dashList: string;
  dashAvailability: string;
  dashShareLink: string;
  dashIntegrations: string;
  dashMyActivity: string;
  dashSelectBooking: string;
  integrationsTitle: string;
  integrationsHint: string;
  connectGoogleCalendar: string;
  connectAppleCalendar: string;
  copyLink: string;
  linkCopied: string;
  prevWeek: string;
  nextWeek: string;
  thisWeek: string;
  today: string;
  viewDay: string;
  viewWeek: string;
  viewMonth: string;
  viewYear: string;
  themeLight: string;
  themeDark: string;
  agendaToday: string;
  agendaTomorrow: string;
  listSearch: string;
  listActiveBookings: string;
  listShowing: string;
  listSortNewest: string;
  listSortOldest: string;
  listStatus: string;
  dashWeekCount: string;
  openBookingLink: string;
  backToDashboard: string;
  hostTimezoneLabel: string;
  hostTimezoneShort: string;
  guestTimezoneLabel: string;
  bufferBeforeLabel: string;
  bufferAfterLabel: string;
  minNoticeLabel: string;
  noticeNone: string;
  maxPerDayLabel: string;
  unlimited: string;
  eventTypesTitle: string;
  eventTypesHint: string;
  addEventType: string;
  removeEventType: string;
  eventTypeDefaultTitle: string;
  needOneEventType: string;
  allowSeriesLabel: string;
  maxSeriesLabel: string;
  seriesCountLabel: string;
  seriesOnce: string;
  seriesWeekly: string;
  seriesHint: string;
  seriesUnavailable: string;
  tourEyebrow: string;
  tourBookingTitle: string;
  tourBookingBody: string;
  tourAvailabilityTitle: string;
  tourAvailabilityBody: string;
  tourDashboardTitle: string;
  tourDashboardBody: string;
  tourShareTitle: string;
  tourShareBody: string;
  tourManageTitle: string;
  tourManageBody: string;
  tourSeriesTitle: string;
  tourSeriesBody: string;
  cinematicLoading: string;
  cinematicScrollHint: string;
  cinematicPlay: string;
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
    viewBookings: "Host-Dashboard",
    prevMonth: "Vorheriger Monat",
    nextMonth: "Nächster Monat",
    weekdays: ["MO", "DI", "MI", "DO", "FR", "SA", "SO"],
    bookingWith: "Termin mit",
    stepSchedule: "Termin wählen",
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
    businessCardTitle: "Visitenkarte",
    avatarLabel: "Foto",
    uploadAvatar: "Foto hochladen",
    removeAvatar: "Foto entfernen",
    bioLabel: "Beschreibung",
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
    password: "Passwort",
    passwordConfirm: "Passwort bestätigen",
    signIn: "Anmelden",
    createAccount: "Konto erstellen",
    alreadyHaveAccount: "Schon ein Konto?",
    noAccountYet: "Noch kein Konto?",
    logout: "Abmelden",
    authHintLocal:
      "Lokal in diesem Browser — später mit Supabase ersetzbar. Kein echtes Backend.",
    authErrorExists: "Für diese E-Mail gibt es schon ein Konto.",
    authErrorInvalid: "E-Mail oder Passwort stimmt nicht.",
    authErrorMismatch: "Passwörter stimmen nicht überein.",
    authErrorWeak: "Name, E-Mail und mind. 6 Zeichen Passwort nötig.",
    continueWithGoogle: "Mit Google fortfahren",
    continueWithApple: "Mit Apple fortfahren",
    orContinueWithEmail: "oder",
    authOauthSoon: "Google- und Apple-Login kommen als Nächstes.",
    dashSchedule: "Plan",
    dashList: "Liste",
    dashAvailability: "Verfügbarkeit",
    dashShareLink: "Link teilen",
    dashIntegrations: "Integrationen",
    dashMyActivity: "Meine Termine",
    dashSelectBooking: "Wähle einen Termin in der Woche.",
    integrationsTitle: "Kalender verbinden",
    integrationsHint:
      "Google- und Apple-Kalender kommen als Nächstes. Noch lokal, ohne Cloud-Sync.",
    connectGoogleCalendar: "Google Kalender",
    connectAppleCalendar: "Apple Kalender",
    copyLink: "Link kopieren",
    linkCopied: "Link kopiert",
    prevWeek: "Vorherige Woche",
    nextWeek: "Nächste Woche",
    thisWeek: "Diese Woche",
    today: "Heute",
    viewDay: "Tag",
    viewWeek: "Woche",
    viewMonth: "Monat",
    viewYear: "Jahr",
    themeLight: "Hell",
    themeDark: "Dunkel",
    agendaToday: "Heute",
    agendaTomorrow: "Morgen",
    listSearch: "Suchen",
    listActiveBookings: "Bestätigte Termine",
    listShowing: "{from}–{to} von {total}",
    listSortNewest: "Neueste",
    listSortOldest: "Älteste",
    listStatus: "Status",
    dashWeekCount: "{n} Termine diese Woche",
    openBookingLink: "Buchungslink öffnen",
    backToDashboard: "Zurück zum Dashboard",
    hostTimezoneLabel: "Deine Zeitzone",
    hostTimezoneShort: "Host",
    guestTimezoneLabel: "Zeitzone anzeigen",
    bufferBeforeLabel: "Puffer vorher",
    bufferAfterLabel: "Puffer nachher",
    minNoticeLabel: "Mindestvorlauf",
    noticeNone: "Sofort",
    maxPerDayLabel: "Max. Termine / Tag",
    unlimited: "Unbegrenzt",
    eventTypesTitle: "Event-Typen",
    eventTypesHint: "Gäste wählen einen Typ auf dem Buchungslink.",
    addEventType: "Typ hinzufügen",
    removeEventType: "Entfernen",
    eventTypeDefaultTitle: "Neuer Termin",
    needOneEventType: "Mindestens einen Event-Typ anlegen.",
    allowSeriesLabel: "Serienbuchung erlauben (wöchentlich)",
    maxSeriesLabel: "Max. Termine in einer Serie",
    seriesCountLabel: "Wie oft?",
    seriesOnce: "Nur einmal",
    seriesWeekly: "{n}× wöchentlich",
    seriesHint: "Gleicher Wochentag und Uhrzeit — nur wenn alle Slots frei sind.",
    seriesUnavailable: "Serie nicht möglich: ein Folgetermin ist belegt oder gesperrt.",
    tourEyebrow: "Was Yaku kann",
    tourBookingTitle: "Buchungslink",
    tourBookingBody:
      "Gäste wählen Datum und Uhrzeit auf deinem öffentlichen Link — ohne Account.",
    tourAvailabilityTitle: "Verfügbarkeit",
    tourAvailabilityBody:
      "Fenster, Wochentage, Puffer und Event-Typen einmal setzen. Der Rest folgt.",
    tourDashboardTitle: "Host-Dashboard",
    tourDashboardBody:
      "Woche, Liste und eingehende Termine — dein Office für den Alltag.",
    tourShareTitle: "Link teilen",
    tourShareBody:
      "Einen Link kopieren, fertig. Kein Setup-Theater, kein Lock-in.",
    tourManageTitle: "Termin verwalten",
    tourManageBody:
      "Absagen oder verschieben — Gast und Host behalten die Kontrolle.",
    tourSeriesTitle: "Serien & Integrationen",
    tourSeriesBody:
      "Wöchentliche Serien heute. Google- und Apple-Kalender als Nächstes.",
    cinematicLoading: "Lädt…",
    cinematicScrollHint: "Scrollen",
    cinematicPlay: "Abspielen",
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
    viewBookings: "Host dashboard",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    weekdays: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
    bookingWith: "Meeting with",
    stepSchedule: "Pick a time",
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
    businessCardTitle: "Business card",
    avatarLabel: "Photo",
    uploadAvatar: "Upload photo",
    removeAvatar: "Remove photo",
    bioLabel: "Bio",
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
    password: "Password",
    passwordConfirm: "Confirm password",
    signIn: "Sign in",
    createAccount: "Create account",
    alreadyHaveAccount: "Already have an account?",
    noAccountYet: "No account yet?",
    logout: "Sign out",
    authHintLocal:
      "Stored locally in this browser — replaceable with Supabase later. Not a real backend.",
    authErrorExists: "An account with this email already exists.",
    authErrorInvalid: "Email or password is incorrect.",
    authErrorMismatch: "Passwords do not match.",
    authErrorWeak: "Name, email, and a password of at least 6 characters are required.",
    continueWithGoogle: "Continue with Google",
    continueWithApple: "Continue with Apple",
    orContinueWithEmail: "or",
    authOauthSoon: "Google and Apple sign-in are coming next.",
    dashSchedule: "Schedule",
    dashList: "List",
    dashAvailability: "Availability",
    dashShareLink: "Share link",
    dashIntegrations: "Integrations",
    dashMyActivity: "My activity",
    dashSelectBooking: "Select a booking in the week view.",
    integrationsTitle: "Connect calendars",
    integrationsHint:
      "Google and Apple Calendar come next. Still local — no cloud sync yet.",
    connectGoogleCalendar: "Google Calendar",
    connectAppleCalendar: "Apple Calendar",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    prevWeek: "Previous week",
    nextWeek: "Next week",
    thisWeek: "This week",
    today: "Today",
    viewDay: "Day",
    viewWeek: "Week",
    viewMonth: "Month",
    viewYear: "Year",
    themeLight: "Light",
    themeDark: "Dark",
    agendaToday: "Today",
    agendaTomorrow: "Tomorrow",
    listSearch: "Search",
    listActiveBookings: "Confirmed bookings",
    listShowing: "{from}–{to} of {total}",
    listSortNewest: "Newest",
    listSortOldest: "Oldest",
    listStatus: "Status",
    dashWeekCount: "{n} bookings this week",
    openBookingLink: "Open booking link",
    backToDashboard: "Back to dashboard",
    hostTimezoneLabel: "Your timezone",
    hostTimezoneShort: "Host",
    guestTimezoneLabel: "Show times in",
    bufferBeforeLabel: "Buffer before",
    bufferAfterLabel: "Buffer after",
    minNoticeLabel: "Minimum notice",
    noticeNone: "Immediate",
    maxPerDayLabel: "Max bookings / day",
    unlimited: "Unlimited",
    eventTypesTitle: "Event types",
    eventTypesHint: "Guests pick a type on your booking link.",
    addEventType: "Add type",
    removeEventType: "Remove",
    eventTypeDefaultTitle: "New meeting",
    needOneEventType: "Add at least one event type.",
    allowSeriesLabel: "Allow weekly series bookings",
    maxSeriesLabel: "Max sessions in a series",
    seriesCountLabel: "How many?",
    seriesOnce: "Just once",
    seriesWeekly: "{n}× weekly",
    seriesHint: "Same weekday and time — only if every slot is free.",
    seriesUnavailable: "Series unavailable: a follow-up slot is taken or blocked.",
    tourEyebrow: "What Yaku does",
    tourBookingTitle: "Booking link",
    tourBookingBody:
      "Guests pick a date and time on your public link — no account needed.",
    tourAvailabilityTitle: "Availability",
    tourAvailabilityBody:
      "Set windows, weekdays, buffers, and event types once. The rest follows.",
    tourDashboardTitle: "Host dashboard",
    tourDashboardBody:
      "Week view, list, and incoming bookings — your office for the day-to-day.",
    tourShareTitle: "Share link",
    tourShareBody:
      "Copy one link and you're done. No setup theater, no lock-in.",
    tourManageTitle: "Manage booking",
    tourManageBody:
      "Cancel or reschedule — guest and host stay in control.",
    tourSeriesTitle: "Series & integrations",
    tourSeriesBody:
      "Weekly series today. Google and Apple calendars next.",
    cinematicLoading: "Loading…",
    cinematicScrollHint: "Scroll",
    cinematicPlay: "Play",
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
    viewBookings: "ホスト画面",
    prevMonth: "前の月",
    nextMonth: "次の月",
    weekdays: ["月", "火", "水", "木", "金", "土", "日"],
    bookingWith: "ミーティング：",
    stepSchedule: "日時を選ぶ",
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
    businessCardTitle: "名刺",
    avatarLabel: "写真",
    uploadAvatar: "写真をアップロード",
    removeAvatar: "写真を削除",
    bioLabel: "自己紹介",
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
    password: "パスワード",
    passwordConfirm: "パスワード確認",
    signIn: "ログイン",
    createAccount: "アカウント作成",
    alreadyHaveAccount: "すでにアカウントがありますか？",
    noAccountYet: "アカウントはまだですか？",
    logout: "ログアウト",
    authHintLocal:
      "このブラウザにローカル保存 — 後でSupabaseに置き換え可能。本番バックエンドではありません。",
    authErrorExists: "このメールのアカウントは既にあります。",
    authErrorInvalid: "メールまたはパスワードが違います。",
    authErrorMismatch: "パスワードが一致しません。",
    authErrorWeak: "名前・メール・6文字以上のパスワードが必要です。",
    continueWithGoogle: "Googleで続ける",
    continueWithApple: "Appleで続ける",
    orContinueWithEmail: "または",
    authOauthSoon: "GoogleとAppleのログインは次に追加します。",
    dashSchedule: "スケジュール",
    dashList: "リスト",
    dashAvailability: "空き時間",
    dashShareLink: "リンク共有",
    dashIntegrations: "連携",
    dashMyActivity: "マイ予定",
    dashSelectBooking: "週の予定から選択してください。",
    integrationsTitle: "カレンダー連携",
    integrationsHint:
      "Google と Apple カレンダーは次のステップです。まだローカルのみで、クラウド同期はありません。",
    connectGoogleCalendar: "Google カレンダー",
    connectAppleCalendar: "Apple カレンダー",
    copyLink: "リンクをコピー",
    linkCopied: "コピーしました",
    prevWeek: "前の週",
    nextWeek: "次の週",
    thisWeek: "今週",
    today: "今日",
    viewDay: "日",
    viewWeek: "週",
    viewMonth: "月",
    viewYear: "年",
    themeLight: "ライト",
    themeDark: "ダーク",
    agendaToday: "今日",
    agendaTomorrow: "明日",
    listSearch: "検索",
    listActiveBookings: "確定済みの予約",
    listShowing: "{from}–{to} / {total}",
    listSortNewest: "新しい順",
    listSortOldest: "古い順",
    listStatus: "ステータス",
    dashWeekCount: "今週の予約 {n} 件",
    openBookingLink: "予約リンクを開く",
    backToDashboard: "ダッシュボードに戻る",
    hostTimezoneLabel: "あなたのタイムゾーン",
    hostTimezoneShort: "ホスト",
    guestTimezoneLabel: "表示タイムゾーン",
    bufferBeforeLabel: "前のバッファ",
    bufferAfterLabel: "後のバッファ",
    minNoticeLabel: "最短予約可能時間",
    noticeNone: "すぐ",
    maxPerDayLabel: "1日の上限",
    unlimited: "無制限",
    eventTypesTitle: "イベント種類",
    eventTypesHint: "ゲストは予約リンクで種類を選びます。",
    addEventType: "種類を追加",
    removeEventType: "削除",
    eventTypeDefaultTitle: "新しい予定",
    needOneEventType: "イベント種類を1つ以上追加してください。",
    allowSeriesLabel: "毎週の連続予約を許可",
    maxSeriesLabel: "連続予約の最大回数",
    seriesCountLabel: "回数",
    seriesOnce: "1回のみ",
    seriesWeekly: "毎週 {n} 回",
    seriesHint: "同じ曜日・時間 — すべての枠が空いている場合のみ。",
    seriesUnavailable: "連続予約不可：次の枠が埋まっているか制限されています。",
    tourEyebrow: "Yakuでできること",
    tourBookingTitle: "予約リンク",
    tourBookingBody:
      "ゲストは公開リンクで日付と時間を選ぶだけ — アカウント不要。",
    tourAvailabilityTitle: "空き時間",
    tourAvailabilityBody:
      "時間帯・曜日・バッファ・イベント種類を一度設定。あとはそれに従う。",
    tourDashboardTitle: "ホスト画面",
    tourDashboardBody:
      "週表示・リスト・受信予約 — 日常のためのオフィス。",
    tourShareTitle: "リンク共有",
    tourShareBody:
      "リンクをコピーして終わり。セットアップ芝居もロックインもない。",
    tourManageTitle: "予約の管理",
    tourManageBody:
      "キャンセルも変更も — ゲストもホストも主導権を保てる。",
    tourSeriesTitle: "連続予約と連携",
    tourSeriesBody:
      "毎週の連続予約は今日から。Google・Appleカレンダーは次のステップ。",
    cinematicLoading: "読み込み中…",
    cinematicScrollHint: "スクロール",
    cinematicPlay: "再生",
  },
};
