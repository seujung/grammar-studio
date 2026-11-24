export type CategoryId =
  | 'present-and-past'
  | 'present-perfect-and-past'
  | 'future'
  | 'modals'
  | 'if-and-wish'
  | 'passive'
  | 'reported-speech'
  | 'questions-and-auxiliary-verbs'
  | 'ing-and-infinitive'
  | 'articles-and-nouns'
  | 'pronouns-and-determiners'
  | 'relative-clauses'
  | 'adjectives-and-adverbs'
  | 'conjunctions-and-prepositions'
  | 'prepositions'
  | 'phrasal-verbs';

export interface CategoryMeta {
  id: CategoryId;
  order: number;
  titleEn: string;
  titleKo: string;
  unitRange: [number, number];
  descriptionKo: string;
  descriptionEn: string;
}

export interface UnitSummary {
  id: number;
  categoryId: CategoryId;
  titleEn: string;
  titleKo: string;
  summaryEn: string;
  summaryKo: string;
  hasDeepContent: boolean;
  relatedUnits: number[];
}

export interface GrammarExample {
  en: string;
  ko: string;
  highlight?: string;
}

export interface GrammarSection {
  code: 'A' | 'B' | 'C' | 'D';
  titleEn: string;
  titleKo: string;
  explanationEn: string;
  explanationKo: string;
  formula?: string;
  examples: GrammarExample[];
}

export interface ComparisonRow {
  leftLabel: string;
  leftExample: string;
  rightLabel: string;
  rightExample: string;
  noteKo: string;
  noteEn: string;
}

export interface CommonMistake {
  wrong: string;
  right: string;
  explanationKo: string;
  explanationEn: string;
}

export type ExerciseType = 'multiple-choice' | 'fill-blank' | 'transform' | 'dialogue';

export interface Exercise {
  id: string;
  unitId: number;
  type: ExerciseType;
  instructionEn: string;
  instructionKo: string;
  prompt: string;
  dialogueContext?: { speaker: string; line: string }[];
  wordBank?: string[];
  options?: string[];
  acceptedAnswers: string[];
  fullSentence: string;
  explanationEn: string;
  explanationKo: string;
}

export interface UnitDetail {
  unitId: number;
  sections: GrammarSection[];
  comparisonTitleEn: string;
  comparisonTitleKo: string;
  comparisons: ComparisonRow[];
  commonMistakes: CommonMistake[];
  exercises: Exercise[];
}

export interface DiagnosticQuestion {
  id: string;
  categoryId: CategoryId;
  prompt: string;
  options: string[];
  correctIndex: number;
  recommendedUnits: number[];
  explanationKo: string;
  explanationEn: string;
}

export interface SrsCard {
  exerciseId: string;
  unitId: number;
  step: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewAt: string;
  lapses: number;
  lastReviewedAt: string;
}

export interface UnitProgress {
  unitId: number;
  attemptedExerciseIds: string[];
  correctExerciseIds: string[];
  bestScore: number;
  totalExercises: number;
  completedAt?: string;
  lastStudiedAt: string;
}

export interface DiagnosticResult {
  completedAt: string;
  totalQuestions: number;
  correctCount: number;
  weakCategories: CategoryId[];
  recommendedUnits: number[];
  answers: Record<string, number | 'unsure'>;
}

export interface UserSettings {
  languageMode: 'bilingual' | 'en';
  accent: 'en-US' | 'en-GB';
  speechRate: 1 | 0.75;
  darkMode: boolean;
  dailyGoal: number;
}

export interface UserProgress {
  version: 1;
  unitProgress: Record<number, UnitProgress>;
  srsCards: Record<string, SrsCard>;
  diagnosticResult: DiagnosticResult | null;
  studyDates: string[];
  dailyCompletedUnits: Record<string, number[]>;
}
