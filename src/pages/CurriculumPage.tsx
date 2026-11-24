import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, SYLLABUS_UNITS, getCategoryById } from '../data/syllabus';
import type { CategoryId } from '../types/grammar';

type StatusFilter = 'all' | 'deep' | 'recommended' | 'completed' | 'incomplete';

export function CurriculumPage() {
  const { progress } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramCat = searchParams.get('category') as CategoryId | null;
  const selectedCategory: CategoryId | 'all' =
    paramCat && CATEGORIES.some((c) => c.id === paramCat) ? paramCat : 'all';

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const recommendedSet = useMemo(
    () => new Set(progress.diagnosticResult?.recommendedUnits ?? []),
    [progress.diagnosticResult],
  );

  const filteredUnits = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SYLLABUS_UNITS.filter((unit) => {
      if (selectedCategory !== 'all' && unit.categoryId !== selectedCategory) return false;
      const isDone = Boolean(progress.unitProgress[unit.id]?.completedAt);
      if (statusFilter === 'deep' && !unit.hasDeepContent) return false;
      if (statusFilter === 'recommended' && !recommendedSet.has(unit.id)) return false;
      if (statusFilter === 'completed' && !isDone) return false;
      if (statusFilter === 'incomplete' && isDone) return false;

      if (q) {
        const matchesId = String(unit.id) === q || `unit ${unit.id}`.includes(q);
        const matchesEn =
          unit.titleEn.toLowerCase().includes(q) || unit.summaryEn.toLowerCase().includes(q);
        const matchesKo =
          unit.titleKo.toLowerCase().includes(q) || unit.summaryKo.toLowerCase().includes(q);
        return matchesId || matchesEn || matchesKo;
      }
      return true;
    });
  }, [query, selectedCategory, statusFilter, progress.unitProgress, recommendedSet]);

  const handleCategoryChange = (cat: CategoryId | 'all') => {
    const next = new URLSearchParams(searchParams);
    if (cat === 'all') {
      next.delete('category');
    } else {
      next.set('category', cat);
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 border-b border-[var(--border-subtle)] pb-5 md:flex-row md:items-end">
        <div>
          <p className="font-mono-code text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--accent)]">
            SYLLABUS INDEX · UNITS 1–145
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-[var(--ink-primary)]">
            전체 커리큘럼 (145개 단원)
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-secondary)]">
            핵심 32개 단원은 심화 설명·비교표·8문항 실전 연습을 제공합니다.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="단원 번호, 영문, 한국어 검색"
            aria-label="단원 검색"
            className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] py-2 pl-9 pr-3 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] transition-[border-color] duration-150 focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
      </section>

      <div className="space-y-3">
        <div className="inline-flex flex-wrap gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-1">
          {(
            [
              ['all', '전체 145'],
              ['deep', '심화 단원 32'],
              ['recommended', '추천 단원'],
              ['completed', '완료'],
              ['incomplete', '미완료'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`pressable rounded-lg px-3 py-1.5 text-xs font-semibold ${
                statusFilter === key
                  ? 'studio-nav-active text-[var(--ink-primary)]'
                  : 'text-[var(--ink-secondary)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => handleCategoryChange('all')}
            className={`pressable shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              selectedCategory === 'all'
                ? 'border-[var(--accent-btn)] bg-[var(--accent-btn)] text-white'
                : 'interactive-surface border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-secondary)]'
            }`}
          >
            모든 영역
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`pressable shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                selectedCategory === cat.id
                  ? 'border-[var(--accent-btn)] bg-[var(--accent-btn)] text-white'
                  : 'interactive-surface border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-secondary)]'
              }`}
            >
              {cat.order}. {cat.titleKo}
            </button>
          ))}
        </div>
      </div>

      <div className="tnum text-xs font-medium text-[var(--ink-muted)]">
        표시 중: {filteredUnits.length}개 단원
      </div>

      {filteredUnits.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-10 text-center text-sm text-[var(--ink-secondary)]">
          조건에 맞는 단원이 없습니다. 검색어나 필터를 초기화해 보십시오.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUnits.map((unit) => {
            const cat = getCategoryById(unit.categoryId);
            const unitProg = progress.unitProgress[unit.id];
            const isDone = Boolean(unitProg?.completedAt);
            const isRecommended = recommendedSet.has(unit.id);

            return (
              <Link
                key={unit.id}
                to={`/unit/${unit.id}`}
                className={`pressable-subtle interactive-surface interactive-accent-border group flex flex-col justify-between rounded-xl border p-4 ${
                  unit.hasDeepContent
                    ? 'border-[var(--border-subtle)] border-l-2 border-l-[var(--accent)] bg-[var(--bg-surface)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)]/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-code tnum text-[11px] font-semibold text-[var(--ink-muted)]">
                      Unit {unit.id} · {cat?.titleKo}
                    </span>
                    <div className="flex items-center gap-1">
                      {isRecommended && (
                        <span className="rounded border border-[var(--signal-border)] bg-[var(--signal-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--signal)]">
                          추천
                        </span>
                      )}
                      {unit.hasDeepContent ? (
                        <span className="rounded border border-[var(--accent-border)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                          심화 · 8문항
                        </span>
                      ) : (
                        <span className="rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--ink-muted)]">
                          핵심 요약
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="mt-2 text-sm font-bold text-[var(--ink-primary)] group-hover:text-[var(--accent)]">
                    {unit.titleKo}
                  </h2>
                  <p className="font-editorial mt-0.5 text-[13px] text-[var(--ink-secondary)]">
                    {unit.titleEn}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--ink-secondary)]">
                    {unit.summaryKo}
                  </p>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5 text-xs">
                  {isDone ? (
                    <span className="tnum inline-flex items-center gap-1 font-semibold text-[var(--success)]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      완료 ({unitProg?.bestScore ?? 100}%)
                    </span>
                  ) : unitProg ? (
                    <span className="tnum font-semibold text-[var(--accent)]">
                      진행 중 ({unitProg.bestScore}%)
                    </span>
                  ) : (
                    <span className="text-[var(--ink-muted)]">학습 전</span>
                  )}
                  <span className="font-semibold text-[var(--accent)]">열기 →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
