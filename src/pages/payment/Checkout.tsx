import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import Header from '@/components/Header';
import {toast} from 'sonner';
import {useAuth} from '@/contexts/AuthContext';
import OrderSummary from './components/OrderSummary';
import CheckoutSummary from './components/CheckoutSummary';
import {usePayment} from './hooks/usePayment';
import {lectureAPI} from '@/api/lecture';
import {getEnv} from "@/utils/getEnv.ts";

const Checkout = () => {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const { user, updateUserFromToken } = useAuth();
  const [lecture, setLecture] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { isProcessing, setIsProcessing, processInicisPayment } = usePayment({
    lectureId: lectureId || ''
  });

  // 강의 상세 조회 + 로그인 상태 확인
  useEffect(() => {
    if (!user) {
      updateUserFromToken(); // 토큰에서 유저 정보 복구 시도
    }
  }, []);

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        if (!lectureId) throw new Error('강의 ID가 없습니다.');

        const res = await lectureAPI.getLectureDetail(lectureId);
        setLecture(res.data);
      } catch (err) {
        console.error(err);
        toast.error('강의 정보를 불러오지 못했습니다.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (!user) return;
    fetchLecture();
  }, [user, lectureId, navigate]);

  // PortOne 스크립트 로딩
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.iamport.kr/v1/iamport.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const { IMP } = window as any;
      const impCode = getEnv("VITE_IMP_CODE");
      if (IMP && impCode) {
        IMP.init(impCode);
      } else {
        console.error('❌ PortOne SDK 로딩 실패 또는 IMP 코드 누락');
      }
    };

    return () => {
      document.body.querySelector('script[src*="iamport.js"]')?.remove();
    };
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error('이용약관에 동의해주세요.');
      return;
    }

    if (!lecture) {
      toast.error('강의 정보가 없습니다.');
      return;
    }


    setIsProcessing(true);
    processInicisPayment({
      ...lecture,
      price: Number(lecture.price),
    });
  };

  if (loading || !lecture) {
    return (
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto pt-32 px-4 pb-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ghibli-forest mx-auto"></div>
            <p className="mt-4 text-ghibli-forest">강의 정보를 불러오는 중...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto pt-24 px-4 pb-16">
          <h1 className="text-3xl font-handwritten text-center text-ghibli-forest mb-8">
            결제하기
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">
            <div className="lg:col-span-4">
              <OrderSummary lecture={lecture} />
            </div>
            <div className="lg:col-span-4">
              <CheckoutSummary
                  price={lecture.price.toLocaleString('ko-KR')}
                  agreedToTerms={agreedToTerms}
                  setAgreedToTerms={setAgreedToTerms}
                  isProcessing={isProcessing}
                  onCheckout={handleCheckout}
              />
            </div>
          </div>
        </main>
      </div>
  );
};

export default Checkout;
