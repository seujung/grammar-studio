import { describe, expect, it } from 'vitest';
import { CATEGORIES, DEEP_UNIT_IDS, SYLLABUS_UNITS } from '../syllabus';
import { DIAGNOSTIC_QUESTIONS } from '../diagnostic';
import { DEEP_UNITS, getUnitDetail } from '../units';
import { gradeAnswer } from '../../lib/grader';
import type { ExerciseType } from '../../types/grammar';

describe('syllabus and content integrity', () => {
  it('defines 16 categories and 145 contiguous units', () => {
    expect(CATEGORIES).toHaveLength(16);
    expect(SYLLABUS_UNITS).toHaveLength(145);

    const ids = SYLLABUS_UNITS.map((u) => u.id);
    expect(ids).toEqual(Array.from({ length: 145 }, (_, i) => i + 1));

    for (const unit of SYLLABUS_UNITS) {
      expect(unit.titleEn.trim().length).toBeGreaterThan(0);
      expect(unit.titleKo.trim().length).toBeGreaterThan(0);
      expect(unit.summaryEn.trim().length).toBeGreaterThan(0);
      expect(unit.summaryKo.trim().length).toBeGreaterThan(0);
    }
  });

  it('has exactly 32 deep units, 2 per category, matching DEEP_UNIT_IDS', () => {
    expect(DEEP_UNIT_IDS.size).toBe(32);
    expect(DEEP_UNITS).toHaveLength(32);

    const categoryCounts = new Map<string, number>();
    for (const detail of DEEP_UNITS) {
      const summary = SYLLABUS_UNITS.find((u) => u.id === detail.unitId);
      expect(summary).toBeDefined();
      expect(summary?.hasDeepContent).toBe(true);
      if (summary) {
        categoryCounts.set(summary.categoryId, (categoryCounts.get(summary.categoryId) ?? 0) + 1);
      }
    }

    for (const cat of CATEGORIES) {
      expect(categoryCounts.get(cat.id)).toBe(2);
    }
  });

  it('ensures every deep unit has sections, comparisons, mistakes, 8 exercises across all 4 types, and gradable answers', () => {
    const requiredTypes: ExerciseType[] = ['multiple-choice', 'fill-blank', 'transform', 'dialogue'];
    const seenExerciseIds = new Set<string>();

    for (const id of DEEP_UNIT_IDS) {
      const detail = getUnitDetail(id);
      expect(detail).toBeDefined();
      if (!detail) continue;

      expect(detail.sections.length).toBeGreaterThanOrEqual(3);
      for (const sec of detail.sections) {
        expect(sec.examples.length).toBeGreaterThanOrEqual(3);
      }
      expect(detail.comparisons.length).toBeGreaterThanOrEqual(2);
      expect(detail.commonMistakes.length).toBeGreaterThanOrEqual(2);
      expect(detail.exercises).toHaveLength(8);

      const types = new Set(detail.exercises.map((e) => e.type));
      for (const req of requiredTypes) {
        expect(types.has(req)).toBe(true);
      }

      for (const ex of detail.exercises) {
        expect(seenExerciseIds.has(ex.id)).toBe(false);
        seenExerciseIds.add(ex.id);
        expect(ex.unitId).toBe(id);
        expect(ex.acceptedAnswers.length).toBeGreaterThanOrEqual(1);
        expect(ex.fullSentence.trim().length).toBeGreaterThan(0);
        expect(gradeAnswer(ex.acceptedAnswers[0], ex.acceptedAnswers).isCorrect).toBe(true);
        if (ex.type === 'multiple-choice') {
          expect(ex.options && ex.options.length >= 3).toBe(true);
        }
        if (ex.type === 'dialogue') {
          expect(ex.dialogueContext && ex.dialogueContext.length >= 2).toBe(true);
        }
      }
    }
  });

  it('validates all 16 diagnostic questions reference valid categories and units', () => {
    expect(DIAGNOSTIC_QUESTIONS).toHaveLength(16);
    const catIds = new Set(CATEGORIES.map((c) => c.id));
    const unitIds = new Set(SYLLABUS_UNITS.map((u) => u.id));

    for (const q of DIAGNOSTIC_QUESTIONS) {
      expect(catIds.has(q.categoryId)).toBe(true);
      expect(q.options).toHaveLength(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
      expect(q.recommendedUnits.length).toBeGreaterThanOrEqual(1);
      for (const uid of q.recommendedUnits) {
        expect(unitIds.has(uid)).toBe(true);
      }
    }
  });
});
