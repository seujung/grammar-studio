# Grammar in Use Studio

*English Grammar in Use (3rd Ed.)*의 16개 문법 영역과 145개 단원 체계를 참고해 만든 정적 영문법 학습 웹 앱입니다.
저작권 보호를 위해 교재 원문 PDF는 포함하지 않으며, 모든 예문과 연습 문제는 자체 작성한 콘텐츠입니다.

## 주요 기능

- **145개 단원 커리큘럼과 32개 심화 단원**: 16개 영역의 전체 목차를 제공하고, 영역마다 핵심 2개 단원(총 32개)에 한·영 개념 설명(A~C), 비교표, 자주 하는 실수, 8문항 연습을 담았습니다.
- **Study Guide 진단 테스트**: 16개 영역 대표 문항을 풀어 취약 영역과 추천 학습 단원을 확인합니다.
- **4가지 연습 유형과 유연한 채점**: 객관식, 빈칸 채우기(단어 보기), 문장 변형, 대화 완성 유형을 지원합니다. 대소문자, 문장 끝 부호, 영어 축약형(`I'm` / `I am`, `isn't` / `is not`)을 모두 정답으로 인정합니다.
- **간격 반복 복습(SRS)**: 틀린 문항과 학습 문항을 SM-2 간격(1일 → 3일 → 7일 → 14일 → 30일)으로 예약해 **오늘의 복습**에서 다시 풉니다.
- **음성 읽기(TTS) 및 언어 전환**: 브라우저 Web Speech API로 예문과 정답 문장을 1.0x 또는 0.75x 속도로 듣습니다. 상단 버튼으로 한/영 병기와 영어 단독 모드를 전환합니다.
- **로컬 진도 파일 저장·불러오기**: 대시보드와 상단 바의 **진도 파일 저장 / 불러오기**로 내 PC의 JSON 파일에 학습 기록을 저장하고 언제든 다시 불러옵니다. Chrome·Edge에서는 연결한 파일에 자동 덮어쓰기를 지원하며, Safari·Firefox에서는 JSON 다운로드·업로드로 동작합니다. `localStorage`도 세션 안전 캐시로 함께 유지합니다.

## 로컬 실행 및 검증

```bash
npm install
npm run dev
```

타입 검사, 테스트, 프로덕션 빌드는 아래 명령으로 실행합니다.

```bash
npm run typecheck
npm test
npm run build
```

## 심화 단원 추가 방법

1. [src/data/syllabus.ts](src/data/syllabus.ts)의 `DEEP_UNIT_IDS`에 추가할 단원 번호를 등록합니다.
2. `src/data/units/group1.ts`~`group4.ts`(또는 새 모듈)에 `UnitDetail` 형식에 맞춰 개념 섹션 3개, 비교표, 자주 하는 실수, 연습 문제 8문항을 작성합니다.
3. `npm test`로 [contentIntegrity.test.ts](src/data/__tests__/contentIntegrity.test.ts) 무결성 검사를 통과하는지 확인합니다.

## GitHub Pages 배포 방법

1. GitHub에 새 저장소를 만들고 현재 `main` 브랜치를 푸시합니다. (`reference/*.pdf`는 `.gitignore`로 제외됩니다.)
2. GitHub 저장소의 **Settings → Pages**로 이동합니다.
3. **Build and deployment → Source**를 **GitHub Actions**로 선택합니다.
4. `main` 브랜치에 푸시할 때마다 [.github/workflows/deploy.yml](.github/workflows/deploy.yml)이 테스트와 빌드를 거쳐 자동으로 배포합니다.
