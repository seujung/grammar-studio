import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Compass,
  FileDown,
  LayoutDashboard,
  Moon,
  RotateCw,
  Settings,
  Sun,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEEP_UNIT_IDS } from '../data/syllabus';
import { BackupModal } from './BackupModal';

function BookplateEmblem({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-lg bg-[var(--accent-btn)] text-white ${
        compact ? 'h-7 w-7' : 'h-9 w-9'
      }`}
    >
      <svg
        width={compact ? '14' : '16'}
        height={compact ? '14' : '16'}
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 4.25C7.6 3.25 5.45 2.9 3 3.25V14.25C5.45 13.9 7.6 14.25 9 15.25M9 4.25C10.4 3.25 12.55 2.9 15 3.25V14.25C12.55 13.9 10.4 14.25 9 15.25M9 4.25V15.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function getRouteSectionTitle(pathname: string): string {
  if (pathname === '/') return '대시보드';
  if (pathname.startsWith('/diagnostic')) return '진단 테스트';
  if (pathname.startsWith('/curriculum')) return '커리큘럼';
  if (pathname.startsWith('/review')) return '오늘의 복습';
  if (pathname.startsWith('/unit/')) {
    const id = pathname.replace('/unit/', '').split('/')[0];
    return id ? `Unit ${id}` : '단원 학습';
  }
  return '워크스페이스';
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { progress, settings, updateSettings, dueCards, fileSync, saveProgressFile } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const location = useLocation();

  const completedDeepCount = Array.from(DEEP_UNIT_IDS).filter(
    (id) => Boolean(progress.unitProgress[id]?.completedAt),
  ).length;
  const deepRatio = completedDeepCount / Math.max(1, DEEP_UNIT_IDS.size);

  const navItems = [
    { to: '/', label: '대시보드', icon: LayoutDashboard, end: true },
    { to: '/diagnostic', label: '진단 테스트', icon: Compass, end: false },
    { to: '/curriculum', label: '커리큘럼', icon: BookOpen, end: false },
    {
      to: '/review',
      label: '오늘의 복습',
      icon: RotateCw,
      badge: dueCards.length,
      end: false,
    },
  ];

  const sectionTitle = getRouteSectionTitle(location.pathname);

  return (
    <div className="flex min-h-screen bg-[var(--bg-shell)] text-[var(--ink-primary)] transition-[background-color,color] duration-150">
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-[252px] md:shrink-0 md:flex-col md:justify-between md:px-3.5 md:py-4">
        <div className="space-y-6">
          <NavLink
            to="/"
            className="pressable-subtle flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-[var(--ink-primary)]"
          >
            <BookplateEmblem />
            <div className="leading-tight">
              <div className="font-editorial text-[17px] font-semibold tracking-[-0.015em]">
                Grammar in Use Studio
              </div>
              <div className="text-[11px] font-medium text-[var(--ink-muted)]">
                145 Units · Self-Study
              </div>
            </div>
          </NavLink>

          <nav aria-label="주 메뉴" className="space-y-1">
            <div className="font-mono-code mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
              WORKSPACE
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `pressable relative flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-[13.5px] ${
                      isActive
                        ? 'studio-nav-active font-semibold text-[var(--ink-primary)]'
                        : 'interactive-surface font-medium text-[var(--ink-secondary)]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 ${
                            isActive ? 'text-[var(--accent)]' : 'text-[var(--ink-muted)]'
                          }`}
                        />
                        <span>{item.label}</span>
                      </span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="tnum rounded-full border border-[var(--signal-border)] bg-[var(--signal-soft)] px-1.5 py-0.5 text-[11px] font-semibold leading-none text-[var(--signal)]">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/75 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[var(--ink-secondary)]">심화 단원 진도</span>
              <span className="font-mono-code tnum font-semibold text-[var(--ink-primary)]">
                {completedDeepCount} / 32
              </span>
            </div>
            <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-[var(--bg-hover)]">
              <div
                className="progress-fill h-full w-full bg-[var(--accent)]"
                style={{ transform: `scaleX(${deepRatio})` }}
              />
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 border-t border-[var(--border-subtle)] pt-2 text-[11px] text-[var(--ink-muted)]">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  fileSync.hasUnsavedChanges
                    ? 'bg-[var(--signal)]'
                    : fileSync.fileName
                      ? 'bg-[var(--success)]'
                      : 'bg-[var(--ink-muted)]'
                }`}
              />
              <span className="truncate">
                {fileSync.fileName ?? '로컬 브라우저 저장'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:p-2.5 md:pl-0">
        <div className="studio-window flex flex-1 flex-col overflow-x-clip bg-[var(--bg-canvas)] md:rounded-2xl md:border md:border-[var(--border-subtle)]">
          <header className="sticky top-0 z-20 flex h-13 items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/92 px-4 backdrop-blur-md md:rounded-t-2xl md:px-7">
            <div className="flex items-center gap-2.5">
              <NavLink
                to="/"
                className="pressable-subtle flex items-center gap-2 text-[var(--ink-primary)] md:hidden"
              >
                <BookplateEmblem compact />
                <span className="font-editorial text-base font-semibold tracking-[-0.015em]">
                  GIU Studio
                </span>
              </NavLink>

              <div className="hidden items-center gap-2 text-xs md:flex">
                <span className="font-mono-code text-[11px] font-medium uppercase tracking-wider text-[var(--ink-muted)]">
                  Studio
                </span>
                <span className="text-[var(--border-strong)]">/</span>
                <span className="font-semibold text-[var(--ink-primary)]">{sectionTitle}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => void saveProgressFile()}
                aria-label="진도 저장"
                title={
                  fileSync.fileName
                    ? `연결된 파일(${fileSync.fileName})에 진도 저장`
                    : '진도 파일로 저장'
                }
                className="pressable interactive-surface interactive-border relative inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ink-primary)]"
              >
                <FileDown className="h-3.5 w-3.5 text-[var(--ink-secondary)]" />
                <span className="hidden sm:inline">진도 저장</span>
                {fileSync.hasUnsavedChanges && (
                  <span
                    aria-label="저장되지 않은 변경 있음"
                    className="h-2 w-2 rounded-full bg-[var(--signal)]"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  updateSettings({
                    languageMode: settings.languageMode === 'bilingual' ? 'en' : 'bilingual',
                  })
                }
                aria-label="해설 언어 전환"
                className="pressable interactive-surface interactive-border rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ink-primary)]"
              >
                {settings.languageMode === 'bilingual' ? '한/EN' : 'EN Only'}
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                aria-label={settings.darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
                className="pressable interactive-surface interactive-border rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 text-[var(--ink-secondary)]"
              >
                {settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                aria-label="설정 및 백업"
                className="pressable interactive-surface interactive-border rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 text-[var(--ink-secondary)]"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 md:px-7 md:pb-12 md:pt-7">
            {children}
          </main>
        </div>
      </div>

      <nav
        aria-label="모바일 하단 메뉴"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `pressable relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] ${
                    isActive
                      ? 'font-semibold text-[var(--accent)] before:absolute before:left-5 before:right-5 before:top-0 before:h-[2px] before:rounded-b-full before:bg-[var(--accent)]'
                      : 'font-medium text-[var(--ink-muted)]'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="tnum absolute right-4 top-1.5 rounded-full border border-[var(--signal-border)] bg-[var(--signal-soft)] px-1.5 text-[10px] font-semibold text-[var(--signal)]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {modalOpen && <BackupModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
