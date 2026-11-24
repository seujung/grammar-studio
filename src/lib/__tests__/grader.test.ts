import { describe, expect, it } from 'vitest';
import { gradeAnswer, normalizeAnswer } from '../grader';

describe('normalizeAnswer', () => {
  it('trims, lowercases, collapses whitespace, normalizes apostrophes, and strips trailing punctuation', () => {
    expect(normalizeAnswer("  I’m   working  hard!  ")).toBe("i'm working hard");
    expect(normalizeAnswer('Where do you live?')).toBe('where do you live');
    expect(normalizeAnswer('She works.')).toBe('she works');
  });
});

describe('gradeAnswer', () => {
  it('matches exact answers regardless of case, whitespace, and trailing punctuation', () => {
    const result = gradeAnswer('  ARE WORKING. ', ['are working']);
    expect(result.isCorrect).toBe(true);
    expect(result.matchedAnswer).toBe('are working');
  });

  it('treats English contractions and full forms as equivalent', () => {
    expect(gradeAnswer("I'm trying", ['I am trying']).isCorrect).toBe(true);
    expect(gradeAnswer('I am trying', ["I'm trying"]).isCorrect).toBe(true);
    expect(gradeAnswer("doesn't grow", ['does not grow']).isCorrect).toBe(true);
    expect(gradeAnswer('cannot sleep', ["can't sleep"]).isCorrect).toBe(true);
    expect(gradeAnswer("won't go", ['will not go']).isCorrect).toBe(true);
    expect(gradeAnswer("let's start", ['let us start']).isCorrect).toBe(true);
  });

  it("handles ambiguous 'd (would/had) and 's (is/has) contractions", () => {
    expect(gradeAnswer("I'd go", ['I would go']).isCorrect).toBe(true);
    expect(gradeAnswer("I'd finished", ['I had finished']).isCorrect).toBe(true);
    expect(gradeAnswer("he's working", ['he is working']).isCorrect).toBe(true);
    expect(gradeAnswer("he's gone", ['he has gone']).isCorrect).toBe(true);
    expect(gradeAnswer('she has left', ["she's left"]).isCorrect).toBe(true);
  });

  it('rejects empty or incorrect answers', () => {
    expect(gradeAnswer('   ', ['is working']).isCorrect).toBe(false);
    expect(gradeAnswer('works', ['is working']).isCorrect).toBe(false);
  });
});
