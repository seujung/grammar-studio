import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
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
      <div className="mx-auto max-w-lg rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center">
        <h1 className="text-xl font-bold text-[var(--ink-primary)]">
          단원을 찾을 수 없습니다
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-secondary)]">
          1번부터 145번 사이의 단원 번호를 선택해 주십시오.
        </p>
        <Link
          to="/curriculum"
          className="pressable interactive-btn-accent mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-btn)] px-4 py-2 text-sm font-semibold text-white"
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--ink-muted)]">
          <Link to="/curriculum" className="hover:text-[var(--accent)]">
            커리큘럼
          </Link>
          <span>/</span>
          <span>{category?.titleKo}</span>
          <span>/</span>
          <span className="tnum font-semibold text-[var(--ink-primary)]">Unit {summary.id}</span>
        </div>

        <div className="flex items-center gap-2">
          {summary.id > 1 && (
            <Link
              to={`/unit/${summary.id - 1}`}
              className="pressable interactive-surface interactive-border inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-secondary)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Unit {summary.id - 1}
            </Link>
          )}
          {summary.id < 145 && (
            <Link
              to={`/unit/${summary.id + 1}`}
              className="pressable interactive-surface interactive-border inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-secondary)]"
            >
              Unit {summary.id + 1}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <header className="border-b border-[var(--border-subtle)] pb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono-code tnum rounded bg-[var(--cover-bg)] px-2.5 py-0.5 text-xs font-semibold tracking-wider text-[var(--cover-ink)]">
            UNIT {summary.id}
          </span>
          {detail ? (
            <span className="text-xs font-semibold text-[var(--accent)]">
              심화 학습 · 8문항 연습
            </span>
          ) : (
            <span className="text-xs font-medium text-[var(--ink-muted)]">
              핵심 요약 단원
            </span>
          )}
        </div>
        <h1
          className={`mt-2.5 text-2xl font-bold tracking-[-0.02em] text-[var(--ink-primary)] sm:text-[28px] ${
            !bilingual ? 'font-editorial' : ''
          }`}
        >
          {bilingual ? summary.titleKo : summary.titleEn}
        </h1>
        {bilingual && (
          <p className="font-editorial mt-1 text-base italic text-[var(--ink-secondary)] sm:text-lg">
            {summary.titleEn}
          </p>
        )}
      </header>

      {!detail ? (
        <div className="space-y-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink-primary)]">
              <BookOpen className="h-4 w-4 text-[var(--accent)]" />
              <span>핵심 학습 요약</span>
            </div>
            <p className="text-base leading-relaxed text-[var(--ink-primary)]">
              {bilingual ? summary.summaryKo : summary.summaryEn}
            </p>
            {bilingual && (
              <p className="font-editorial text-sm italic text-[var(--ink-secondary)]">
                {summary.summaryEn}
              </p>
            )}
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-5">
            <h2 className="text-sm font-bold text-[var(--ink-primary)]">
              연관 심화 단원으로 바로 연습하기
            </h2>
            <p className="mt-1 text-xs text-[var(--ink-muted)]">
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
                    className="pressable-subtle interactive-surface interactive-accent-border flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 p-4"
                  >
                    <div>
                      <div className="font-mono-code tnum text-[11px] font-semibold text-[var(--accent)]">
                        Unit {rel.id} {rel.hasDeepContent ? '· 심화 단원' : ''}
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-[var(--ink-primary)]">
                        {rel.titleKo}
                      </div>
                      <div className="font-editorial text-xs text-[var(--ink-secondary)]">
                        {rel.titleEn}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-1 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileTab('concept')}
              className={`pressable flex-1 rounded-lg py-2 text-xs font-bold ${
                mobileTab === 'concept'
                  ? 'studio-nav-active text-[var(--ink-primary)]'
                  : 'text-[var(--ink-secondary)]'
              }`}
            >
              개념 설명
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('practice')}
              className={`pressable flex-1 rounded-lg py-2 text-xs font-bold ${
                mobileTab === 'practice'
                  ? 'studio-nav-active text-[var(--ink-primary)]'
                  : 'text-[var(--ink-secondary)]'
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
              <div className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                {detail.sections.map((sec) => (
                  <section key={sec.code} className="p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <span className="font-editorial flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--accent-btn)] text-sm font-semibold text-white">
                        {sec.code}
                      </span>
                      <div>
                        <h2 className="text-base font-bold text-[var(--ink-primary)]">
                          {bilingual ? sec.titleKo : sec.titleEn}
                        </h2>
                        {bilingual && (
                          <p className="font-editorial text-[13px] italic text-[var(--ink-muted)]">
                            {sec.titleEn}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-[var(--ink-primary)]">
                      {bilingual ? sec.explanationKo : sec.explanationEn}
                    </p>
                    {bilingual && (
                      <p className="mt-1 text-xs leading-relaxed text-[var(--ink-secondary)]">
                        {sec.explanationEn}
                      </p>
                    )}

                    {sec.formula && (
                      <div className="font-mono-code mt-3.5 rounded-r-lg border-l-2 border-l-[var(--accent)] bg-[var(--bg-subtle)] px-3.5 py-2.5 text-xs font-medium text-[var(--ink-primary)]">
                        {sec.formula}
                      </div>
                    )}

                    <ul className="mt-4 space-y-2.5">
                      {sec.examples.map((ex, i) => (
                        <li
                          key={i}
                          className="border-l-2 border-[var(--border-strong)] py-0.5 pl-3.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-editorial text-[15.5px] leading-relaxed text-[var(--ink-primary)]">
                              {ex.en}
                            </span>
                            <SpeakButton text={ex.en} compact />
                          </div>
                          {bilingual && (
                            <p className="mt-0.5 text-xs text-[var(--ink-secondary)]">
                              {ex.ko}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>

              <section className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/70 px-5 py-3.5">
                  <h2 className="text-sm font-bold text-[var(--ink-primary)]">
                    {bilingual ? detail.comparisonTitleKo : detail.comparisonTitleEn}
                  </h2>
                </div>
                <div className="divide-y divide-[var(--border-subtle)]">
                  {detail.comparisons.map((row, idx) => (
                    <div key={idx} className="p-4 sm:p-5">
                      <div className="grid gap-3 sm:grid-cols-2 sm:divide-x sm:divide-[var(--border-subtle)]">
                        <div className="sm:pr-3">
                          <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--accent)]">
                            {row.leftLabel}
                          </div>
                          <div className="font-editorial mt-1 text-[15px] text-[var(--ink-primary)]">
                            {row.leftExample}
                          </div>
                        </div>
                        <div className="sm:pl-4">
                          <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--signal)]">
                            {row.rightLabel}
                          </div>
                          <div className="font-editorial mt-1 text-[15px] text-[var(--ink-primary)]">
                            {row.rightExample}
                          </div>
                        </div>
                      </div>
                      <p className="mt-2.5 border-t border-[var(--border-subtle)] pt-2 text-xs leading-relaxed text-[var(--ink-secondary)]">
                        {bilingual ? row.noteKo : row.noteEn}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/70 px-5 py-3.5 text-sm font-bold text-[var(--ink-primary)]">
                  <AlertCircle className="h-4 w-4 text-[var(--signal)]" />
                  <h2>자주 하는 실수</h2>
                </div>
                <div className="divide-y divide-[var(--border-subtle)]">
                  {detail.commonMistakes.map((m, idx) => (
                    <div key={idx} className="space-y-1.5 p-4 text-sm sm:p-5">
                      <div className="flex items-start gap-2 text-[var(--danger)]">
                        <X className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="font-editorial text-[15px] line-through">{m.wrong}</span>
                      </div>
                      <div className="flex items-start gap-2 font-semibold text-[var(--success)]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="font-editorial text-[15px]">{m.right}</span>
                      </div>
                      <p className="pt-1 text-xs leading-relaxed text-[var(--ink-secondary)]">
                        {bilingual ? m.explanationKo : m.explanationEn}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {summary.relatedUnits.length > 0 && (
                <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
                  <div className="text-xs font-semibold text-[var(--ink-muted)]">
                    연관 단원
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {summary.relatedUnits.map((relId) => {
                      const rel = getUnitSummary(relId);
                      return (
                        <Link
                          key={relId}
                          to={`/unit/${relId}`}
                          className="pressable interactive-surface interactive-accent-border rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-primary)]"
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
