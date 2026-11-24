import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Sparkles,
  X,
} from 'lucide-react';
import { ExerciseRunner } from '../components/ExerciseRunner';
import { SpeakButton } from '../components/SpeakButton';
import { useApp } from '../context/AppContext';
import { DEEP_UNIT_IDS, getCategoryById, getUnitSummary } from '../data/syllabus';
import { getUnitDetail } from '../data/units';

export function UnitStudyPage() {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const { settings } = useApp();
  const [mobileTab, setMobileTab] = useState<'concept' | 'practice'>('concept');

  useEffect(() => {
    setMobileTab('concept');
  }, [unitId]);

  const numericId = Number(unitId);
  const summary = Number.isInteger(numericId) ? getUnitSummary(numericId) : undefined;

  if (!summary) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          단원을 찾을 수 없습니다
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          1번부터 145번 사이의 단원 번호를 선택해 주십시오.
        </p>
        <Link
          to="/curriculum"
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
        >
          커리큘럼으로 돌아가기
        </Link>
      </div>
    );
  }

  const category = getCategoryById(summary.categoryId);
  const detail = getUnitDetail(summary.id);
  const deepList = Array.from(DEEP_UNIT_IDS).sort((a, b) => a - b);
  const nextDeepId = deepList.find((id) => id > summary.id);
  const bilingual = settings.languageMode === 'bilingual';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link to="/curriculum" className="hover:text-blue-800 dark:hover:text-blue-300">
            커리큘럼
          </Link>
          <span>/</span>
          <span>{category?.titleKo}</span>
          <span>/</span>
          <span className="font-bold text-slate-900 dark:text-white">Unit {summary.id}</span>
        </div>

        <div className="flex items-center gap-2">
          {summary.id > 1 && (
            <Link
              to={`/unit/${summary.id - 1}`}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-stone-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Unit {summary.id - 1}
            </Link>
          )}
          {summary.id < 145 && (
            <Link
              to={`/unit/${summary.id + 1}`}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-stone-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Unit {summary.id + 1}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <header className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-blue-900 px-2.5 py-1 text-xs font-bold text-white dark:bg-blue-600">
            Unit {summary.id}
          </span>
          {detail ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-900 dark:bg-blue-950 dark:text-blue-200">
              <Sparkles className="h-3.5 w-3.5" />
              심화 학습 · 8문항 연습
            </span>
          ) : (
            <span className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              핵심 요약 단원
            </span>
          )}
        </div>
        <h1 className="mt-2.5 text-2xl font-bold text-slate-900 dark:text-white">
          {bilingual ? summary.titleKo : summary.titleEn}
        </h1>
        {bilingual && (
          <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
            {summary.titleEn}
          </p>
        )}
      </header>

      {!detail ? (
        <div className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <BookOpen className="h-4 w-4 text-blue-800 dark:text-blue-400" />
              <span>핵심 학습 요약</span>
            </div>
            <p className="text-base leading-relaxed text-slate-800 dark:text-slate-100">
              {bilingual ? summary.summaryKo : summary.summaryEn}
            </p>
            {bilingual && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{summary.summaryEn}</p>
            )}
          </div>

          <div className="border-t border-stone-200 pt-5 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              연관 심화 단원으로 바로 연습하기
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              이 주제의 기초 또는 대비 개념을 다루는 심화 단원에서 예문 듣기와 8문항 연습을 진행할 수 있습니다.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {summary.relatedUnits.map((relId) => {
                const rel = getUnitSummary(relId);
                if (!rel) return null;
                return (
                  <Link
                    key={relId}
                    to={`/unit/${rel.id}`}
                    className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-4 transition hover:border-blue-500 dark:border-slate-700 dark:bg-slate-800/70"
                  >
                    <div>
                      <div className="text-xs font-bold text-blue-900 dark:text-blue-300">
                        Unit {rel.id} {rel.hasDeepContent ? '· 심화 단원' : ''}
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                        {rel.titleKo}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {rel.titleEn}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-900 dark:text-blue-300" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex rounded-xl border border-stone-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileTab('concept')}
              className={`flex-1 rounded-lg py-2 text-xs font-bold ${
                mobileTab === 'concept'
                  ? 'bg-blue-900 text-white dark:bg-blue-600'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              개념 설명
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('practice')}
              className={`flex-1 rounded-lg py-2 text-xs font-bold ${
                mobileTab === 'practice'
                  ? 'bg-blue-900 text-white dark:bg-blue-600'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              연습 문제 ({detail.exercises.length})
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div
              className={`space-y-5 lg:col-span-6 ${
                mobileTab === 'concept' ? 'block' : 'hidden lg:block'
              }`}
            >
              {detail.sections.map((sec) => (
                <section
                  key={sec.code}
                  className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-900 text-sm font-bold text-white dark:bg-blue-600">
                      {sec.code}
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {bilingual ? sec.titleKo : sec.titleEn}
                      </h2>
                      {bilingual && (
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {sec.titleEn}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    {bilingual ? sec.explanationKo : sec.explanationEn}
                  </p>
                  {bilingual && (
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {sec.explanationEn}
                    </p>
                  )}

                  {sec.formula && (
                    <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2 font-mono text-xs font-semibold text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                      {sec.formula}
                    </div>
                  )}

                  <ul className="mt-4 space-y-2.5">
                    {sec.examples.map((ex, i) => (
                      <li
                        key={i}
                        className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {ex.en}
                          </span>
                          <SpeakButton text={ex.en} compact />
                        </div>
                        {bilingual && (
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                            {ex.ko}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {bilingual ? detail.comparisonTitleKo : detail.comparisonTitleEn}
                </h2>
                <div className="mt-3 space-y-3">
                  {detail.comparisons.map((row, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50"
                    >
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <div className="text-[11px] font-bold text-blue-900 dark:text-blue-300">
                            {row.leftLabel}
                          </div>
                          <div className="mt-0.5 text-sm font-medium text-slate-900 dark:text-white">
                            {row.leftExample}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                            {row.rightLabel}
                          </div>
                          <div className="mt-0.5 text-sm font-medium text-slate-900 dark:text-white">
                            {row.rightExample}
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 border-t border-stone-200 pt-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        {bilingual ? row.noteKo : row.noteEn}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <h2>자주 하는 실수</h2>
                </div>
                <div className="mt-3 space-y-3">
                  {detail.commonMistakes.map((m, idx) => (
                    <div
                      key={idx}
                      className="space-y-1.5 rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-sm dark:border-slate-800 dark:bg-slate-800/50"
                    >
                      <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
                        <X className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="line-through">{m.wrong}</span>
                      </div>
                      <div className="flex items-start gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{m.right}</span>
                      </div>
                      <p className="pt-1 text-xs text-slate-600 dark:text-slate-300">
                        {bilingual ? m.explanationKo : m.explanationEn}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {summary.relatedUnits.length > 0 && (
                <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    연관 단원
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {summary.relatedUnits.map((relId) => {
                      const rel = getUnitSummary(relId);
                      return (
                        <Link
                          key={relId}
                          to={`/unit/${relId}`}
                          className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          Unit {relId} {rel ? `· ${rel.titleKo}` : ''}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            <div
              className={`lg:col-span-6 ${
                mobileTab === 'practice' ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="lg:sticky lg:top-20">
                <ExerciseRunner
                  unitId={summary.id}
                  exercises={detail.exercises}
                  onGoNextUnit={
                    nextDeepId ? () => navigate(`/unit/${nextDeepId}`) : undefined
                  }
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
