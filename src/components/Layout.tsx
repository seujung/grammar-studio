import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
import { BackupModal } from './BackupModal';

export function Layout({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings, dueCards, fileSync, saveProgressFile } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <NavLink
            to="/"
            className="flex items-center gap-2.5 text-slate-900 dark:text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 text-sm font-bold text-white dark:bg-blue-600">
              G
            </span>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight sm:text-base">
                Grammar in Use Studio
              </div>
              <div className="hidden text-[11px] text-slate-500 dark:text-slate-400 sm:block">
                145 Units · Self-Study &amp; Practice
              </div>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex" aria-label="주 메뉴">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-blue-900 text-white dark:bg-blue-600'
                        : 'text-slate-700 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

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
              className="relative inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">진도 저장</span>
              {fileSync.hasUnsavedChanges && (
                <span
                  aria-label="저장되지 않은 변경 있음"
                  className="h-2 w-2 rounded-full bg-amber-500"
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
              className="rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {settings.languageMode === 'bilingual' ? '한/EN' : 'EN Only'}
            </button>

            <button
              type="button"
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              aria-label={settings.darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
              className="rounded-lg border border-stone-200 bg-white p-2 text-slate-700 transition hover:bg-stone-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              aria-label="설정 및 백업"
              className="rounded-lg border border-stone-200 bg-white p-2 text-slate-700 transition hover:bg-stone-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-12">{children}</main>

      <nav
        aria-label="모바일 하단 메뉴"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:hidden"
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
                  `relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium ${
                    isActive
                      ? 'text-blue-900 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute right-4 top-1.5 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
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
