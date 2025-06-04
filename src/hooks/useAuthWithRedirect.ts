import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { RegisterRequest } from '@/types/auth';
import type { FormErrors } from '@/components/forms/RegistrationForm.types';
import { authAPI } from '@/api/auth';
import {getFcmToken} from "@/utils/firebase.ts";      // 푸시 토큰 등록 API

export const useAuthWithRedirect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const {
    login,
    forceLogin,
    register,
    logout,
    loginWithSocialMedia,
  } = useAuth();

  // ⭐️ 공통: FCM 토큰 발급 → 서버 등록
  const registerPushToken = async () => {
    try {
      const fcmToken = await getFcmToken();
      if (fcmToken) {
        await authAPI.registerPushToken({ fcmToken });
      }
    } catch (err) {
      // FCM 저장 실패는 서비스 영향 없이 무시
      console.warn('FCM 토큰 저장 실패:', err);
    }
  };

  // 🔥 로그인 후 FCM 등록
  const loginWithRedirect = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await login(email, password, () => navigate('/'));
      if (success) await registerPushToken();
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 강제 로그인 후 FCM 등록
  const forceLoginWithRedirect = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await forceLogin(email, password, () => navigate('/'));
      if (success) await registerPushToken();
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 회원가입 후 FCM 등록
  const registerWithRedirect = async (
      form: RegisterRequest,
      onMessage?: (field: keyof FormErrors, message: string) => void,
      setErrors?: React.Dispatch<React.SetStateAction<FormErrors>>
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await register(form, onMessage, setErrors);
      if (success) {
        navigate('/');
        await registerPushToken();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login: loginWithRedirect,
    forceLogin: forceLoginWithRedirect,
    register: registerWithRedirect,
    logout,
    loginWithSocialMedia,
    isLoading,
  };
};
