import type { Locale } from "@/i18n/messages";

export type DailyQuote = {
  kanji: string;
  gloss: Record<Locale, string>;
  source: Record<Locale, string>;
};

function personSource(
  name: Record<Locale, string>,
  role: Record<Locale, string>,
): Record<Locale, string> {
  return {
    de: `${name.de} · ${role.de}`,
    en: `${name.en} · ${role.en}`,
    ja: `${name.ja} · ${role.ja}`,
  };
}

function labelSource(label: Record<Locale, string>): Record<Locale, string> {
  return label;
}

export const DAILY_QUOTES: readonly DailyQuote[] = [
  {
    kanji: "約束は心の絆",
    gloss: {
      de: "Ein Versprechen ist ein Band zwischen Herzen.",
      en: "A promise is a bond between hearts.",
      ja: "心と心をつなぐ、ひとつの約束。",
    },
    source: labelSource({
      de: "Yaku",
      en: "Yaku",
      ja: "Yaku",
    }),
  },
  {
    kanji: "一期一会",
    gloss: {
      de: "Jede Begegnung gibt es nur einmal.",
      en: "Treasure every encounter; it happens only once.",
      ja: "一生に一度の出会い。",
    },
    source: personSource(
      { de: "Sen no Rikyū", en: "Sen no Rikyū", ja: "千利休" },
      { de: "Teemeister", en: "tea master", ja: "茶人" },
    ),
  },
  {
    kanji: "光陰矢の如し",
    gloss: {
      de: "Die Zeit fliegt wie ein Pfeil.",
      en: "Time flies like an arrow.",
      ja: "歳月は矢のように過ぎる。",
    },
    source: labelSource({
      de: "Japanisches Sprichwort",
      en: "Japanese proverb",
      ja: "ことわざ",
    }),
  },
  {
    kanji: "急がば回れ",
    gloss: {
      de: "Eile mit Weile.",
      en: "More haste, less speed.",
      ja: "急ぐなら、遠回りせよ。",
    },
    source: labelSource({
      de: "Japanisches Sprichwort",
      en: "Japanese proverb",
      ja: "ことわざ",
    }),
  },
  {
    kanji: "石の上にも三年",
    gloss: {
      de: "Auch auf einem Stein: drei Jahre.",
      en: "Perseverance pays.",
      ja: "忍耐すれば、いつか実を結ぶ。",
    },
    source: labelSource({
      de: "Japanisches Sprichwort",
      en: "Japanese proverb",
      ja: "ことわざ",
    }),
  },
  {
    kanji: "七転び八起き",
    gloss: {
      de: "Siebenmal fallen, achtmal aufstehen.",
      en: "Fall seven times, stand up eight.",
      ja: "何度倒れても、また立ち上がる。",
    },
    source: labelSource({
      de: "Japanisches Sprichwort",
      en: "Japanese proverb",
      ja: "ことわざ",
    }),
  },
  {
    kanji: "和を以て貴しとなす",
    gloss: {
      de: "Harmonie ist das Höchste.",
      en: "Harmony is to be valued.",
      ja: "和をもって尊しとなす。",
    },
    source: personSource(
      { de: "Prinz Shōtoku", en: "Prince Shōtoku", ja: "聖徳太子" },
      { de: "Regent", en: "regent", ja: "摂政" },
    ),
  },
  {
    kanji: "継続は力なり",
    gloss: {
      de: "Stetigkeit ist Kraft.",
      en: "Continuity is power.",
      ja: "続けることが力になる。",
    },
    source: labelSource({
      de: "Japanisches Sprichwort",
      en: "Japanese proverb",
      ja: "ことわざ",
    }),
  },
  {
    kanji: "初心忘るべからず",
    gloss: {
      de: "Den Anfängergeist nicht vergessen.",
      en: "Never forget your beginner's mind.",
      ja: "初心を忘れてはならない。",
    },
    source: personSource(
      { de: "Zeami", en: "Zeami", ja: "世阿弥" },
      { de: "Nō-Meister", en: "Noh master", ja: "能楽師" },
    ),
  },
  {
    kanji: "温故知新",
    gloss: {
      de: "Altes prüfen, Neues erkennen.",
      en: "Learn from the past to know the new.",
      ja: "故きを温ねて新しきを知る。",
    },
    source: personSource(
      { de: "Konfuzius", en: "Confucius", ja: "孔子" },
      { de: "Philosoph", en: "philosopher", ja: "思想家" },
    ),
  },
  {
    kanji: "雨降って地固まる",
    gloss: {
      de: "Nach Regen festigt sich der Boden.",
      en: "After rain, the earth hardens.",
      ja: "困難のあと、関係は強くなる。",
    },
    source: labelSource({
      de: "Japanisches Sprichwort",
      en: "Japanese proverb",
      ja: "ことわざ",
    }),
  },
  {
    kanji: "待てば海路の日和あり",
    gloss: {
      de: "Wer wartet, bekommt fairen Wind.",
      en: "Wait, and fair weather comes.",
      ja: "待てば、いつか良い時が来る。",
    },
    source: labelSource({
      de: "Japanisches Sprichwort",
      en: "Japanese proverb",
      ja: "ことわざ",
    }),
  },
  {
    kanji: "縁は異なもの",
    gloss: {
      de: "Verbindungen sind rätselhaft.",
      en: "Fate knits strange connections.",
      ja: "縁は不思議なもの。",
    },
    source: labelSource({
      de: "Japanisches Sprichwort",
      en: "Japanese proverb",
      ja: "ことわざ",
    }),
  },
  {
    kanji: "一日一生",
    gloss: {
      de: "Jeder Tag ist ein Leben.",
      en: "Each day is a lifetime.",
      ja: "一日を一生のように大切に。",
    },
    source: labelSource({
      de: "Japanisches Sprichwort",
      en: "Japanese proverb",
      ja: "ことわざ",
    }),
  },
  {
    kanji: "以心伝心",
    gloss: {
      de: "Von Herz zu Herz.",
      en: "Heart to heart, without words.",
      ja: "言葉なく、心が通じる。",
    },
    source: labelSource({
      de: "Zen-Buddhismus",
      en: "Zen Buddhism",
      ja: "禅",
    }),
  },
  {
    kanji: "千里の道も一歩から",
    gloss: {
      de: "Auch der weiteste Weg beginnt mit einem Schritt.",
      en: "A thousand-mile road begins with one step.",
      ja: "千里の道も一歩から。",
    },
    source: personSource(
      { de: "Laozi", en: "Laozi", ja: "老子" },
      { de: "Dao-Weiser", en: "Daoist sage", ja: "道家" },
    ),
  },
  {
    kanji: "花鳥風月",
    gloss: {
      de: "Blüten, Vögel, Wind und Mond.",
      en: "The beauties of nature.",
      ja: "自然の美しさを愛でる。",
    },
    source: labelSource({
      de: "Japanische Ästhetik",
      en: "Japanese aesthetic",
      ja: "日本の美意識",
    }),
  },
  {
    kanji: "守破離",
    gloss: {
      de: "Bewahren, brechen, lösen.",
      en: "Follow, break, leave.",
      ja: "守って、破って、離れる。",
    },
    source: labelSource({
      de: "Kampfkunst",
      en: "Martial arts",
      ja: "武道",
    }),
  },
];

export function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getFullYear(), 0, 1);
  const now = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((now - start) / 86400000) + 1;
}

export function getDailyQuote(date: Date): DailyQuote {
  const i = (dayOfYear(date) - 1) % DAILY_QUOTES.length;
  return DAILY_QUOTES[i]!;
}
