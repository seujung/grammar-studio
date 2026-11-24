# Grammar in Use Studio Implementation Plan

- Spec: `docs/superpowers/specs/2026-11-24-grammar-in-use-webapp-design.md`

## Tasks

1. **Step 1**: `.gitignore` (`reference/*.pdf`), Git 저장소 초기화, Vite + React + Tailwind v4 + Vitest 설정.
2. **Step 2**: `src/types/grammar.ts` 핵심 도메인 타입 정의.
3. **Step 3**: TDD로 순수 로직 엔진 구현 (`grader.ts`, `srs.ts`, `storage.ts`, `diagnostic.ts`, `tts.ts`).
4. **Step 4**: 16개 영역 / 145개 단원 커리큘럼, 16문항 진단 테스트, 32개 심화 단원 콘텐츠 작성 및 무결성 테스트.
5. **Step 5**: `AppContext`, `SpeakButton`, `Layout`, `BackupModal`, `ExerciseRunner` 구현.
6. **Step 6**: 5개 페이지(`DashboardPage`, `DiagnosticPage`, `CurriculumPage`, `UnitStudyPage`, `ReviewPage`)와 `App.tsx`, `main.tsx` 라우팅 연결.
7. **Step 7**: UI 통합 테스트, `.github/workflows/deploy.yml`, `README.md` 작성.
8. **Step 8**: 전체 타입 검사, 테스트, 프로덕션 빌드 및 코드 리뷰.
