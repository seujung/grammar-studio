import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, RotateCw } from 'lucide-react';
import { ExerciseCard } from '../components/ExerciseRunner';
import { useApp } from '../context/AppContext';
import { getExerciseById } from '../data/units';
import { toDateKey } from '../lib/srs';
import type { SrsCard } from '../types/grammar';

export function ReviewPage() {
  const { progress, settings, dueCards, submitSrsReview } = useApp();
  const [sessionQueue, setSessionQueue] = useState<SrsCard[] | null>(null);
  const [queueIndex, setQueueIndex] = useState(0);
  const [lastIntervalMsg, setLastIntervalMsg] = useState<string>('');
  const [reviewedCount, setReviewedCount] = useState(0);

  const validQueue = useMemo(() => {
    const raw = sessionQueue ?? dueCards;
    return raw.filter((card) => Boolean(getExerciseById(card.exerciseId)));
  }, [sessionQueue, dueCards]);

  const currentCard = validQueue[queueIndex];
  const currentExercise = currentCard ? getExerciseById(currentCard.exerciseId) : undefined;

  const totalTracked = Object.keys(progress.srsCards).length;
  const upcomingCards = useMemo(
    () =>
      Object.values(progress.srsCards)
        .sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime())
        .slice(0, 5),
    [progress.srsCards],
  );

  if (validQueue.length === 0 || !currentCard || !currentExercise) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-xl border border-[var(--border-subtle)] border-t-2 border-t-[var(--accent)] bg-[var(--bg-surface)] p-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--ink-primary)]">
            오늘의 복습 완료
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
            {reviewedCount > 0
              ? `이번 세션에서 ${reviewedCount}개 문항을 복습했습니다.`
              : '지금 복습 기한이 지난 문항이 없습니다. 심화 단원에서 새 문제를 풀면 자동으로 복습 카드가 등록됩니다.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              to="/curriculum"
              className="pressable interactive-btn-accent inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-btn)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              커리큘럼에서 학습하기
            </Link>
          </div>
        </div>

        {totalTracked > 0 && (
          <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/70 px-5 py-3">
              <h2 className="tnum text-sm font-bold text-[var(--ink-primary)]">
                예약된 복습 카드 ({totalTracked}개 관리 중)
              </h2>
            </div>
            <ul className="divide-y divide-[var(--border-subtle)] text-xs text-[var(--ink-secondary)]">
              {upcomingCards.map((card) => (
                <li
                  key={card.exerciseId}
                  className="tnum flex items-center justify-between px-5 py-3"
                >
                  <span>
                    <span className="font-mono-code font-semibold text-[var(--ink-primary)]">
                      Unit {card.unitId}
                    </span>{' '}
                    · {card.exerciseId} (간격 {card.intervalDays}일)
                  </span>
                  <span className="font-semibold text-[var(--ink-primary)]">
                    {toDateKey(new Date(card.nextReviewAt))} 예정
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <RotateCw className="h-4 w-4 text-[var(--accent)]" />
          <div>
            <h1 className="text-sm font-bold text-[var(--ink-primary)] sm:text-base">
              오늘의 간격 반복 복습 (SRS)
            </h1>
            <p className="tnum text-xs text-[var(--ink-muted)]">
              Unit {currentCard.unitId} · 복습 {queueIndex + 1} / {validQueue.length}
            </p>
          </div>
        </div>
        <Link
          to={`/unit/${currentCard.unitId}`}
          className="text-xs font-semibold text-[var(--accent)] hover:underline"
        >
          단원 개념 보기 →
        </Link>
      </div>

      <div className="rounded-xl border border-[var(--border-subtle)] border-t-2 border-t-[var(--accent)] bg-[var(--bg-surface)] p-5 sm:p-6">
        <ExerciseCard
          exercise={currentExercise}
          languageMode={settings.languageMode}
          onGraded={(isCorrect) => {
            if (!sessionQueue) {
              setSessionQueue(validQueue);
            }
            const updated = submitSrsReview(currentCard.exerciseId, isCorrect);
            setReviewedCount((c) => c + 1);
            if (updated) {
              setLastIntervalMsg(
                updated.intervalDays === 1
                  ? '내일 다시 복습하도록 예약했습니다.'
                  : `${updated.intervalDays}일 뒤 다시 복습하도록 예약했습니다.`,
              );
            }
          }}
          extraFeedbackText={lastIntervalMsg}
          actionLabel={queueIndex + 1 < validQueue.length ? '다음 복습 카드' : '복습 마침'}
          onNext={() => {
            setLastIntervalMsg('');
            if (queueIndex + 1 < validQueue.length) {
              setQueueIndex((i) => i + 1);
            } else {
              setSessionQueue(null);
              setQueueIndex(0);
            }
          }}
        />
      </div>
    </div>
  );
}
