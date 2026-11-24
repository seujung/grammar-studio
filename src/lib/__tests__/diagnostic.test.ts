import { describe, expect, it } from 'vitest';
import { evaluateDiagnostic } from '../diagnostic';
import type { DiagnosticQuestion, UnitSummary } from '../../types/grammar';

const mockUnits: UnitSummary[] = [
  {
    id: 1,
    categoryId: 'present-and-past',
    titleEn: 'Present continuous',
    titleKo: '현재진행',
    summaryEn: '',
    summaryKo: '',
    hasDeepContent: true,
    relatedUnits: [3],
  },
  {
    id: 2,
    categoryId: 'present-and-past',
    titleEn: 'Present simple',
    titleKo: '현재단순',
    summaryEn: '',
    summaryKo: '',
    hasDeepContent: false,
    relatedUnits: [1, 3],
  },
  {
    id: 7,
    categoryId: 'present-perfect-and-past',
    titleEn: 'Present perfect 1',
    titleKo: '현재완료 1',
    summaryEn: '',
    summaryKo: '',
    hasDeepContent: true,
    relatedUnits: [13],
  },
];

const mockQuestions: DiagnosticQuestion[] = [
  {
    id: 'dq-1',
    categoryId: 'present-and-past',
    prompt: 'Q1',
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 0,
    recommendedUnits: [2, 1],
    explanationKo: '설명',
    explanationEn: 'Explanation',
  },
  {
    id: 'dq-2',
    categoryId: 'present-perfect-and-past',
    prompt: 'Q2',
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 2,
    recommendedUnits: [7],
    explanationKo: '설명',
    explanationEn: 'Explanation',
  },
];

describe('evaluateDiagnostic', () => {
  it('computes score, weak categories, and prioritizes deep units in recommendations', () => {
    const result = evaluateDiagnostic(
      mockQuestions,
      { 'dq-1': 'unsure', 'dq-2': 2 },
      mockUnits,
      new Date(2026, 10, 24, 10, 0, 0),
    );

    expect(result.totalQuestions).toBe(2);
    expect(result.correctCount).toBe(1);
    expect(result.weakCategories).toEqual(['present-and-past']);
    expect(result.recommendedUnits).toEqual([1, 2]);
  });
});
