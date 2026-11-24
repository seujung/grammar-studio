import React, { useState } from 'react';
import { CheckCircle2, FileDown, FileUp, HardDrive, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ProgressFileBar() {
  const {
    fileSync,
    saveProgressFile,
    loadProgressFileFromPicker,
    loadProgressFileFromText,
    toggleAutoSave,
  } = useApp();
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSave = async (forceNew = false) => {
    const res = await saveProgressFile(forceNew);
    if (res.ok) {
      setFeedback({
        type: 'ok',
        text:
          res.mode === 'direct'
            ? `로컬 파일(${res.fileName})에 진도를 저장했습니다.`
            : `진도 파일(${res.fileName})을 다운로드했습니다.`,
      });
    } else if (!res.cancelled && res.error) {
      setFeedback({ type: 'err', text: res.error });
    }
  };

  const handlePickerOpen = async () => {
    const res = await loadProgressFileFromPicker();
    if (res.ok) {
      setFeedback({
        type: 'ok',
        text: `로컬 파일(${res.fileName})에서 진도를 불러왔습니다.`,
      });
    } else if (!res.cancelled && res.error) {
      setFeedback({ type: 'err', text: res.error });
    }
  };

  const handleInputUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const res = loadProgressFileFromText(text, file.name);
      if (res.ok) {
        setFeedback({
          type: 'ok',
          text: `진도 파일(${res.fileName})에서 학습 기록을 불러왔습니다.`,
        });
      } else {
        setFeedback({ type: 'err', text: res.error });
      }
    } catch {
      setFeedback({ type: 'err', text: '선택한 파일을 읽지 못했습니다.' });
    }
    e.target.value = '';
  };

  return (
    <section
      aria-label="로컬 진도 파일 관리"
      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/70 px-4 py-3"
    >
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <HardDrive className="h-3.5 w-3.5 text-[var(--ink-secondary)]" />
            <h2 className="text-sm font-semibold text-[var(--ink-primary)]">
              로컬 진도 파일 관리
            </h2>
            {fileSync.fileName ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--success-border)] bg-[var(--success-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--success)]">
                <CheckCircle2 className="h-3 w-3" />
                연결된 파일: {fileSync.fileName}
              </span>
            ) : (
              <span className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--ink-muted)]">
                로컬 파일 미연결
              </span>
            )}
            {fileSync.hasUnsavedChanges && (
              <span className="rounded-md border border-[var(--signal-border)] bg-[var(--signal-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--signal)]">
                저장되지 않은 변경 있음
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--ink-secondary)]">
            학습 진도를 내 PC의 JSON 파일로 저장하고, 재방문 시 파일을 선택해 이어서 공부합니다.
            {fileSync.lastSavedAt && (
              <span className="tnum ml-1.5 text-[var(--ink-muted)]">
                · 최근 저장{' '}
                {new Date(fileSync.lastSavedAt).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {fileSync.supportsDirectFile && fileSync.fileName && (
            <button
              type="button"
              onClick={toggleAutoSave}
              className={`pressable inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                fileSync.autoSaveEnabled
                  ? 'border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]'
                  : 'interactive-surface border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-secondary)]'
              }`}
            >
              <RefreshCw className="h-3 w-3" />
              자동 저장 {fileSync.autoSaveEnabled ? '켜짐' : '꺼짐'}
            </button>
          )}

          <button
            type="button"
            onClick={() => void handleSave(false)}
            className="pressable interactive-btn-accent inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-btn)] px-3.5 py-1.5 text-xs font-semibold text-white"
          >
            <FileDown className="h-3.5 w-3.5" />
            진도 파일 저장
          </button>

          {fileSync.supportsDirectFile && fileSync.fileName && (
            <button
              type="button"
              onClick={() => void handleSave(true)}
              className="pressable interactive-surface interactive-border rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-primary)]"
            >
              다른 파일로 저장
            </button>
          )}

          {fileSync.supportsDirectFile ? (
            <button
              type="button"
              onClick={() => void handlePickerOpen()}
              className="pressable interactive-surface interactive-border inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--ink-primary)]"
            >
              <FileUp className="h-3.5 w-3.5 text-[var(--ink-secondary)]" />
              진도 파일 불러오기
            </button>
          ) : (
            <label className="pressable interactive-surface interactive-border inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--ink-primary)]">
              <FileUp className="h-3.5 w-3.5 text-[var(--ink-secondary)]" />
              <span>진도 파일 불러오기</span>
              <input
                type="file"
                accept="application/json,.json"
                aria-label="진도 파일 불러오기"
                onChange={handleInputUpload}
                className="sr-only"
              />
            </label>
          )}
        </div>
      </div>

      {(feedback || fileSync.autoSaveError) && (
        <div
          role="status"
          className={`feedback-enter mt-3 rounded-lg border border-l-2 px-3 py-2 text-xs font-medium ${
            fileSync.autoSaveError || feedback?.type === 'err'
              ? 'border-[var(--danger-border)] border-l-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]'
              : 'border-[var(--success-border)] border-l-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]'
          }`}
        >
          {fileSync.autoSaveError ?? feedback?.text}
        </div>
      )}
    </section>
  );
}
