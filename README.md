# Team-Study-Bridge 프론트 서비스

## 프로젝트 소개

이 프로젝트는 "Team-Study-Bridge"의 프론트엔드 서비스로, 온라인 교육 플랫폼 "Aigongbu(AI 공부)"를 위한 웹 애플리케이션입니다. 개발 및 AI 관련 강의를 제공하는 플랫폼으로, 최신 웹 기술을 활용하여 구현되었습니다.

## 기술 스택

이 프로젝트는 다음과 같은 주요 기술을 사용합니다:

- **프레임워크**: React, TypeScript, Vite
- **UI 라이브러리**: shadcn-ui, Tailwind CSS, Radix UI
- **상태 관리**: React Context API, React Query
- **라우팅**: React Router
- **폼 관리**: React Hook Form, Zod
- **에디터**: Toast UI Editor
- **기타**: Axios, date-fns, framer-motion, three.js

## 프로젝트 구조

프로젝트는 마이크로서비스 아키텍처(MSA)를 기반으로 구성되어 있으며, 다음과 같은 주요 폴더 구조를 가지고 있습니다:

```
src/
├── api/                  # API 서비스 정의 및 모듈화 (백엔드 서비스별로 분리)
├── components/           # 공통 UI 컴포넌트들
├── contexts/             # React Context API를 활용한 전역 상태
├── hooks/                # 커스텀 훅 정의
├── pages/                # 라우팅 단위로 분리된 페이지 컴포넌트들
├── types/                # 타입 정의 파일들
├── utils/                # 공통 유틸 함수들
├── App.tsx               # 루트 컴포넌트 (라우팅 설정 포함)
└── main.tsx              # ReactDOM 렌더링 진입점
```

## 서비스 구성

프로젝트는 다음과 같은 마이크로서비스와 연동됩니다:

- **Front-service**: 8082 (메인 프론트엔드 애플리케이션)
- **Edge-service 게이트웨이**: 9000 (API 게이트웨이)
- **Auth-service**: 9001 (인증 및 권한 관리)
- **Payment-service**: 9002 (결제 처리)
- **Verification-service**: 9003 (이메일 확인 등 검증 서비스)
- **Lecture-service**: 9004 (강의 관리)
- **Video-lecture-service**: 9005 (비디오 콘텐츠 관리)
- **AI-service**: 9006 (AI 기능 서비스)

## 주요 기능

프로젝트는 다음과 같은 주요 기능을 제공합니다:

1. **사용자 인증**: 로그인, 회원가입, 소셜 로그인(OAuth)
2. **강의 탐색**: 개발 강의, AI 강의, 인기 강의 목록 제공
3. **강의 상세 정보**: 강의 상세 페이지, 커리큘럼, 강사 정보
4. **결제 시스템**: 강의 구매, 결제 내역 조회
5. **강사 기능**: 강사 지원, 강의 업로드
6. **관리자 기능**: 강의 및 사용자 관리
7. **검색 기능**: 강의 검색

## 설치 및 실행 방법

### 필수 요구 사항

- Node.js 및 npm 설치 필요

### 설치 단계

```bash
# 1. 저장소 클론
git clone <저장소 URL>

# 2. 프로젝트 디렉토리로 이동
cd Team-Study-Bridge/front-service

# 3. 의존성 설치
npm install

# 4. 개발 서버 실행
npm run dev
```

## 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 개발 환경 빌드
npm run build:dev

# 빌드 결과물 미리보기
npm run preview
```

## 프로젝트 구조 상세

### API 모듈

각 백엔드 서비스와 대응되는 API 모듈이 `/api` 폴더에 구성되어 있습니다:

- `/api/auth`: 인증 관련 API
- `/api/payment`: 결제 관련 API
- `/api/lecture`: 강의 관련 API
- `/api/verification`: 인증 관련 API
- `/api/video`: 비디오 관련 API
- `/api/ai`: AI 관련 API

### 컴포넌트

재사용 가능한 UI 컴포넌트들이 `/components` 폴더에 구성되어 있습니다:

- `/components/ui`: 기본 UI 컴포넌트
- `/components/forms`: 폼 관련 컴포넌트
- `/components/navigation`: 내비게이션 관련 컴포넌트
- `/components/lectures`: 강의 관련 컴포넌트
- `/components/payment`: 결제 관련 컴포넌트

### 페이지

각 라우트에 해당하는 페이지 컴포넌트들이 `/pages` 폴더에 구성되어 있습니다:

- `/pages/auth`: 인증 관련 페이지
- `/pages/lectures`: 강의 관련 페이지
- `/pages/payment`: 결제 관련 페이지
- `/pages/instructor`: 강사 관련 페이지
- `/pages/admin`: 관리자 관련 페이지

## 개발자 가이드

### API 호출 예시

```typescript
import { authAPI } from '@/api/auth';

// 로그인
const login = async (email: string, password: string) => {
  try {
    const response = await authAPI.login(email, password);
    // 응답 처리
  } catch (error) {
    // 에러 처리
  }
};
```

### 컨텍스트 사용 예시

```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  
  // 인증 상태에 따른 UI 렌더링
  return isAuthenticated ? <AuthenticatedUI user={user} /> : <LoginForm onLogin={login} />;
};
```

## 아키텍처 장점

1. **백엔드 MSA 구조와 일관성**: 각 백엔드 서비스와 대응되는 폴더 구조로 일관성 유지
2. **관심사 분리**: 각 기능의 코드가 명확하게 분리되어 유지보수성 향상
3. **API 호출 로직 중앙화**: 백엔드 인터페이스 변경 시 영향도 최소화
4. **타입 안정성**: TypeScript를 활용한 컴파일 타임 오류 검출
5. **재사용 가능한 컴포넌트**: DRY 원칙을 따르는 코드 구조로 개발 효율성 향상
6. **페이지 단위 라우팅**: 코드 탐색이 용이하여 각 URL에 해당하는 컴포넌트를 쉽게 찾을 수 있음

## 기여 방법

1. 저장소를 포크합니다.
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`).
3. 변경 사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`).
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`).
5. Pull Request를 생성합니다.

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.
![diagram](https://github.com/user-attachments/assets/837cb442-2d66-4930-9a18-a79385902d19)
