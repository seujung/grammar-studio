import React, { useEffect, useRef, useState } from 'react';
import { Download, RotateCcw, Upload, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function BackupModal({ onClose }: { onClose: () => void }) {
  const {
    settings,
    updateSettings,
    saveProgressFile,
    loadProgressFileFromText,
    resetAllProgress,
  } = useApp();
  const [statusMessage, setStatusMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleDownload = async () => {
    const res = await saveProgressFile(true);
    if (res.ok) {
      setStatusMessage({ type: 'ok', text: `진도 파일(${res.fileName})을 저장했습니다.` });
    } else if (!res.cancelled && res.error) {
      setStatusMessage({ type: 'err', text: res.error });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const result = loadProgressFileFromText(text, file.name);
      if (result.ok) {
        setStatusMessage({ type: 'ok', text: `백업 파일(${result.fileName})을 복원했습니다.` });
      } else {
        setStatusMessage({ type: 'err', text: result.error });
      }
    } catch {
      setStatusMessage({ type: 'err', text: '파일을 읽는 중 오류가 발생했습니다.' });
    }
    e.target.value = '';
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetAllProgress();
    setConfirmReset(false);
    setStatusMessage({ type: 'ok', text: '모든 학습 기록을 초기화했습니다.' });
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between border-b border-[var(--border-subtle)] pb-3.5">
          <h2 id="settings-modal-title" className="text-base font-bold text-[var(--ink-primary)]">
            학습 설정 및 데이터 백업
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="창 닫기"
            className="pressable interactive-surface rounded-lg p-1.5 text-[var(--ink-secondary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--ink-secondary)]">
              하루 목표 단원 수
            </label>
            <div className="flex gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-1">
              {[1, 2, 3, 5].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => updateSettings({ dailyGoal: goal })}
                  className={`pressable tnum flex-1 rounded-lg py-1.5 text-xs font-semibold ${
                    settings.dailyGoal === goal
                      ? 'studio-nav-active text-[var(--ink-primary)]'
                      : 'text-[var(--ink-secondary)]'
                  }`}
                >
                  {goal}단원
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--ink-secondary)]">
                음성 억양 (TTS)
              </label>
              <div className="flex gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-1">
                {(['en-US', 'en-GB'] as const).map((accent) => (
                  <button
                    key={accent}
                    type="button"
                    onClick={() => updateSettings({ accent })}
                    className={`pressable flex-1 rounded-lg py-1.5 text-xs font-semibold ${
                      settings.accent === accent
                        ? 'studio-nav-active text-[var(--ink-primary)]'
                        : 'text-[var(--ink-secondary)]'
                    }`}
                  >
                    {accent === 'en-US' ? '미국 (US)' : '영국 (UK)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--ink-secondary)]">
                기본 읽기 속도
              </label>
              <div className="flex gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-1">
                {([1, 0.75] as const).map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => updateSettings({ speechRate: rate })}
                    className={`pressable tnum flex-1 rounded-lg py-1.5 text-xs font-semibold ${
                      settings.speechRate === rate
                        ? 'studio-nav-active text-[var(--ink-primary)]'
                        : 'text-[var(--ink-secondary)]'
                    }`}
                  >
                    {rate === 1 ? '보통 1.0x' : '느리게 0.75x'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-4">
            <div className="mb-2 text-xs font-semibold text-[var(--ink-secondary)]">
              학습 기록 백업 · 복원
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void handleDownload()}
                className="pressable interactive-surface interactive-border inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-semibold text-[var(--ink-primary)]"
              >
                <Download className="h-3.5 w-3.5 text-[var(--ink-secondary)]" />
                JSON 내보내기
              </button>
              <label className="pressable interactive-surface interactive-border inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-semibold text-[var(--ink-primary)]">
                <Upload className="h-3.5 w-3.5 text-[var(--ink-secondary)]" />
                JSON 불러오기
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-4">
            <button
              type="button"
              onClick={handleReset}
              className={`pressable inline-flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
                confirmReset
                  ? 'border-[var(--danger)] bg-[var(--danger)] text-white'
                  : 'border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {confirmReset ? '정말 초기화하려면 한 번 더 누르십시오' : '학습 기록 초기화'}
            </button>
          </div>

          {statusMessage && (
            <div
              className={`feedback-enter rounded-lg border border-l-2 px-3 py-2 text-xs font-medium ${
                statusMessage.type === 'ok'
                  ? 'border-[var(--success-border)] border-l-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]'
                  : 'border-[var(--danger-border)] border-l-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]'
              }`}
            >
              {statusMessage.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
