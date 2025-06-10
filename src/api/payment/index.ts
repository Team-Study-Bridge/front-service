import API from '@/utils/apiClient';
import { PaymentRequest } from '@/types/payment';

export const paymentAPI = {
  // 결제 요청 (포트원에서 응답받은 결제 정보를 백엔드로 전송)
  savePayment: (paymentData: PaymentRequest) => {
    return API.post('/pay/save', paymentData);
  },

  // 결제 내역 조회 (본인 것만)
  getMyPurchases: () => {
    return API.get('/pay/read');
  },

  cancelPayment: (merchantUid: string) => {
    return API.post('/pay/cancel', { merchantUid });
  },

  // 환불 실패 내역 조회
  getFailedRefunds: (page = 0, size = 10) =>
      API.get(`/pay/admin/refund/fail?page=${page}&size=${size}`),

  // 결제 검증 실패 내역 조회
  getFailedVerifications: (page = 0, size = 10) =>
      API.get(`/pay/admin/verify/fail?page=${page}&size=${size}`),

  // 취소 실패 내역 조회
  getFailedCancels: (page = 0, size = 10) =>
      API.get(`/pay/admin/cancel/fail?page=${page}&size=${size}`),

  // 강제 환불 실행
  forceRefund: (failureId: number) =>
      API.post(`/pay/admin/force/refund/${failureId}`),

  // 결제 검증 재시도
  retryVerification: (purchaseId: number) =>
      API.post(`/pay/admin/retry/verify/${purchaseId}`),

  // 강제 취소 실행
  forceCancel: (purchaseId: number) =>
      API.post(`/pay/admin/force/cancel/${purchaseId}`)
};
