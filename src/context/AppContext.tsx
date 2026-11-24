import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_PROGRESS,
  DEFAULT_SETTINGS,
  exportBackupJson,
  loadProgress,
  loadSettings,
  parseBackupJson,
  saveProgress,
  saveSettings,
} from '../lib/storage';
import { calculateStreak, createSrsCard, getDueCards, reviewSrsCard, toDateKey } from '../lib/srs';
import type {
  DiagnosticResult,
  SrsCard,
  UnitProgress,
  UserProgress,
  UserSettings,
} from '../types/grammar';

interface AppContextValue {
  progress: UserProgress;
  settings: UserSettings;
  dueCards: SrsCard[];
  streakDays: number;
  todayCompletedCount: number;
  recordExerciseAttempt: (
    exerciseId: string,
    unitId: number,
    isCorrect: boolean,
    totalExercises: number,
  ) => void;
  submitSrsReview: (exerciseId: string, isCorrect: boolean) => SrsCard | null;
  saveDiagnosticResult: (result: DiagnosticResult) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  exportBackup: () => string;
  importBackup: (raw: string) => { ok: true } | { ok: false; error: string };
  resetAllProgress: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    saveSettings(settings);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', settings.darkMode);
    }
  }, [settings]);

  const recordExerciseAttempt = useCallback(
    (exerciseId: string, unitId: number, isCorrect: boolean, totalExercises: number) => {
      const now = new Date();
      const todayKey = toDateKey(now);

      setProgress((prev) => {
        const existing: UnitProgress = prev.unitProgress[unitId] ?? {
          unitId,
          attemptedExerciseIds: [],
          correctExerciseIds: [],
          bestScore: 0,
          totalExercises,
          lastStudiedAt: now.toISOString(),
        };

        const attemptedSet = new Set(existing.attemptedExerciseIds);
        attemptedSet.add(exerciseId);

        const correctSet = new Set(existing.correctExerciseIds);
        if (isCorrect) {
          correctSet.add(exerciseId);
        }

        const ratio = totalExercises > 0 ? Math.round((correctSet.size / totalExercises) * 100) : 0;
        const bestScore = Math.max(existing.bestScore, ratio);
        const passed = totalExercises > 0 && correctSet.size / totalExercises >= 0.75;

        const updatedUnit: UnitProgress = {
          ...existing,
          attemptedExerciseIds: Array.from(attemptedSet),
          correctExerciseIds: Array.from(correctSet),
          bestScore,
          totalExercises,
          completedAt: passed ? existing.completedAt ?? now.toISOString() : existing.completedAt,
          lastStudiedAt: now.toISOString(),
        };

        const existingCard = prev.srsCards[exerciseId];
        const nextCard = existingCard
          ? reviewSrsCard(existingCard, isCorrect, now)
          : createSrsCard(exerciseId, unitId, isCorrect, now);

        const nextStudyDates = prev.studyDates.includes(todayKey)
          ? prev.studyDates
          : [...prev.studyDates, todayKey];

        const todayUnits = prev.dailyCompletedUnits[todayKey] ?? [];
        const nextTodayUnits =
          passed && !todayUnits.includes(unitId) ? [...todayUnits, unitId] : todayUnits;

        return {
          ...prev,
          unitProgress: {
            ...prev.unitProgress,
            [unitId]: updatedUnit,
          },
          srsCards: {
            ...prev.srsCards,
            [exerciseId]: nextCard,
          },
          studyDates: nextStudyDates,
          dailyCompletedUnits: {
            ...prev.dailyCompletedUnits,
            [todayKey]: nextTodayUnits,
          },
        };
      });
    },
    [],
  );

  const submitSrsReview = useCallback(
    (exerciseId: string, isCorrect: boolean): SrsCard | null => {
      const now = new Date();
      const todayKey = toDateKey(now);
      const currentExisting = progress.srsCards[exerciseId];
      if (!currentExisting) return null;
      const computedCard = reviewSrsCard(currentExisting, isCorrect, now);

      setProgress((prev) => {
        const existing = prev.srsCards[exerciseId];
        if (!existing) return prev;
        const nextCard = reviewSrsCard(existing, isCorrect, now);
        const nextStudyDates = prev.studyDates.includes(todayKey)
          ? prev.studyDates
          : [...prev.studyDates, todayKey];

        return {
          ...prev,
          srsCards: {
            ...prev.srsCards,
            [exerciseId]: nextCard,
          },
          studyDates: nextStudyDates,
        };
      });

      return computedCard;
    },
    [progress.srsCards],
  );

  const saveDiagnosticResult = useCallback((result: DiagnosticResult) => {
    const todayKey = toDateKey(new Date());
    setProgress((prev) => ({
      ...prev,
      diagnosticResult: result,
      studyDates: prev.studyDates.includes(todayKey)
        ? prev.studyDates
        : [...prev.studyDates, todayKey],
    }));
  }, []);

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const exportBackup = useCallback(
    () => exportBackupJson(progress, settings),
    [progress, settings],
  );

  const importBackup = useCallback(
    (raw: string): { ok: true } | { ok: false; error: string } => {
      const parsed = parseBackupJson(raw);
      if (!parsed.ok) return parsed;
      setProgress(parsed.progress);
      setSettings(parsed.settings);
      return { ok: true };
    },
    [],
  );

  const resetAllProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const dueCards = useMemo(
    () => getDueCards(progress.srsCards, new Date()),
    [progress.srsCards],
  );

  const todayKey = toDateKey(new Date());
  const streakDays = useMemo(
    () => calculateStreak(progress.studyDates, todayKey),
    [progress.studyDates, todayKey],
  );

  const todayCompletedCount = (progress.dailyCompletedUnits[todayKey] ?? []).length;

  const value = useMemo<AppContextValue>(
    () => ({
      progress,
      settings,
      dueCards,
      streakDays,
      todayCompletedCount,
      recordExerciseAttempt,
      submitSrsReview,
      saveDiagnosticResult,
      updateSettings,
      exportBackup,
      importBackup,
      resetAllProgress,
    }),
    [
      progress,
      settings,
      dueCards,
      streakDays,
      todayCompletedCount,
      recordExerciseAttempt,
      submitSrsReview,
      saveDiagnosticResult,
      updateSettings,
      exportBackup,
      importBackup,
      resetAllProgress,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
