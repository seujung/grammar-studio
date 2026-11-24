import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Compass, HelpCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DIAGNOSTIC_QUESTIONS } from '../data/diagnostic';
import { CATEGORIES, SYLLABUS_UNITS, getCategoryById, getUnitSummary } from '../data/syllabus';
import { evaluateDiagnostic } from '../lib/diagnostic';

export function DiagnosticPage() {
  const { progress, settings, saveDiagnosticResult } = useApp();
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | 'unsure'>>({});

  const existingResult = progress.diagnosticResult;
  const currentQuestion = DIAGNOSTIC_QUESTIONS[stepIndex];

  const handleAnswer = (choice: number | 'unsure') => {
    if (!currentQuestion) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: choice };
    setAnswers(nextAnswers);

    if (stepIndex + 1 < DIAGNOSTIC_QUESTIONS.length) {
      setStepIndex((i) => i + 1);
    } else {
      const evaluated = evaluateDiagnostic(
        DIAGNOSTIC_QUESTIONS,
        nextAnswers,
        SYLLABUS_UNITS,
        new Date(),
      );
      saveDiagnosticResult(evaluated);
      setStarted(false);
      setStepIndex(0);
    }
  };

  if (!started && existingResult) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              진단 테스트 결과 (Study Guide)
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              총 {existingResult.totalQuestions}문항 중{' '}
              <span className="font-bold text-blue-900 dark:text-blue-300">
                {existingResult.correctCount}문항
              </span>{' '}
              정답입니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setStepIndex(0);
              setStarted(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-stone-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <RotateCcw className="h-4 w-4" />
            다시 진단하기
          </button>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">영역별 진단 요약</h2>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => {
              const isWeak = existingResult.weakCategories.includes(cat.id);
              return (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm ${
                    isWeak
                      ? 'border-amber-300 bg-amber-50/70 dark:border-amber-700 dark:bg-amber-950/30'
                      : 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20'
                  }`}
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {cat.titleKo}
                  </span>
                  {isWeak ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      복습 필요
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      양호
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            추천 학습 단원 ({existingResult.recommendedUnits.length}개)
          </h2>
          {existingResult.recommendedUnits.length === 0 ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              모든 영역을 맞혔습니다! 커리큘럼에서 원하는 심화 단원을 골라 연습하십시오.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {existingResult.recommendedUnits.map((uid) => {
                const u = getUnitSummary(uid);
                if (!u) return null;
                const cat = getCategoryById(u.categoryId);
                return (
                  <div
                    key={uid}
                    className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>Unit {u.id}</span>
                        <span>·</span>
                        <span>{cat?.titleKo}</span>
                        {u.hasDeepContent && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-200">
                            심화
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                        {u.titleKo}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{u.titleEn}</div>
                    </div>
                    <Link
                      to={`/unit/${u.id}`}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-900 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 dark:bg-blue-600"
                    >
                      학습 시작
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
          <Compass className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          문법 진단 테스트 (Study Guide)
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          교재 뒤편 Study Guide 방식에 맞춰 16개 문법 영역의 대표 문항을 하나씩 풉니다.
          확신이 없으면 &ldquo;잘 모르겠어요&rdquo;를 선택하십시오. 틀리거나 헷갈린 영역에 맞는 추천 단원을 자동으로 정리해 드립니다.
        </p>
        <button
          type="button"
          onClick={() => {
            setAnswers({});
            setStepIndex(0);
            setStarted(true);
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-900 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600"
        >
          <span>16문항 진단 시작하기</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const cat = getCategoryById(currentQuestion.categoryId);
  const progressPct = Math.round(((stepIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100);

  return (
    <div className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>
          문항 {stepIndex + 1} / {DIAGNOSTIC_QUESTIONS.length} ·{' '}
          {settings.languageMode === 'bilingual' ? cat?.titleKo : cat?.titleEn}
        </span>
        <span>{progressPct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-slate-800">
        <div
          className="h-full bg-blue-900 transition-all dark:bg-blue-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 text-base font-medium leading-relaxed text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white">
        {currentQuestion.prompt}
      </div>

      <div className="grid gap-2.5">
        {currentQuestion.options.map((opt, idx) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleAnswer(idx)}
            className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-blue-400"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-stone-300 text-xs font-bold dark:border-slate-600">
              {String.fromCharCode(65 + idx)}
            </span>
            <span>{opt}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => handleAnswer('unsure')}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-amber-400 bg-amber-50/70 px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200"
        >
          <HelpCircle className="h-4 w-4" />
          잘 모르겠어요 (추천 단원에 추가)
        </button>
      </div>
    </div>
  );
}
