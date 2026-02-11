## FSD Public API 규칙

이 프로젝트는 Feature-Sliced Design(FSD)을 따릅니다.

### 레이어

- `src/shared`: 범용 유틸/공용 UI/공용 설정
- `src/entities`: 도메인 모델(타입, selector, 도메인 유틸)
- `src/features`: 사용자 가치 단위 기능(유스케이스)
- `src/widgets`: 여러 feature/entity/shared를 조합한 화면 구성 단위
- `src/pages`: 페이지 모듈(라우팅 엔트리에서 import)
- `src/app`: Expo Router 라우팅 엔트리 (가능하면 얇게 유지)

### 공개 API(= import 허용 경로)

- 레이어/슬라이스는 **반드시 루트 `index.ts`를 공개 API**로 둡니다.
- 다른 레이어에서 import할 때는 **공개 API 경로만 사용**합니다.

예)

- OK: `import { indexSchedulesByMonth } from '@/entities/schedule';`
- OK: `import { SomeButton } from '@/shared/ui';` (추후 `shared/ui/index.ts`가 생기면)
- NO: `import { indexSchedulesByMonth } from '@/entities/schedule/lib/indexSchedules';`

### 깊은 import 정책

- **슬라이스 내부 구현 파일**(`lib/*`, `model/*`, `ui/*`)은 슬라이스 내부에서만 import합니다.
- 외부로부터의 접근은 `index.ts`를 통해서만 합니다.

### 의존성 방향(권장)

`shared → entities → features → widgets → pages → app`

역방향 import는 금지합니다.

