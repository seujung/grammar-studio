import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
import {
  isFileSystemAccessSupported,
  openProgressFromPicker,
  saveProgressToFile,
  type FileHandleLike,
} from '../lib/progressFile';
import { calculateStreak, createSrsCard, getDueCards, reviewSrsCard, toDateKey } from '../lib/srs';
import type {
  DiagnosticResult,
  SrsCard,
  UnitProgress,
  UserProgress,
  UserSettings,
} from '../types/grammar';

export interface FileSyncState {
  fileName: string | null;
  lastSavedAt: string | null;
  hasUnsavedChanges: boolean;
  autoSaveEnabled: boolean;
  supportsDirectFile: boolean;
}

export type SaveFileActionResult =
  | { ok: true; mode: 'direct' | 'download'; fileName: string }
  | { ok: false; cancelled: boolean; error: string };

export type LoadFileActionResult =
  | { ok: true; fileName: string }
  | { ok: false; cancelled?: boolean; error: string };

interface AppContextValue {
  progress: UserProgress;
  settings: UserSettings;
  dueCards: SrsCard[];
  streakDays: number;
  todayCompletedCount: number;
  fileSync: FileSyncState;
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
  saveProgressFile: (forceNewPicker?: boolean) => Promise<SaveFileActionResult>;
  loadProgressFileFromPicker: () => Promise<LoadFileActionResult>;
  loadProgressFileFromText: (content: string, fileName?: string) => LoadFileActionResult;
  toggleAutoSave: () => void;
  resetAllProgress: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const fileHandleRef = useRef<FileHandleLike | null>(null);
  const [mutationSeq, setMutationSeq] = useState(0);
  const [fileSync, setFileSync] = useState<FileSyncState>(() => ({
    fileName: null,
    lastSavedAt: null,
    hasUnsavedChanges: false,
    autoSaveEnabled: true,
    supportsDirectFile: isFileSystemAccessSupported(),
  }));

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    saveSettings(settings);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', settings.darkMode);
    }
  }, [settings]);

  useEffect(() => {
    if (mutationSeq === 0) return;
    const handle = fileHandleRef.current;
    if (!handle || !fileSync.autoSaveEnabled) return;

    let cancelled = false;
    const json = exportBackupJson(progress, settings);
    void saveProgressToFile(json, handle).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setFileSync((prev) => ({
          ...prev,
          fileName: res.fileName,
          lastSavedAt: new Date().toISOString(),
          hasUnsavedChanges: false,
        }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [mutationSeq, progress, settings, fileSync.autoSaveEnabled]);

  const markMutated = useCallback(() => {
    setMutationSeq((s) => s + 1);
    setFileSync((prev) => ({ ...prev, hasUnsavedChanges: true }));
  }, []);

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
      markMutated();
    },
    [markMutated],
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
      markMutated();

      return computedCard;
    },
    [progress.srsCards, markMutated],
  );

  const saveDiagnosticResult = useCallback(
    (result: DiagnosticResult) => {
      const todayKey = toDateKey(new Date());
      setProgress((prev) => ({
        ...prev,
        diagnosticResult: result,
        studyDates: prev.studyDates.includes(todayKey)
          ? prev.studyDates
          : [...prev.studyDates, todayKey],
      }));
      markMutated();
    },
    [markMutated],
  );

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

  const saveProgressFile = useCallback(
    async (forceNewPicker = false): Promise<SaveFileActionResult> => {
      const json = exportBackupJson(progress, settings);
      const targetHandle = forceNewPicker ? null : fileHandleRef.current;
      const res = await saveProgressToFile(json, targetHandle);
      if (!res.ok) {
        return { ok: false, cancelled: res.cancelled, error: res.error };
      }
      if (res.handle) {
        fileHandleRef.current = res.handle;
      }
      setFileSync((prev) => ({
        ...prev,
        fileName: res.fileName,
        lastSavedAt: new Date().toISOString(),
        hasUnsavedChanges: false,
      }));
      return { ok: true, mode: res.mode, fileName: res.fileName };
    },
    [progress, settings],
  );

  const loadProgressFileFromText = useCallback(
    (content: string, fileName = 'progress.json'): LoadFileActionResult => {
      const parsed = parseBackupJson(content);
      if (!parsed.ok) {
        return { ok: false, error: parsed.error };
      }
      fileHandleRef.current = null;
      setProgress(parsed.progress);
      setSettings(parsed.settings);
      setFileSync((prev) => ({
        ...prev,
        fileName,
        lastSavedAt: new Date().toISOString(),
        hasUnsavedChanges: false,
      }));
      return { ok: true, fileName };
    },
    [],
  );

  const loadProgressFileFromPicker = useCallback(async (): Promise<LoadFileActionResult> => {
    const res = await openProgressFromPicker();
    if (!res.ok) {
      return { ok: false, cancelled: res.cancelled, error: res.error };
    }
    const parsed = parseBackupJson(res.content);
    if (!parsed.ok) {
      return { ok: false, error: parsed.error };
    }
    fileHandleRef.current = res.handle;
    setProgress(parsed.progress);
    setSettings(parsed.settings);
    setFileSync((prev) => ({
      ...prev,
      fileName: res.fileName,
      lastSavedAt: new Date().toISOString(),
      hasUnsavedChanges: false,
    }));
    return { ok: true, fileName: res.fileName };
  }, []);

  const toggleAutoSave = useCallback(() => {
    setFileSync((prev) => ({ ...prev, autoSaveEnabled: !prev.autoSaveEnabled }));
  }, []);

  const resetAllProgress = useCallback(() => {
    fileHandleRef.current = null;
    setProgress(DEFAULT_PROGRESS);
    setSettings(DEFAULT_SETTINGS);
    setFileSync((prev) => ({
      ...prev,
      fileName: null,
      lastSavedAt: null,
      hasUnsavedChanges: false,
    }));
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
      fileSync,
      recordExerciseAttempt,
      submitSrsReview,
      saveDiagnosticResult,
      updateSettings,
      exportBackup,
      importBackup,
      saveProgressFile,
      loadProgressFileFromPicker,
      loadProgressFileFromText,
      toggleAutoSave,
      resetAllProgress,
    }),
    [
      progress,
      settings,
      dueCards,
      streakDays,
      todayCompletedCount,
      fileSync,
      recordExerciseAttempt,
      submitSrsReview,
      saveDiagnosticResult,
      updateSettings,
      exportBackup,
      importBackup,
      saveProgressFile,
      loadProgressFileFromPicker,
      loadProgressFileFromText,
      toggleAutoSave,
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
