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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="settings-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
            학습 설정 및 데이터 백업
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="창 닫기"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              하루 목표 단원 수
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 5].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => updateSettings({ dailyGoal: goal })}
                  className={`flex-1 rounded-lg border py-2 text-sm font-semibold transition ${
                    settings.dailyGoal === goal
                      ? 'border-blue-900 bg-blue-900 text-white dark:border-blue-500 dark:bg-blue-600'
                      : 'border-stone-200 bg-stone-50 text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {goal}단원
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                음성 억양 (TTS)
              </label>
              <div className="flex gap-1.5">
                {(['en-US', 'en-GB'] as const).map((accent) => (
                  <button
                    key={accent}
                    type="button"
                    onClick={() => updateSettings({ accent })}
                    className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold ${
                      settings.accent === accent
                        ? 'border-blue-900 bg-blue-900 text-white dark:border-blue-500 dark:bg-blue-600'
                        : 'border-stone-200 bg-stone-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {accent === 'en-US' ? '미국 (US)' : '영국 (UK)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                기본 읽기 속도
              </label>
              <div className="flex gap-1.5">
                {([1, 0.75] as const).map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => updateSettings({ speechRate: rate })}
                    className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold ${
                      settings.speechRate === rate
                        ? 'border-blue-900 bg-blue-900 text-white dark:border-blue-500 dark:bg-blue-600'
                        : 'border-stone-200 bg-stone-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {rate === 1 ? '보통 1.0x' : '느리게 0.75x'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-4 dark:border-slate-800">
            <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              학습 기록 백업 · 복원
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => void handleDownload()}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-stone-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <Download className="h-4 w-4" />
                JSON 내보내기
              </button>
              <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-stone-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                <Upload className="h-4 w-4" />
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

          <div className="border-t border-stone-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                confirmReset
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
              }`}
            >
              <RotateCcw className="h-4 w-4" />
              {confirmReset ? '정말 초기화하려면 한 번 더 누르십시오' : '학습 기록 초기화'}
            </button>
          </div>

          {statusMessage && (
            <div
              className={`rounded-lg px-3 py-2 text-xs font-medium ${
                statusMessage.type === 'ok'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300'
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
