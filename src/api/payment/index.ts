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
  }
};
