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
      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <HardDrive className="h-4 w-4 text-blue-900 dark:text-blue-300" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              로컬 진도 파일 관리
            </h2>
            {fileSync.fileName ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                연결된 파일: {fileSync.fileName}
              </span>
            ) : (
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                로컬 파일 미연결
              </span>
            )}
            {fileSync.hasUnsavedChanges && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                저장되지 않은 변경 있음
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            학습 진도를 내 PC의 JSON 파일로 저장하고, 다른 기기나 재방문 시 파일을 선택해 바로 이어서 공부할 수 있습니다.
            {fileSync.lastSavedAt && (
              <span className="ml-1.5 text-slate-500 dark:text-slate-400">
                (최근 저장: {new Date(fileSync.lastSavedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })})
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {fileSync.supportsDirectFile && fileSync.fileName && (
            <button
              type="button"
              onClick={toggleAutoSave}
              className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                fileSync.autoSaveEnabled
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'
                  : 'border-stone-200 bg-stone-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              자동 저장 {fileSync.autoSaveEnabled ? '켜짐' : '꺼짐'}
            </button>
          )}

          <button
            type="button"
            onClick={() => void handleSave(false)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            <FileDown className="h-4 w-4" />
            진도 파일 저장
          </button>

          {fileSync.supportsDirectFile ? (
            <button
              type="button"
              onClick={() => void handlePickerOpen()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition hover:bg-stone-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <FileUp className="h-4 w-4" />
              진도 파일 불러오기
            </button>
          ) : (
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition hover:bg-stone-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <FileUp className="h-4 w-4" />
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

      {feedback && (
        <div
          role="status"
          className={`mt-3 rounded-xl px-3.5 py-2 text-xs font-medium ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200'
          }`}
        >
          {feedback.text}
        </div>
      )}
    </section>
  );
}
