import type {
  CategoryId,
  DiagnosticQuestion,
  DiagnosticResult,
  UnitSummary,
} from '../types/grammar';

export function evaluateDiagnostic(
  questions: DiagnosticQuestion[],
  answers: Record<string, number | 'unsure'>,
  syllabusUnits: UnitSummary[],
  now: Date = new Date(),
): DiagnosticResult {
  let correctCount = 0;
  const weakCategorySet = new Set<CategoryId>();
  const rawRecommended: number[] = [];

  for (const q of questions) {
    const ans = answers[q.id];
    if (ans === q.correctIndex) {
      correctCount += 1;
    } else {
      weakCategorySet.add(q.categoryId);
      for (const uid of q.recommendedUnits) {
        rawRecommended.push(uid);
      }
    }
  }

  const unitMap = new Map(syllabusUnits.map((u) => [u.id, u]));
  const seen = new Set<number>();
  const uniqueUnits: number[] = [];
  for (const uid of rawRecommended) {
    if (!seen.has(uid) && unitMap.has(uid)) {
      seen.add(uid);
      uniqueUnits.push(uid);
    }
  }

  // Sort so deep interactive units come first while keeping category order
  uniqueUnits.sort((a, b) => {
    const ua = unitMap.get(a);
    const ub = unitMap.get(b);
    const da = ua?.hasDeepContent ? 0 : 1;
    const db = ub?.hasDeepContent ? 0 : 1;
    if (da !== db) return da - db;
    return a - b;
  });

  return {
    completedAt: now.toISOString(),
    totalQuestions: questions.length,
    correctCount,
    weakCategories: Array.from(weakCategorySet),
    recommendedUnits: uniqueUnits,
    answers,
  };
}
