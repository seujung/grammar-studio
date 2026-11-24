import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Search, Sparkles } from 'lucide-react';
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
        const matchesEn = unit.titleEn.toLowerCase().includes(q) || unit.summaryEn.toLowerCase().includes(q);
        const matchesKo = unit.titleKo.toLowerCase().includes(q) || unit.summaryKo.toLowerCase().includes(q);
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
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            전체 커리큘럼 (145개 단원)
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            핵심 32개 단원은 심화 설명·비교표·8문항 실전 연습을 제공합니다.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="단원 번호, 영문, 한국어 검색"
            aria-label="단원 검색"
            className="w-full rounded-xl border border-stone-300 bg-stone-50 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
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
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              statusFilter === key
                ? 'bg-blue-900 text-white dark:bg-blue-600'
                : 'border border-stone-200 bg-white text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => handleCategoryChange('all')}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'border border-stone-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          모든 영역
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(cat.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'border border-stone-200 bg-white text-slate-600 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {cat.order}. {cat.titleKo}
          </button>
        ))}
      </div>

      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
        표시 중: {filteredUnits.length}개 단원
      </div>

      {filteredUnits.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
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
                className={`flex flex-col justify-between rounded-xl border p-4 transition hover:shadow-sm ${
                  unit.hasDeepContent
                    ? 'border-blue-200 bg-white hover:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-400'
                    : 'border-stone-200 bg-stone-50/70 hover:border-stone-400 dark:border-slate-800 dark:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Unit {unit.id} · {cat?.titleKo}
                    </span>
                    <div className="flex items-center gap-1">
                      {isRecommended && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                          추천
                        </span>
                      )}
                      {unit.hasDeepContent ? (
                        <span className="inline-flex items-center gap-0.5 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-200">
                          <Sparkles className="h-2.5 w-2.5" />
                          심화 · 8문항
                        </span>
                      ) : (
                        <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          핵심 요약
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                    {unit.titleKo}
                  </h2>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {unit.titleEn}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                    {unit.summaryKo}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-stone-200/70 pt-2.5 text-xs dark:border-slate-800">
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      완료 ({unitProg?.bestScore ?? 100}%)
                    </span>
                  ) : unitProg ? (
                    <span className="font-medium text-blue-800 dark:text-blue-300">
                      진행 중 ({unitProg.bestScore}%)
                    </span>
                  ) : (
                    <span className="text-slate-400">학습 전</span>
                  )}
                  <span className="font-semibold text-blue-900 dark:text-blue-300">
                    열기 →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
