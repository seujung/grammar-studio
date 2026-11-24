import { describe, expect, it } from 'vitest';
import {
  SRS_INTERVALS,
  calculateStreak,
  createSrsCard,
  getDueCards,
  reviewSrsCard,
  toDateKey,
} from '../srs';

describe('toDateKey', () => {
  it('formats local date as YYYY-MM-DD', () => {
    const d = new Date(2026, 10, 5, 14, 30, 0);
    expect(toDateKey(d)).toBe('2026-11-05');
  });
});

describe('SRS card lifecycle', () => {
  const day1 = new Date(2026, 10, 1, 10, 0, 0);

  it('creates an initial card scheduled for 1 day on first wrong or right attempt', () => {
    const wrongCard = createSrsCard('u1-e1', 1, false, day1);
    expect(wrongCard.step).toBe(0);
    expect(wrongCard.intervalDays).toBe(1);
    expect(wrongCard.lapses).toBe(1);

    const rightCard = createSrsCard('u1-e2', 1, true, day1);
    expect(rightCard.step).toBe(0);
    expect(rightCard.intervalDays).toBe(SRS_INTERVALS[0]);
    expect(rightCard.lapses).toBe(0);
  });

  it('advances intervals through 1 -> 3 -> 7 -> 14 -> 30 days on consecutive correct reviews', () => {
    let card = createSrsCard('u1-e1', 1, false, day1);
    const intervals: number[] = [];

    for (let i = 1; i <= 5; i++) {
      const reviewDate = new Date(2026, 10, 1 + i, 9, 0, 0);
      card = reviewSrsCard(card, true, reviewDate);
      intervals.push(card.intervalDays);
    }

    expect(intervals).toEqual([3, 7, 14, 30, 75]);
  });

  it('resets step and interval to 1 day and increments lapses when answered incorrectly', () => {
    let card = createSrsCard('u1-e1', 1, true, day1);
    card = reviewSrsCard(card, true, new Date(2026, 10, 2, 9, 0, 0));
    expect(card.intervalDays).toBe(3);

    const lapsed = reviewSrsCard(card, false, new Date(2026, 10, 5, 9, 0, 0));
    expect(lapsed.step).toBe(0);
    expect(lapsed.intervalDays).toBe(1);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.easeFactor).toBeLessThan(card.easeFactor);
  });

  it('returns due cards sorted oldest-due first', () => {
    const c1 = createSrsCard('u1-e1', 1, false, new Date(2026, 10, 1, 9, 0, 0)); // due Nov 2
    const c2 = createSrsCard('u1-e2', 1, false, new Date(2026, 10, 3, 9, 0, 0)); // due Nov 4
    const c3 = createSrsCard('u1-e3', 1, false, new Date(2026, 10, 10, 9, 0, 0)); // due Nov 11

    const due = getDueCards(
      { 'u1-e2': c2, 'u1-e1': c1, 'u1-e3': c3 },
      new Date(2026, 10, 5, 12, 0, 0),
    );
    expect(due.map((c) => c.exerciseId)).toEqual(['u1-e1', 'u1-e2']);
  });
});

describe('calculateStreak', () => {
  it('counts consecutive days ending today or yesterday and dedupes dates', () => {
    expect(calculateStreak([], '2026-11-24')).toBe(0);
    expect(calculateStreak(['2026-11-24', '2026-11-24', '2026-11-23', '2026-11-22'], '2026-11-24')).toBe(3);
    expect(calculateStreak(['2026-11-23', '2026-11-22'], '2026-11-24')).toBe(2);
    expect(calculateStreak(['2026-11-21', '2026-11-20'], '2026-11-24')).toBe(0);
  });
});
