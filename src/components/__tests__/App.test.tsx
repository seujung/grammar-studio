import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../../App';
import { AppProvider } from '../../context/AppContext';
import { DEFAULT_PROGRESS, DEFAULT_SETTINGS, exportBackupJson, saveProgress } from '../../lib/storage';
import { toDateKey } from '../../lib/srs';

function renderAt(initialEntries: string[] = ['/']) {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <AppRoutes />
      </MemoryRouter>
    </AppProvider>,
  );
}

describe('Grammar in Use Studio UI integration', () => {
  it('renders the dashboard with all 16 grammar categories and navigation', () => {
    renderAt(['/']);

    expect(screen.getByText('Grammar in Use Studio')).toBeInTheDocument();
    expect(screen.getByText('16개 문법 영역 숙련도 맵')).toBeInTheDocument();
    expect(screen.getByText('현재와 과거 시제')).toBeInTheDocument();
    expect(screen.getByText('구동사')).toBeInTheDocument();
  });

  it('shows 145 units in curriculum and filters down to 32 deep units', async () => {
    const user = userEvent.setup();
    renderAt(['/curriculum']);

    expect(screen.getByText('표시 중: 145개 단원')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '심화 단원 32' }));
    expect(screen.getByText('표시 중: 32개 단원')).toBeInTheDocument();
  });

  it('opens Unit 1, toggles EN Only mode, and accepts contractions in fill-blank grading', async () => {
    const user = userEvent.setup();
    renderAt(['/unit/1']);

    expect(screen.getByText('현재진행형 (I am doing)')).toBeInTheDocument();

    // Toggle bilingual -> EN Only
    await user.click(screen.getByRole('button', { name: '해설 언어 전환' }));
    expect(screen.getByText('Actions happening right now')).toBeInTheDocument();

    // Toggle back to bilingual
    await user.click(screen.getByRole('button', { name: '해설 언어 전환' }));

    // Answer Q1 (multiple-choice) and Q2 (multiple-choice) to reach Q3 (fill-blank)
    await user.click(screen.getByRole('button', { name: /am tying/i }));
    await user.click(screen.getByRole('button', { name: '정답 확인' }));
    expect(screen.getByText('정답입니다!')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다음 문제' }));

    await user.click(screen.getByRole('button', { name: /is getting/i }));
    await user.click(screen.getByRole('button', { name: '정답 확인' }));
    await user.click(screen.getByRole('button', { name: '다음 문제' }));

    // Q3 is fill-blank expecting "am trying" / "I'm trying"; test contraction equivalence
    const input = screen.getByLabelText('정답 입력');
    await user.type(input, "I'm trying.");
    await user.click(screen.getByRole('button', { name: '정답 확인' }));
    expect(screen.getByText('정답입니다!')).toBeInTheDocument();
  });

  it('completes the 16-question diagnostic and recommends weak units', async () => {
    const user = userEvent.setup();
    renderAt(['/diagnostic']);

    await user.click(screen.getByRole('button', { name: /16문항 진단 시작하기/i }));

    for (let i = 0; i < 16; i++) {
      // Mark Q1 as unsure, answer the rest with option A
      if (i === 0) {
        await user.click(screen.getByRole('button', { name: /잘 모르겠어요/i }));
      } else {
        const optionButtons = screen
          .getAllByRole('button')
          .filter((btn) => within(btn).queryByText('A'));
        await user.click(optionButtons[0]);
      }
    }

    expect(screen.getByText('진단 테스트 결과 (Study Guide)')).toBeInTheDocument();
    expect(screen.getByText(/추천 학습 단원/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /학습 시작/i }).length).toBeGreaterThan(0);
  });

  it('reviews a due SRS card on ReviewPage and displays updated interval', async () => {
    const user = userEvent.setup();
    const pastDueIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    saveProgress({
      ...DEFAULT_PROGRESS,
      srsCards: {
        'u1-e1': {
          exerciseId: 'u1-e1',
          unitId: 1,
          step: 0,
          intervalDays: 1,
          easeFactor: 2.3,
          nextReviewAt: pastDueIso,
          lapses: 1,
          lastReviewedAt: pastDueIso,
        },
      },
    });

    renderAt(['/review']);

    expect(screen.getByText('오늘의 간격 반복 복습 (SRS)')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /am tying/i }));
    await user.click(screen.getByRole('button', { name: '정답 확인' }));

    expect(screen.getByText('정답입니다!')).toBeInTheDocument();
    expect(screen.getByText('3일 뒤 다시 복습하도록 예약했습니다.')).toBeInTheDocument();
  });

  it('loads progress from a local JSON file on Dashboard and updates UI', async () => {
    const user = userEvent.setup();
    renderAt(['/']);

    const todayKey = toDateKey(new Date());
    const backupText = exportBackupJson(
      {
        ...DEFAULT_PROGRESS,
        studyDates: [todayKey],
        dailyCompletedUnits: { [todayKey]: [1, 3] },
        unitProgress: {
          1: {
            unitId: 1,
            attemptedExerciseIds: ['u1-e1'],
            correctExerciseIds: ['u1-e1'],
            bestScore: 100,
            totalExercises: 8,
            completedAt: new Date().toISOString(),
            lastStudiedAt: new Date().toISOString(),
          },
        },
      },
      DEFAULT_SETTINGS,
    );

    const fileInput = screen.getByLabelText('진도 파일 불러오기');
    const file = new File([backupText], 'my-progress.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', {
      value: () => Promise.resolve(backupText),
    });

    await user.upload(fileInput, file);

    expect(await screen.findByText('연결된 파일: my-progress.json')).toBeInTheDocument();
    expect(screen.getByText('2 / 2 단원')).toBeInTheDocument();
    expect(screen.getByText('1일')).toBeInTheDocument();
  });

  it('marks unsaved changes after exercise attempt and clears them when saving progress file', async () => {
    const user = userEvent.setup();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    Object.defineProperty(URL, 'createObjectURL', { value: vi.fn().mockReturnValue('blob:test'), configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true });

    renderAt(['/unit/1']);

    await user.click(screen.getByRole('button', { name: /am tying/i }));
    await user.click(screen.getByRole('button', { name: '정답 확인' }));

    expect(screen.getByLabelText('저장되지 않은 변경 있음')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '진도 저장' }));
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText('저장되지 않은 변경 있음')).not.toBeInTheDocument();

    clickSpy.mockRestore();
  });
});
