import {useEffect, useState} from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RefundFailureList from './RefundFailureList';
import CancelFailureList from './CancelFailureList';
import VerificationFailureList from './VerificationFailureList';
import RefundRequestList from "@/components/admin/RefundRequestList.tsx";
import {paymentAPI} from "@/api";

const PaymentManagement = () => {
  const [tab, setTab] = useState('request');
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    // 사용자 결제 내역 전체 조회
    paymentAPI.getMyPurchases?.().then(res => {
      setPurchases(res.data); // 전제 조건: getAllPurchases가 전체 내역 반환
    }).catch(() => {
      // 실패 시 토스트 띄워도 OK
    });
  }, []);

  return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold korean-text">결제 관리</h2>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="request" className="korean-text">환불 요청</TabsTrigger>
            <TabsTrigger value="verify" className="korean-text">검증 실패</TabsTrigger>
            <TabsTrigger value="refund" className="korean-text">환불 실패</TabsTrigger>
            <TabsTrigger value="cancel" className="korean-text">취소 실패</TabsTrigger>
          </TabsList>

          <TabsContent value="request">
            <RefundRequestList />
          </TabsContent>
          <TabsContent value="verify">
            <VerificationFailureList />
          </TabsContent>
          <TabsContent value="refund">
            <RefundFailureList />
          </TabsContent>
          <TabsContent value="cancel">
            <CancelFailureList />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default PaymentManagement;
