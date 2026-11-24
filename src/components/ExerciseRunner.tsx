import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, Sparkles, XCircle } from 'lucide-react';
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
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-900 dark:bg-blue-950/60 dark:text-blue-200">
          {languageMode === 'bilingual' ? `${label.ko} · ${label.en}` : label.en}
        </span>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {languageMode === 'bilingual' ? exercise.instructionKo : exercise.instructionEn}
        </p>
        {languageMode === 'bilingual' && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {exercise.instructionEn}
          </p>
        )}
      </div>

      {exercise.dialogueContext && (
        <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-slate-700 dark:bg-slate-800/60">
          {exercise.dialogueContext.map((turn, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {turn.speaker}
              </span>
              <span className="text-slate-800 dark:text-slate-100">{turn.line}</span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-stone-200 bg-white p-4 text-base font-medium leading-relaxed text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
        {exercise.prompt}
      </div>

      {exercise.wordBank && exercise.wordBank.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">보기:</span>
          {exercise.wordBank.map((word) => (
            <button
              key={word}
              type="button"
              disabled={Boolean(submitted)}
              onClick={() =>
                setTextInput((prev) => (prev.trim() ? `${prev.trim()} ${word}` : word))
              }
              className="rounded-md border border-stone-300 bg-stone-100 px-2.5 py-1 text-xs font-semibold text-slate-800 transition hover:border-blue-500 hover:bg-blue-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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
                'border-stone-200 bg-white hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900';

              if (submitted) {
                if (isAccepted) {
                  optionClass =
                    'border-emerald-500 bg-emerald-50 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100';
                } else if (isSelected && !submitted.isCorrect) {
                  optionClass =
                    'border-red-400 bg-red-50 text-red-950 dark:border-red-500 dark:bg-red-950/40 dark:text-red-100';
                }
              } else if (isSelected) {
                optionClass =
                  'border-blue-800 bg-blue-50 text-blue-950 dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-100';
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={Boolean(submitted)}
                  onClick={() => setSelectedOption(opt)}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition ${optionClass}`}
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
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20 disabled:bg-stone-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
            />
          </div>
        )}

        {!submitted && (
          <button
            type="submit"
            disabled={!currentAnswer.trim()}
            className="w-full rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            정답 확인
          </button>
        )}
      </form>

      {submitted && (
        <div
          className={`space-y-3 rounded-xl border p-4 ${
            submitted.isCorrect
              ? 'border-emerald-300 bg-emerald-50/80 dark:border-emerald-700 dark:bg-emerald-950/30'
              : 'border-red-300 bg-red-50/80 dark:border-red-700 dark:bg-red-950/30'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {submitted.isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    정답입니다!
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-bold text-red-900 dark:text-red-200">
                    아쉽습니다. 정답은 &ldquo;{exercise.acceptedAnswers[0]}&rdquo;입니다.
                  </span>
                </>
              )}
            </div>
            <SpeakButton text={exercise.fullSentence} compact showSlowOption />
          </div>

          <p className="rounded-lg bg-white/80 px-3 py-2 text-sm font-medium text-slate-800 dark:bg-slate-900/70 dark:text-slate-100">
            {exercise.fullSentence}
          </p>

          <p className="text-sm text-slate-700 dark:text-slate-200">
            {languageMode === 'bilingual' ? exercise.explanationKo : exercise.explanationEn}
          </p>
          {languageMode === 'bilingual' && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {exercise.explanationEn}
            </p>
          )}

          {extraFeedbackText && (
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
              {extraFeedbackText}
            </p>
          )}

          <button
            type="button"
            onClick={onNext}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
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
      <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
          <Sparkles className="h-5 w-5" />
          <h3 className="text-lg font-bold">Unit {unitId} 연습 완료</h3>
        </div>

        <div className="rounded-xl bg-stone-50 p-4 dark:bg-slate-800/70">
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {correctCount} / {totalCount} ({pct}%)
          </div>
          {isRetrySubset && unitProg && (
            <p className="mt-1 text-xs font-semibold text-blue-900 dark:text-blue-300">
              단원 전체 누적: {unitProg.correctExerciseIds.length} / {exercises.length} ({unitProg.bestScore}%)
            </p>
          )}
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/60"
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
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-stone-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            전체 다시 풀기
          </button>
          {onGoNextUnit && (
            <button
              type="button"
              onClick={onGoNextUnit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500"
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
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>
          연습 문제 {index + 1} / {activePool.length}
        </span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-stone-200 dark:bg-slate-800">
          <div
            className="h-full bg-blue-900 transition-all dark:bg-blue-500"
            style={{ width: `${Math.round(((index + 1) / activePool.length) * 100)}%` }}
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
