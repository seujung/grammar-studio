import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PROGRESS,
  DEFAULT_SETTINGS,
  exportBackupJson,
  loadProgress,
  loadSettings,
  parseBackupJson,
  saveProgress,
  saveSettings,
} from '../storage';

describe('storage and backup', () => {
  it('returns defaults when localStorage is empty or corrupted', () => {
    expect(loadProgress()).toEqual(DEFAULT_PROGRESS);
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);

    localStorage.setItem('eigu_progress_v1', '{broken json');
    localStorage.setItem('eigu_settings_v1', '{broken json');
    expect(loadProgress()).toEqual(DEFAULT_PROGRESS);
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('persists and loads progress and settings', () => {
    const progress = {
      ...DEFAULT_PROGRESS,
      studyDates: ['2026-11-24'],
    };
    const settings = {
      ...DEFAULT_SETTINGS,
      darkMode: true,
      dailyGoal: 3,
    };

    saveProgress(progress);
    saveSettings(settings);

    expect(loadProgress()).toEqual(progress);
    expect(loadSettings()).toEqual(settings);
  });

  it('exports and parses valid backup JSON and rejects malformed backups', () => {
    const raw = exportBackupJson(
      { ...DEFAULT_PROGRESS, studyDates: ['2026-11-24'] },
      { ...DEFAULT_SETTINGS, languageMode: 'en' },
    );

    const parsed = parseBackupJson(raw);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.progress.studyDates).toEqual(['2026-11-24']);
      expect(parsed.settings.languageMode).toBe('en');
    }

    const bad = parseBackupJson('{"version":999}');
    expect(bad.ok).toBe(false);
  });
});
