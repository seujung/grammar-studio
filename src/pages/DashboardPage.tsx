import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Flame,
  RotateCw,
  Target,
} from 'lucide-react';
import { ProgressFileBar } from '../components/ProgressFileBar';
import { useApp } from '../context/AppContext';
import { CATEGORIES, DEEP_UNIT_IDS, SYLLABUS_UNITS, getUnitSummary } from '../data/syllabus';

export function DashboardPage() {
  const { progress, settings, dueCards, streakDays, todayCompletedCount } = useApp();

  const completedDeepCount = Array.from(DEEP_UNIT_IDS).filter(
    (id) => Boolean(progress.unitProgress[id]?.completedAt),
  ).length;

  const nextDeepUnitId =
    Array.from(DEEP_UNIT_IDS).find((id) => !progress.unitProgress[id]?.completedAt) ?? 1;
  const nextDeepUnit = getUnitSummary(nextDeepUnitId);

  const goalRatio = Math.min(
    100,
    Math.round((todayCompletedCount / Math.max(1, settings.dailyGoal)) * 100),
  );

  const recommendedFirst = progress.diagnosticResult?.recommendedUnits[0];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900 dark:bg-blue-950/60 dark:text-blue-200">
              <span>16개 영역 · 145개 단원 체계</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              오늘의 영문법 학습
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              진단으로 취약 단원을 찾고, 개념 비교와 실전 연습, 간격 반복 복습으로 다집니다.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Target className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                <span>오늘 목표</span>
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {todayCompletedCount} / {settings.dailyGoal} 단원
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-slate-700">
                <div
                  className="h-full bg-blue-800 transition-all dark:bg-blue-400"
                  style={{ width: `${goalRatio}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Flame className="h-3.5 w-3.5 text-amber-600" />
                <span>연속 학습</span>
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {streakDays}일
              </div>
              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                심화 {completedDeepCount}/32 완료
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <RotateCw className="h-3.5 w-3.5 text-emerald-600" />
                <span>오늘의 복습</span>
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {dueCards.length}문항
              </div>
              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                SRS 자동 예약
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProgressFileBar />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-900 dark:text-blue-300">
              <Compass className="h-4 w-4" />
              <span>Study Guide 진단</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {progress.diagnosticResult
                ? `최근 진단 점수 ${progress.diagnosticResult.correctCount}/${progress.diagnosticResult.totalQuestions}. 추천 단원부터 바로 복습할 수 있습니다.`
                : '16개 문법 영역 대표 문항을 풀어 내 약점 단원을 3분 만에 찾습니다.'}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={recommendedFirst ? `/unit/${recommendedFirst}` : '/diagnostic'}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 dark:bg-blue-600"
            >
              <span>{recommendedFirst ? `추천 Unit ${recommendedFirst} 학습` : '진단 테스트 시작'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {progress.diagnosticResult && (
              <Link
                to="/diagnostic"
                className="inline-flex items-center rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-50 dark:border-slate-700 dark:text-slate-200"
              >
                결과 보기
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
              <RotateCw className="h-4 w-4" />
              <span>오늘의 복습 큐</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {dueCards.length > 0
                ? `지금 복습 기한이 돌아온 문항이 ${dueCards.length}개 있습니다.`
                : '오늘 복습할 문항을 모두 마쳤습니다. 새 단원을 풀어 보십시오.'}
            </p>
          </div>
          <div className="mt-4">
            <Link
              to="/review"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
            >
              <span>오늘의 복습 풀기</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <BookOpen className="h-4 w-4" />
              <span>이어서 학습하기</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {nextDeepUnit
                ? `Unit ${nextDeepUnit.id}. ${nextDeepUnit.titleKo} (${nextDeepUnit.titleEn})`
                : '핵심 단원 학습을 이어갑니다.'}
            </p>
          </div>
          <div className="mt-4">
            <Link
              to={`/unit/${nextDeepUnitId}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
            >
              <span>Unit {nextDeepUnitId} 열기</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            16개 문법 영역 숙련도 맵
          </h2>
          <Link
            to="/curriculum"
            className="text-xs font-semibold text-blue-800 hover:underline dark:text-blue-400"
          >
            전체 145개 단원 보기 →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const catUnits = SYLLABUS_UNITS.filter((u) => u.categoryId === cat.id);
            const deepUnits = catUnits.filter((u) => u.hasDeepContent);
            const doneDeep = deepUnits.filter(
              (u) => Boolean(progress.unitProgress[u.id]?.completedAt),
            ).length;
            const pct =
              deepUnits.length > 0 ? Math.round((doneDeep / deepUnits.length) * 100) : 0;
            const isWeak = progress.diagnosticResult?.weakCategories.includes(cat.id);

            return (
              <Link
                key={cat.id}
                to={`/curriculum?category=${cat.id}`}
                className="group rounded-xl border border-stone-200 bg-white p-4 transition hover:border-blue-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Units {cat.unitRange[0]}–{cat.unitRange[1]}
                  </span>
                  {doneDeep === deepUnits.length && deepUnits.length > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : isWeak ? (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      집중 필요
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-1.5 text-sm font-bold text-slate-900 group-hover:text-blue-900 dark:text-white dark:group-hover:text-blue-300">
                  {cat.titleKo}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{cat.titleEn}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>심화 {doneDeep}/{deepUnits.length}</span>
                  <span>{pct}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-slate-800">
                  <div
                    className="h-full bg-blue-900 transition-all dark:bg-blue-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
