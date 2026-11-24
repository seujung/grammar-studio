import type { SrsCard } from '../types/grammar';

export const SRS_INTERVALS = [1, 3, 7, 14, 30] as const;

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDaysStartOfDayIso(base: Date, days: number): string {
  const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days, 0, 0, 0, 0);
  return next.toISOString();
}

export function createSrsCard(
  exerciseId: string,
  unitId: number,
  isCorrect: boolean,
  now: Date = new Date(),
): SrsCard {
  const intervalDays = SRS_INTERVALS[0];
  return {
    exerciseId,
    unitId,
    step: 0,
    intervalDays,
    easeFactor: isCorrect ? 2.5 : 2.3,
    nextReviewAt: addDaysStartOfDayIso(now, intervalDays),
    lapses: isCorrect ? 0 : 1,
    lastReviewedAt: now.toISOString(),
  };
}

export function reviewSrsCard(
  card: SrsCard,
  isCorrect: boolean,
  now: Date = new Date(),
): SrsCard {
  if (!isCorrect) {
    const nextEase = Math.max(1.3, +(card.easeFactor - 0.2).toFixed(2));
    return {
      ...card,
      step: 0,
      intervalDays: 1,
      easeFactor: nextEase,
      lapses: card.lapses + 1,
      nextReviewAt: addDaysStartOfDayIso(now, 1),
      lastReviewedAt: now.toISOString(),
    };
  }

  const nextStep = card.step + 1;
  const intervalDays =
    nextStep < SRS_INTERVALS.length
      ? SRS_INTERVALS[nextStep]
      : Math.min(180, Math.round(card.intervalDays * card.easeFactor));
  const nextEase = Math.min(2.8, +(card.easeFactor + 0.05).toFixed(2));

  return {
    ...card,
    step: nextStep,
    intervalDays,
    easeFactor: nextEase,
    nextReviewAt: addDaysStartOfDayIso(now, intervalDays),
    lastReviewedAt: now.toISOString(),
  };
}

export function getDueCards(
  cards: Record<string, SrsCard>,
  now: Date = new Date(),
): SrsCard[] {
  const nowMs = now.getTime();
  return Object.values(cards)
    .filter((c) => new Date(c.nextReviewAt).getTime() <= nowMs)
    .sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime());
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function calculateStreak(studyDates: string[], todayKey: string): number {
  if (studyDates.length === 0) return 0;
  const uniqueDates = new Set(studyDates);
  const today = parseDateKey(todayKey);
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);

  let cursor: Date | null = null;
  if (uniqueDates.has(todayKey)) {
    cursor = today;
  } else if (uniqueDates.has(yesterdayKey)) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  while (cursor && uniqueDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }
  return streak;
}
