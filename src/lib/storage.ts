import type { UserProgress, UserSettings } from '../types/grammar';

const PROGRESS_KEY = 'eigu_progress_v1';
const SETTINGS_KEY = 'eigu_settings_v1';

export const DEFAULT_PROGRESS: UserProgress = {
  version: 1,
  unitProgress: {},
  srsCards: {},
  diagnosticResult: null,
  studyDates: [],
  dailyCompletedUnits: {},
};

export const DEFAULT_SETTINGS: UserSettings = {
  languageMode: 'bilingual',
  accent: 'en-US',
  speechRate: 1,
  darkMode: false,
  dailyGoal: 2,
};

function getStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

function isValidProgress(value: unknown): value is UserProgress {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<UserProgress>;
  return (
    v.version === 1 &&
    typeof v.unitProgress === 'object' &&
    v.unitProgress !== null &&
    typeof v.srsCards === 'object' &&
    v.srsCards !== null &&
    Array.isArray(v.studyDates) &&
    typeof v.dailyCompletedUnits === 'object' &&
    v.dailyCompletedUnits !== null
  );
}

function isValidSettings(value: unknown): value is UserSettings {
  if (!value || typeof value !== 'object') return false;
  const s = value as Partial<UserSettings>;
  return (
    (s.languageMode === 'bilingual' || s.languageMode === 'en') &&
    (s.accent === 'en-US' || s.accent === 'en-GB') &&
    (s.speechRate === 1 || s.speechRate === 0.75) &&
    typeof s.darkMode === 'boolean' &&
    typeof s.dailyGoal === 'number' &&
    s.dailyGoal >= 1
  );
}

export function loadProgress(): UserProgress {
  const storage = getStorage();
  if (!storage) return DEFAULT_PROGRESS;
  try {
    const raw = storage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed: unknown = JSON.parse(raw);
    return isValidProgress(parsed) ? parsed : DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function loadSettings(): UserSettings {
  const storage = getStorage();
  if (!storage) return DEFAULT_SETTINGS;
  try {
    const raw = storage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    return isValidSettings(parsed) ? parsed : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

interface BackupPayload {
  app: 'grammar-in-use-studio';
  version: 1;
  exportedAt: string;
  progress: UserProgress;
  settings: UserSettings;
}

export function exportBackupJson(progress: UserProgress, settings: UserSettings): string {
  const payload: BackupPayload = {
    app: 'grammar-in-use-studio',
    version: 1,
    exportedAt: new Date().toISOString(),
    progress,
    settings,
  };
  return JSON.stringify(payload, null, 2);
}

export function parseBackupJson(
  raw: string,
): { ok: true; progress: UserProgress; settings: UserSettings } | { ok: false; error: string } {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, error: '올바른 JSON 객체가 아닙니다.' };
    }
    const obj = parsed as Partial<BackupPayload>;
    if (obj.app !== 'grammar-in-use-studio' || obj.version !== 1) {
      return { ok: false, error: '지원하지 않는 백업 파일 형식 또는 버전입니다.' };
    }
    if (!isValidProgress(obj.progress) || !isValidSettings(obj.settings)) {
      return { ok: false, error: '백업 파일의 학습 데이터가 손상되었습니다.' };
    }
    return {
      ok: true,
      progress: obj.progress,
      settings: obj.settings,
    };
  } catch {
    return { ok: false, error: 'JSON 파일을 읽을 수 없습니다.' };
  }
}
