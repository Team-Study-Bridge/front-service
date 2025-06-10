//utils/apiClient.ts
import axios from 'axios';
import { tokenManager } from './tokenManager';
import {GatewayURL} from "@/utils/baseURL.ts";
// import { toast } from 'react-toastify'; // UI 알림 라이브러리 쓸 경우

const API = axios.create({
    baseURL: GatewayURL.local,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 500000,
    withCredentials: true, // ✅ 쿠키 기반 리프레시 토큰 처리 지원
});

// 요청 인터셉터 - 액세스 토큰 헤더 설정
API.interceptors.request.use(
    (config) => {
        const token = tokenManager.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // FormData 요청일 경우 Content-Type 제거 → 브라우저가 자동 설정
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터 - 에러 처리 및 자동 로그아웃 등
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        console.error('🌐 API 오류 발생:', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
        });

        // 에러 메시지 사용자에게 표시하고 싶으면 toast 사용
        // toast.error(error.response?.data?.message || "에러가 발생했습니다");

        if (error.response?.status === 401) {
            tokenManager.clearTokens();
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default API;
