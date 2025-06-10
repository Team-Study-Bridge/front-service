
# MSA 기반 프론트엔드 아키텍처 (MSA-based Frontend Architecture)

이 문서는 Aigongbu 프론트엔드 서비스의 마이크로서비스 아키텍처(MSA) 구조와 중요한 폴더 구성을 설명합니다.

## 서비스 포트 구성 (Service Port Configuration)
각 마이크로서비스는 다른 포트에서 실행되며, 프론트엔드와 통합됩니다:

- Front-service: 8082 (메인 프론트엔드 애플리케이션)
- Edge-service 게이트웨이 (webflux): 9000 (API 게이트웨이)
- Auth-service: 9001 (인증 및 권한 관리)
- Payment-service (webflux): 9002 (결제 처리)
- Verification-service = dispatcher (function context): 9003 (이메일 확인 등 검증 서비스)
- Lecture-service: 9004 (강의 관리)
- Video-lecture-service: 9005 (비디오 콘텐츠 관리)
- AI-service: 9006 (AI 기능 서비스)

## 폴더 구조 설명 (Folder Structure)

```
src/
├── api/                  # API 서비스 정의 및 모듈화 (백엔드 서비스별로 분리)
│   ├── auth/             # Auth-Service 관련 API - 로그인, 회원가입, 토큰 관리
│   ├── payment/          # Payment-Service 관련 API - 결제 처리, 결제 내역 조회
│   ├── lecture/          # Lecture-Service 관련 API - 강의 목록, 상세 정보 조회
│   ├── verification/     # Verification-Service 관련 API - 이메일 인증, 휴대폰 인증
│   ├── video/            # Video-lecture-Service 관련 API - 비디오 스트리밍, 진도 관리
│   ├── ai/               # AI-Service 관련 API - AI 추천, 챗봇, 커리큘럼 생성
│   └── index.ts          # API 모듈들을 모아 export하는 진입점
│
├── components/           # 공통 UI 컴포넌트들
│   ├── ui/               # shadcn/ui 기반 기본 UI 컴포넌트 (버튼, 입력 필드 등)
│   ├── forms/            # 폼 관련 컴포넌트들 (로그인, 회원가입, 강의 업로드 등)
│   ├── navigation/       # 내비게이션 관련 컴포넌트 (헤더 링크, 모바일 메뉴 등)
│   ├── lectures/         # 강의 관련 컴포넌트 (강의 카드, 필터, 커리큘럼 등)
│   ├── payment/          # 결제 관련 컴포넌트 (결제 방법, 주문 요약 등)
│   ├── instructor/       # 강사 관련 컴포넌트 (강사 지원서, 강의 업로드 폼 등)
│   ├── company/          # 회사 소개 관련 컴포넌트 (비전, 철학, 특징 등)
│   ├── admin/            # 관리자 관련 컴포넌트 (강사 관리, 강의 관리 등)
│   ├── Header.tsx        # 사이트 헤더 컴포넌트
│   └── Footer.tsx        # 사이트 푸터 컴포넌트
│
├── contexts/             # React Context API를 활용한 전역 상태
│   └── AuthContext.tsx   # 인증 관련 컨텍스트 (로그인 상태, 사용자 정보 등)
│
├── hooks/                # 커스텀 훅 정의
│   ├── useAuthWithRedirect.ts        # 인증 관련 훅 (로그인, 로그아웃, 인증 상태 확인)
│   ├── useEmailVerification.ts # 이메일 인증 관련 훅
│   ├── use-mobile.tsx    # 모바일 화면 감지 훅
│   ├── use-toast.ts      # 토스트 알림 표시 훅
│   └── useAiCurriculum.ts # AI 커리큘럼 생성 훅
│
├── pages/                # 라우팅 단위로 분리된 페이지 컴포넌트들
│   ├── auth/             # 인증 관련 페이지 (로그인, 회원가입, 프로필)
│   ├── lectures/         # 강의 관련 페이지 (개발 강의, AI 강의, 상세 페이지)
│   ├── payment/          # 결제 관련 페이지 (결제, 결제 내역)
│   ├── instructor/       # 강사 관련 페이지 (강사 지원, 강의 업로드)
│   ├── admin/            # 관리자 관련 페이지
│   ├── Index.tsx         # 메인 페이지
│   ├── CompanyInfo.tsx   # 회사 소개 페이지
│   ├── Profile.tsx       # 사용자 프로필 페이지
│   └── NotFound.tsx      # 404 페이지
│
├── types/                # 타입 정의 파일들
│   ├── auth.ts           # 인증 관련 타입 (User, LoginRequest 등)
│   ├── lecture.ts        # 강의 관련 타입 (Course, Curriculum 등)
│   ├── payment.ts        # 결제 관련 타입 (PaymentMethod, Order 등)
│   ├── instructor.ts     # 강사 관련 타입 (InstructorProfile, Application 등)
│   └── admin.ts          # 관리자 관련 타입
│
├── utils/                # 공통 유틸 함수들
│   ├── apiClient.ts      # axios 인스턴스 설정, API 요청 관련 유틸
│   ├── tokenManager.ts   # JWT 토큰 관리 유틸리티
│   └── auth.ts           # 인증 관련 헬퍼 함수
│
├── App.tsx               # 루트 컴포넌트 (라우팅 설정 포함)
└── main.tsx              # ReactDOM 렌더링 진입점
```

## API 모듈 사용 예시 (API Module Usage Example)

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

## 토큰 관리 예시 (Token Management Example)

```typescript
import { tokenManager } from '@/utils/tokenManager';

// 토큰 저장
tokenManager.setToken('accessToken');

// 토큰 조회
const token = tokenManager.getToken();

// 토큰에서 사용자 정보 조회
const userInfo = tokenManager.getUserInfo();
```

## 전역 상태 접근 예시 (Global State Access Example)

```typescript
import { useAuthWithRedirect } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { , user, login, logout } = useAuthWithRedirect();
  
  // 인증 상태에 따른 UI 렌더링
  return isAuthenticated ? <AuthenticatedUI user={user} /> : <LoginForm onLogin={login} />;
};
```

## 이 구조의 장점 (Advantages of This Structure)

1. 백엔드 MSA 구조와 일관성 있는 프론트엔드 구조 - 각 백엔드 서비스와 대응되는 폴더 구조
2. 서비스별 관심사 분리로 코드 유지보수성 향상 - 각 기능의 코드가 명확하게 분리됨
3. API 호출 로직 중앙화로 백엔드 인터페이스 변경 시 영향도 최소화 - API 변경 시 한 곳만 수정하면 됨
4. 타입 정의를 통한 타입 안정성 확보 - TypeScript를 활용한 컴파일 타임 오류 검출
5. 재사용 가능한 컴포넌트와 훅으로 개발 효율성 향상 - DRY 원칙을 따르는 코드 구조
6. 페이지 단위의 라우팅으로 코드 탐색이 용이 - 각 URL에 해당하는 컴포넌트를 쉽게 찾을 수 있음
