import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { gradeAnswer } from '../lib/grader';
import type { Exercise, ExerciseType } from '../types/grammar';
import { SpeakButton } from './SpeakButton';

const TYPE_LABELS: Record<ExerciseType, { en: string; ko: string }> = {
  'multiple-choice': { en: 'Multiple Choice', ko: '객관식' },
  'fill-blank': { en: 'Fill in the Blank', ko: '빈칸 채우기' },
  transform: { en: 'Sentence Transformation', ko: '문장 변형' },
  dialogue: { en: 'Complete the Dialogue', ko: '대화 완성' },
};

interface ExerciseCardProps {
  exercise: Exercise;
  languageMode: 'bilingual' | 'en';
  onGraded: (isCorrect: boolean) => void;
  actionLabel: string;
  onNext: () => void;
  extraFeedbackText?: string;
}

export function ExerciseCard({
  exercise,
  languageMode,
  onGraded,
  actionLabel,
  onNext,
  extraFeedbackText,
}: ExerciseCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [submitted, setSubmitted] = useState<{ isCorrect: boolean } | null>(null);

  useEffect(() => {
    setSelectedOption('');
    setTextInput('');
    setSubmitted(null);
  }, [exercise.id]);

  const currentAnswer = exercise.type === 'multiple-choice' ? selectedOption : textInput;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (submitted) return;
    if (!currentAnswer.trim()) return;

    const result = gradeAnswer(currentAnswer, exercise.acceptedAnswers);
    setSubmitted({ isCorrect: result.isCorrect });
    onGraded(result.isCorrect);
  };

  const label = TYPE_LABELS[exercise.type];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center rounded border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--ink-secondary)]">
          {languageMode === 'bilingual' ? `${label.ko} · ${label.en}` : label.en}
        </span>
      </div>

      <div>
        <p className="text-sm font-semibold text-[var(--ink-primary)]">
          {languageMode === 'bilingual' ? exercise.instructionKo : exercise.instructionEn}
        </p>
        {languageMode === 'bilingual' && (
          <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
            {exercise.instructionEn}
          </p>
        )}
      </div>

      {exercise.dialogueContext && (
        <div className="space-y-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/70 p-3.5">
          {exercise.dialogueContext.map((turn, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[11px] font-bold text-[var(--ink-secondary)]">
                {turn.speaker}
              </span>
              <span className="font-editorial text-[15px] text-[var(--ink-primary)]">
                {turn.line}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="font-editorial rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-4 py-4 text-[17px] leading-relaxed text-[var(--ink-primary)]">
        {exercise.prompt}
      </div>

      {exercise.wordBank && exercise.wordBank.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-muted)]">보기:</span>
          {exercise.wordBank.map((word) => (
            <button
              key={word}
              type="button"
              disabled={Boolean(submitted)}
              onClick={() =>
                setTextInput((prev) => (prev.trim() ? `${prev.trim()} ${word}` : word))
              }
              className="pressable interactive-surface interactive-accent-border rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--ink-primary)] disabled:opacity-50"
            >
              {word}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {exercise.type === 'multiple-choice' && exercise.options ? (
          <div className="grid gap-2">
            {exercise.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOption === opt;
              const isAccepted =
                submitted &&
                exercise.acceptedAnswers.some(
                  (a) => a.toLowerCase() === opt.toLowerCase(),
                );
              let optionClass =
                'interactive-surface interactive-border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-primary)]';

              if (submitted) {
                if (isAccepted) {
                  optionClass =
                    'border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]';
                } else if (isSelected && !submitted.isCorrect) {
                  optionClass =
                    'border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]';
                }
              } else if (isSelected) {
                optionClass =
                  'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]';
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={Boolean(submitted)}
                  onClick={() => setSelectedOption(opt)}
                  className={`pressable-subtle flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium ${optionClass}`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current/25 text-xs font-bold">
                    {letter}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <label htmlFor={`answer-input-${exercise.id}`} className="sr-only">
              정답 입력
            </label>
            <input
              id={`answer-input-${exercise.id}`}
              type="text"
              value={textInput}
              disabled={Boolean(submitted)}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="정답을 입력하십시오 (축약형·전체형 모두 인정)"
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] transition-[border-color,background-color] duration-150 focus:border-[var(--accent)] focus:outline-none disabled:bg-[var(--bg-subtle)]"
            />
          </div>
        )}

        {!submitted && (
          <button
            type="submit"
            disabled={!currentAnswer.trim()}
            className="pressable interactive-btn-accent w-full rounded-lg bg-[var(--accent-btn)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            정답 확인
          </button>
        )}
      </form>

      {submitted && (
        <div
          className={`feedback-enter space-y-3 rounded-xl border border-l-2 p-4 ${
            submitted.isCorrect
              ? 'border-[var(--success-border)] border-l-[var(--success)] bg-[var(--success-soft)]'
              : 'border-[var(--danger-border)] border-l-[var(--danger)] bg-[var(--danger-soft)]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {submitted.isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
                  <span className="text-sm font-bold text-[var(--success)]">
                    정답입니다!
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-[var(--danger)]" />
                  <span className="text-sm font-bold text-[var(--danger)]">
                    아쉽습니다. 정답은 &ldquo;{exercise.acceptedAnswers[0]}&rdquo;입니다.
                  </span>
                </>
              )}
            </div>
            <SpeakButton text={exercise.fullSentence} compact showSlowOption />
          </div>

          <p className="font-editorial rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[15.5px] text-[var(--ink-primary)]">
            {exercise.fullSentence}
          </p>

          <p className="text-sm leading-relaxed text-[var(--ink-primary)]">
            {languageMode === 'bilingual' ? exercise.explanationKo : exercise.explanationEn}
          </p>
          {languageMode === 'bilingual' && (
            <p className="text-xs leading-relaxed text-[var(--ink-secondary)]">
              {exercise.explanationEn}
            </p>
          )}

          {extraFeedbackText && (
            <p className="text-xs font-semibold text-[var(--accent)]">
              {extraFeedbackText}
            </p>
          )}

          <button
            type="button"
            onClick={onNext}
            className="pressable interactive-btn-ink inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--ink-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--bg-canvas)]"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

interface ExerciseRunnerProps {
  unitId: number;
  exercises: Exercise[];
  onGoNextUnit?: () => void;
}

export function ExerciseRunner({ unitId, exercises, onGoNextUnit }: ExerciseRunnerProps) {
  const { progress, settings, recordExerciseAttempt } = useApp();
  const [activePool, setActivePool] = useState<Exercise[]>(exercises);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setActivePool(exercises);
    setIndex(0);
    setResults({});
    setFinished(false);
  }, [unitId, exercises]);

  const wrongExercises = useMemo(
    () => activePool.filter((ex) => results[ex.id] === false),
    [activePool, results],
  );

  const currentExercise = activePool[index];

  if (finished || !currentExercise) {
    const correctCount = Object.values(results).filter(Boolean).length;
    const totalCount = activePool.length;
    const pct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const unitProg = progress.unitProgress[unitId];
    const isRetrySubset = activePool.length < exercises.length;
    const unitCompleted = Boolean(unitProg?.completedAt);

    return (
      <div className="space-y-5 rounded-xl border border-[var(--border-subtle)] border-t-2 border-t-[var(--accent)] bg-[var(--bg-surface)] p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-mono-code text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
              UNIT {unitId} COMPLETE
            </span>
            <h3 className="mt-1 text-lg font-bold text-[var(--ink-primary)]">
              Unit {unitId} 연습 완료
            </h3>
          </div>
          {unitCompleted && (
            <CheckCircle2 className="h-6 w-6 text-[var(--success)]" />
          )}
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-4">
          <div className="font-editorial tnum text-3xl font-semibold text-[var(--ink-primary)]">
            {correctCount} / {totalCount}{' '}
            <span className="text-xl text-[var(--ink-secondary)]">({pct}%)</span>
          </div>
          {isRetrySubset && unitProg && (
            <p className="tnum mt-1 text-xs font-semibold text-[var(--accent)]">
              단원 전체 누적: {unitProg.correctExerciseIds.length} / {exercises.length} ({unitProg.bestScore}%)
            </p>
          )}
          <p className="mt-1.5 text-sm text-[var(--ink-secondary)]">
            {unitCompleted
              ? '통과 기준(75%)을 넘겨 단원 학습을 완료했습니다.'
              : '틀린 문항이 내일 복습 큐에 예약되었습니다. 다시 풀며 다져 보십시오.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {wrongExercises.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setActivePool(wrongExercises);
                setIndex(0);
                setResults({});
                setFinished(false);
              }}
              className="pressable inline-flex items-center gap-1.5 rounded-lg border border-[var(--signal-border)] bg-[var(--signal-soft)] px-4 py-2 text-sm font-semibold text-[var(--signal)]"
            >
              <RotateCcw className="h-4 w-4" />
              틀린 문제만 다시 풀기 ({wrongExercises.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setActivePool(exercises);
              setIndex(0);
              setResults({});
              setFinished(false);
            }}
            className="pressable interactive-surface interactive-border inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--ink-primary)]"
          >
            전체 다시 풀기
          </button>
          {onGoNextUnit && (
            <button
              type="button"
              onClick={onGoNextUnit}
              className="pressable interactive-btn-accent inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-btn)] px-4 py-2 text-sm font-semibold text-white"
            >
              다음 심화 단원
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] border-t-2 border-t-[var(--accent)] bg-[var(--bg-surface)] p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3 text-xs font-semibold text-[var(--ink-muted)]">
        <div className="flex items-center gap-2">
          <span className="font-mono-code text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            WORKBOOK
          </span>
          <span className="text-[var(--border-strong)]">·</span>
          <span className="tnum">
            연습 문제 {index + 1} / {activePool.length}
          </span>
        </div>
        <div className="h-[3px] w-28 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
          <div
            className="progress-fill h-full w-full bg-[var(--accent)]"
            style={{ transform: `scaleX(${(index + 1) / activePool.length})` }}
          />
        </div>
      </div>

      <ExerciseCard
        exercise={currentExercise}
        languageMode={settings.languageMode}
        onGraded={(isCorrect) => {
          setResults((prev) => ({ ...prev, [currentExercise.id]: isCorrect }));
          recordExerciseAttempt(currentExercise.id, unitId, isCorrect, exercises.length);
        }}
        actionLabel={index + 1 < activePool.length ? '다음 문제' : '결과 보기'}
        onNext={() => {
          if (index + 1 < activePool.length) {
            setIndex((i) => i + 1);
          } else {
            setFinished(true);
          }
        }}
      />
    </div>
  );
}
