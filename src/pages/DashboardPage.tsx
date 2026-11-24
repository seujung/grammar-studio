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
      <section className="border-b border-[var(--border-subtle)] pb-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="space-y-1.5">
            <p className="font-mono-code text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--accent)]">
              16개 영역 · 145개 단원 체계
            </p>
            <h1 className="text-2xl font-bold tracking-[-0.025em] text-[var(--ink-primary)] sm:text-[30px]">
              오늘의 영문법 학습
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
              진단으로 취약 단원을 찾고, 개념 비교와 실전 연습, 간격 반복 복습으로 다집니다.
            </p>
          </div>

          <dl className="grid grid-cols-3 divide-x divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3 lg:min-w-[400px]">
            <div className="px-4">
              <dt className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--ink-muted)]">
                <Target className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span>오늘 목표</span>
              </dt>
              <dd className="tnum mt-1 text-base font-bold text-[var(--ink-primary)] sm:text-lg">
                {todayCompletedCount} / {settings.dailyGoal} 단원
              </dd>
              <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                <div
                  className="progress-fill h-full w-full bg-[var(--accent)]"
                  style={{ transform: `scaleX(${goalRatio / 100})` }}
                />
              </div>
            </div>

            <div className="px-4">
              <dt className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--ink-muted)]">
                <Flame className="h-3.5 w-3.5 text-[var(--signal)]" />
                <span>연속 학습</span>
              </dt>
              <dd className="tnum mt-1 text-base font-bold text-[var(--ink-primary)] sm:text-lg">
                {streakDays}일
              </dd>
              <div className="tnum mt-1 text-[11px] text-[var(--ink-muted)]">
                심화 {completedDeepCount}/32 완료
              </div>
            </div>

            <div className="px-4">
              <dt className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--ink-muted)]">
                <RotateCw className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span>오늘의 복습</span>
              </dt>
              <dd className="tnum mt-1 text-base font-bold text-[var(--ink-primary)] sm:text-lg">
                {dueCards.length}문항
              </dd>
              <div className="mt-1 text-[11px] text-[var(--ink-muted)]">SRS 자동 예약</div>
            </div>
          </dl>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-12">
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--cover-border)] bg-[var(--cover-bg)] p-6 text-[var(--cover-ink)] lg:col-span-7">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--cover-ink-muted)]">
                <BookOpen className="h-3.5 w-3.5" />
                <span>이어서 학습하기</span>
              </div>
              <span className="font-mono-code tnum rounded-md border border-[var(--cover-border)] bg-[var(--cover-surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--cover-ink)]">
                UNIT {String(nextDeepUnitId).padStart(3, '0')}
              </span>
            </div>

            <h2 className="mt-5 text-xl font-bold tracking-[-0.015em] text-[var(--cover-ink)] sm:text-2xl">
              {nextDeepUnit
                ? `Unit ${nextDeepUnit.id}. ${nextDeepUnit.titleKo}`
                : '핵심 단원 학습을 이어갑니다.'}
            </h2>
            {nextDeepUnit && (
              <p className="font-editorial mt-1 text-base italic text-[var(--cover-ink-muted)]">
                {nextDeepUnit.titleEn}
              </p>
            )}
            {nextDeepUnit?.summaryKo && (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--cover-ink-muted)]">
                {nextDeepUnit.summaryKo}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--cover-border)] pt-4">
            <span className="text-xs text-[var(--cover-ink-muted)]">
              개념 비교표 · 원어민 예문 듣기 · 8문항 실전 연습
            </span>
            <Link
              to={`/unit/${nextDeepUnitId}`}
              className="pressable inline-flex items-center gap-1.5 rounded-lg bg-[#fcfbf8] px-4 py-2 text-xs font-bold text-[#163b2d] transition-opacity hover:opacity-95"
            >
              <span>Unit {nextDeepUnitId} 열기</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 lg:col-span-5">
          <div className="flex flex-1 flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4.5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)]">
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>오늘의 복습 큐</span>
                </div>
                <span className="font-editorial tnum text-2xl font-semibold leading-none text-[var(--ink-primary)]">
                  {dueCards.length}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
                {dueCards.length > 0
                  ? `지금 복습 기한이 돌아온 문항이 ${dueCards.length}개 있습니다.`
                  : '오늘 복습할 문항을 모두 마쳤습니다. 새 단원을 풀어 보십시오.'}
              </p>
            </div>
            <div className="mt-3.5">
              <Link
                to="/review"
                className="pressable inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3.5 py-2 text-xs font-semibold text-[var(--accent)]"
              >
                <span>오늘의 복습 풀기</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4.5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--signal)]">
                  <Compass className="h-3.5 w-3.5" />
                  <span>Study Guide 진단</span>
                </div>
                {progress.diagnosticResult && (
                  <span className="font-mono-code tnum rounded border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--ink-primary)]">
                    {progress.diagnosticResult.correctCount}/{progress.diagnosticResult.totalQuestions}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
                {progress.diagnosticResult
                  ? `최근 진단 점수 ${progress.diagnosticResult.correctCount}/${progress.diagnosticResult.totalQuestions}. 추천 단원부터 바로 복습할 수 있습니다.`
                  : '16개 문법 영역 대표 문항을 풀어 내 약점 단원을 3분 만에 찾습니다.'}
              </p>
            </div>
            <div className="mt-3.5 flex flex-wrap gap-2">
              <Link
                to={recommendedFirst ? `/unit/${recommendedFirst}` : '/diagnostic'}
                className="pressable interactive-surface interactive-border inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3.5 py-2 text-xs font-semibold text-[var(--ink-primary)]"
              >
                <span>
                  {recommendedFirst ? `추천 Unit ${recommendedFirst} 학습` : '진단 테스트 시작'}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {progress.diagnosticResult && (
                <Link
                  to="/diagnostic"
                  className="pressable interactive-surface inline-flex items-center rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold text-[var(--ink-secondary)]"
                >
                  결과 보기
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-[var(--border-subtle)] pb-2.5">
          <h2 className="text-lg font-bold tracking-[-0.015em] text-[var(--ink-primary)]">
            16개 문법 영역 숙련도 맵
          </h2>
          <Link
            to="/curriculum"
            className="text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            전체 145개 단원 보기 →
          </Link>
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat, idx) => {
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
                className="pressable-subtle interactive-surface group flex flex-col justify-between bg-[var(--bg-surface)] p-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono-code tnum text-[11px] font-medium text-[var(--ink-muted)]">
                      {String(idx + 1).padStart(2, '0')} · Units {cat.unitRange[0]}–{cat.unitRange[1]}
                    </span>
                    {doneDeep === deepUnits.length && deepUnits.length > 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
                    ) : isWeak ? (
                      <span className="rounded border border-[var(--signal-border)] bg-[var(--signal-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--signal)]">
                        집중 필요
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-[var(--ink-primary)] group-hover:text-[var(--accent)]">
                    {cat.titleKo}
                  </h3>
                  <p className="font-editorial mt-0.5 text-[13px] text-[var(--ink-secondary)]">
                    {cat.titleEn}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="tnum flex items-center justify-between text-[11px] text-[var(--ink-muted)]">
                    <span>
                      심화 {doneDeep}/{deepUnits.length}
                    </span>
                    <span className="font-semibold text-[var(--ink-secondary)]">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-[2px] w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                    <div
                      className="progress-fill h-full w-full bg-[var(--accent)]"
                      style={{ transform: `scaleX(${pct / 100})` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <ProgressFileBar />
    </div>
  );
}
