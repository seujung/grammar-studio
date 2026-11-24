import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, RotateCw, Sparkles } from 'lucide-react';
import { ExerciseCard } from '../components/ExerciseRunner';
import { useApp } from '../context/AppContext';
import { getExerciseById } from '../data/units';
import type { SrsCard } from '../types/grammar';

export function ReviewPage() {
  const { progress, settings, dueCards, submitSrsReview } = useApp();
  const [sessionQueue, setSessionQueue] = useState<SrsCard[] | null>(null);
  const [queueIndex, setQueueIndex] = useState(0);
  const [lastIntervalMsg, setLastIntervalMsg] = useState<string>('');
  const [reviewedCount, setReviewedCount] = useState(0);

  const activeQueue = sessionQueue ?? dueCards;
  const currentCard = activeQueue[queueIndex];
  const currentExercise = currentCard ? getExerciseById(currentCard.exerciseId) : undefined;

  const totalTracked = Object.keys(progress.srsCards).length;
  const upcomingCards = useMemo(
    () =>
      Object.values(progress.srsCards)
        .sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime())
        .slice(0, 5),
    [progress.srsCards],
  );

  if (activeQueue.length === 0 || !currentCard || !currentExercise) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            오늘의 복습 완료
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {reviewedCount > 0
              ? `이번 세션에서 ${reviewedCount}개 문항을 복습했습니다.`
              : '지금 복습 기한이 지난 문항이 없습니다. 심화 단원에서 새 문제를 풀면 자동으로 복습 카드가 등록됩니다.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              to="/curriculum"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600"
            >
              <Sparkles className="h-4 w-4" />
              커리큘럼에서 학습하기
            </Link>
          </div>
        </div>

        {totalTracked > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              예약된 복습 카드 ({totalTracked}개 관리 중)
            </h2>
            <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {upcomingCards.map((card) => (
                <li
                  key={card.exerciseId}
                  className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 dark:bg-slate-800/60"
                >
                  <span>
                    Unit {card.unitId} · {card.exerciseId} (간격 {card.intervalDays}일)
                  </span>
                  <span className="font-semibold">
                    {card.nextReviewAt.slice(0, 10)} 예정
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
      <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <RotateCw className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">
              오늘의 간격 반복 복습 (SRS)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unit {currentCard.unitId} · 복습 {queueIndex + 1} / {activeQueue.length}
            </p>
          </div>
        </div>
        <Link
          to={`/unit/${currentCard.unitId}`}
          className="text-xs font-semibold text-blue-800 hover:underline dark:text-blue-300"
        >
          단원 개념 보기 →
        </Link>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <ExerciseCard
          exercise={currentExercise}
          languageMode={settings.languageMode}
          onGraded={(isCorrect) => {
            if (!sessionQueue) {
              setSessionQueue(dueCards);
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
          actionLabel={queueIndex + 1 < activeQueue.length ? '다음 복습 카드' : '복습 마침'}
          onNext={() => {
            setLastIntervalMsg('');
            if (queueIndex + 1 < activeQueue.length) {
              setQueueIndex((i) => i + 1);
            } else {
              setSessionQueue([]);
              setQueueIndex(0);
            }
          }}
        />
      </div>
    </div>
  );
}
