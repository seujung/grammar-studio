import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  HelpCircle,
  RotateCcw,
  XCircle,
} from 'lucide-react';
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
  const bilingual = settings.languageMode === 'bilingual';

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
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
          <div>
            <p className="font-mono-code text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--accent)]">
              STUDY GUIDE REPORT
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-[var(--ink-primary)]">
              진단 테스트 결과 (Study Guide)
            </h1>
            <p className="tnum mt-1 text-sm text-[var(--ink-secondary)]">
              총 {existingResult.totalQuestions}문항 중{' '}
              <span className="font-editorial text-xl font-semibold text-[var(--accent)]">
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
            className="pressable interactive-surface interactive-border inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--ink-primary)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            다시 진단하기
          </button>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[var(--ink-primary)]">영역별 진단 요약</h2>
          <div className="grid gap-px overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => {
              const isWeak = existingResult.weakCategories.includes(cat.id);
              return (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-sm ${
                    isWeak ? 'bg-[var(--signal-soft)]' : 'bg-[var(--bg-surface)]'
                  }`}
                >
                  <span className="font-semibold text-[var(--ink-primary)]">
                    {cat.titleKo}
                  </span>
                  {isWeak ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--signal)]">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      복습 필요
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
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
          <h2 className="tnum text-base font-bold text-[var(--ink-primary)]">
            추천 학습 단원 ({existingResult.recommendedUnits.length}개)
          </h2>
          {existingResult.recommendedUnits.length === 0 ? (
            <div className="rounded-xl border border-[var(--success-border)] bg-[var(--success-soft)] p-5 text-sm text-[var(--success)]">
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
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
                        <span className="font-mono-code tnum">Unit {u.id}</span>
                        <span>·</span>
                        <span>{cat?.titleKo}</span>
                        {u.hasDeepContent && (
                          <span className="rounded border border-[var(--accent-border)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                            심화
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm font-bold text-[var(--ink-primary)]">
                        {u.titleKo}
                      </div>
                      <div className="font-editorial text-xs text-[var(--ink-secondary)]">
                        {u.titleEn}
                      </div>
                    </div>
                    <Link
                      to={`/unit/${u.id}`}
                      className="pressable interactive-btn-accent inline-flex shrink-0 items-center gap-1 rounded-lg bg-[var(--accent-btn)] px-3 py-2 text-xs font-semibold text-white"
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

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[var(--ink-primary)]">문항별 정답 및 해설</h2>
          <div className="space-y-2.5">
            {DIAGNOSTIC_QUESTIONS.map((q, idx) => {
              const userAns = existingResult.answers[q.id];
              const isCorrect = userAns === q.correctIndex;
              const userText =
                userAns === 'unsure'
                  ? '잘 모르겠어요'
                  : typeof userAns === 'number'
                    ? q.options[userAns] ?? '미응답'
                    : '미응답';
              const cat = getCategoryById(q.categoryId);

              return (
                <div
                  key={q.id}
                  className={`rounded-xl border border-l-2 p-4 text-sm ${
                    isCorrect
                      ? 'border-[var(--border-subtle)] border-l-[var(--success)] bg-[var(--bg-surface)]'
                      : 'border-[var(--signal-border)] border-l-[var(--signal)] bg-[var(--signal-soft)]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-editorial text-[15.5px] font-medium text-[var(--ink-primary)]">
                      <span className="font-mono-code tnum mr-1.5 text-xs font-semibold text-[var(--ink-muted)]">
                        {idx + 1}.
                      </span>
                      {q.prompt}
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-semibold ${
                        isCorrect
                          ? 'border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]'
                          : 'border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> 정답
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" /> 복습
                        </>
                      )}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--ink-secondary)]">
                    <span>영역: {bilingual ? cat?.titleKo : cat?.titleEn}</span>
                    <span>내 선택: {userText}</span>
                    <span className="font-semibold text-[var(--success)]">
                      정답: {q.options[q.correctIndex]}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--ink-primary)]">
                    {bilingual ? q.explanationKo : q.explanationEn}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="border-b border-[var(--cover-border)] bg-[var(--cover-bg)] p-7 text-center text-[var(--cover-ink)]">
          <div className="mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--cover-border)] bg-[var(--cover-surface)] text-[var(--cover-ink)]">
            <Compass className="h-5 w-5" />
          </div>
          <p className="font-mono-code text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--cover-ink-muted)]">
            DIAGNOSTIC STUDY GUIDE
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-[var(--cover-ink)]">
            문법 진단 테스트 (Study Guide)
          </h1>
        </div>
        <div className="p-7 text-center">
          <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
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
            className="pressable interactive-btn-accent mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--accent-btn)] px-6 py-2.5 text-sm font-semibold text-white"
          >
            <span>16문항 진단 시작하기</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const cat = getCategoryById(currentQuestion.categoryId);
  const progressPct = Math.round(((stepIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100);

  return (
    <div className="mx-auto max-w-2xl space-y-5 rounded-xl border border-[var(--border-subtle)] border-t-2 border-t-[var(--accent)] bg-[var(--bg-surface)] p-6">
      <div className="tnum flex items-center justify-between text-xs font-semibold text-[var(--ink-muted)]">
        <span>
          문항 {stepIndex + 1} / {DIAGNOSTIC_QUESTIONS.length} ·{' '}
          {bilingual ? cat?.titleKo : cat?.titleEn}
        </span>
        <span>{progressPct}%</span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
        <div
          className="progress-fill h-full w-full bg-[var(--accent)]"
          style={{ transform: `scaleX(${progressPct / 100})` }}
        />
      </div>

      <div className="font-editorial rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-5 text-[17px] leading-relaxed text-[var(--ink-primary)]">
        {currentQuestion.prompt}
      </div>

      <div className="grid gap-2">
        {currentQuestion.options.map((opt, idx) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleAnswer(idx)}
            className="pressable-subtle interactive-surface interactive-accent-border flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-left text-sm font-medium text-[var(--ink-primary)]"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] text-xs font-bold text-[var(--ink-secondary)]">
              {String.fromCharCode(65 + idx)}
            </span>
            <span>{opt}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => handleAnswer('unsure')}
          className="pressable-subtle mt-1 inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--signal-border)] bg-[var(--signal-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--signal)]"
        >
          <HelpCircle className="h-4 w-4" />
          잘 모르겠어요 (추천 단원에 추가)
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
        <button
          type="button"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          className="pressable interactive-surface inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--ink-secondary)] disabled:opacity-40"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          이전 문항
        </button>
        <button
          type="button"
          onClick={() => {
            setStarted(false);
            setStepIndex(0);
          }}
          className="pressable interactive-surface rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--ink-muted)]"
        >
          진단 취소
        </button>
      </div>
    </div>
  );
}
