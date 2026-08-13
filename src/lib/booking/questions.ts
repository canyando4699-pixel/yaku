import type {
  BookingAnswer,
  InviteeQuestion,
  InviteeQuestionType,
} from "@/lib/booking/types";

export const MAX_INVITEE_QUESTIONS = 10;

const QUESTION_TYPES: InviteeQuestionType[] = [
  "text",
  "textarea",
  "phone",
  "radio",
  "checkbox",
  "dropdown",
];

export function createInviteeQuestion(type: InviteeQuestionType): InviteeQuestion {
  const options =
    type === "radio" || type === "dropdown"
      ? ["", ""]
      : type === "checkbox"
        ? [""]
        : [];
  return {
    id: `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    label: "",
    required: false,
    options,
  };
}

export function normalizeQuestions(raw: unknown): InviteeQuestion[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  return raw.slice(0, MAX_INVITEE_QUESTIONS).flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Partial<InviteeQuestion>;
    let id = String(row.id || `q_${index}`);
    if (seen.has(id)) id = `q_${index}`;
    if (seen.has(id)) id = `q_${index}_${seen.size}`;
    seen.add(id);
    return [
      {
        id,
        type: QUESTION_TYPES.includes(row.type as InviteeQuestionType)
          ? (row.type as InviteeQuestionType)
          : "text",
        label: typeof row.label === "string" ? row.label : "",
        required: row.required === true,
        options: Array.isArray(row.options)
          ? row.options.map((o) => (typeof o === "string" ? o : ""))
          : [],
      },
    ];
  });
}

function questionIsShown(q: InviteeQuestion): boolean {
  if (!q.label.trim()) return false;
  if (q.type === "radio" || q.type === "dropdown") {
    return q.options.filter((o) => o.trim()).length >= 2;
  }
  if (q.type === "checkbox") {
    return q.options.filter((o) => o.trim()).length >= 1;
  }
  return true;
}

export function questionIsEmpty(
  q: InviteeQuestion,
  value: string | string[] | undefined,
): boolean {
  if (Array.isArray(value)) {
    return !value.some((entry) => entry.trim());
  }
  if (typeof value === "string") {
    return !value.trim();
  }
  return true;
}

export function requiredQuestionsAnswered(
  questions: InviteeQuestion[],
  answersMap: Record<string, string | string[]>,
): boolean {
  return questions.every((q) => {
    if (!questionIsShown(q) || !q.required) return true;
    return !questionIsEmpty(q, answersMap[q.id]);
  });
}

export function snapshotAnswers(
  questions: InviteeQuestion[],
  answersMap: Record<string, string | string[]>,
): BookingAnswer[] {
  return questions.filter(questionIsShown).map((q) => ({
    questionId: q.id,
    label: q.label.trim(),
    value:
      q.type === "checkbox"
        ? Array.isArray(answersMap[q.id])
          ? [...answersMap[q.id]]
          : []
        : typeof answersMap[q.id] === "string"
          ? answersMap[q.id]
          : "",
  }));
}
