import React, { useEffect, useState } from 'react';
import { paymentAPI } from '@/api/payment';
import { toast } from 'sonner';
import { RollbackFailure } from '@/types/payment';
import { Button } from '@/components/ui/button';

const RefundFailureList = () => {
  const [failures, setFailures] = useState<RollbackFailure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFailures = () => {
    setLoading(true);
    paymentAPI.getFailedRefunds(0, 10)
        .then((res) => {
          if (Array.isArray(res.data)) {
            setFailures(res.data);
          } else {
            throw new Error('올바르지 않은 응답 형식');
          }
        })
        .catch((err) => {
          console.error('🚨 환불 실패 목록 에러:', err);
          setError('환불 실패 목록을 불러올 수 없습니다.');
          toast.error('환불 실패 목록 불러오기 실패');
        })
        .finally(() => setLoading(false));
  };

  useEffect(fetchFailures, []);

  const handleForceRefund = (id: number) => {
    paymentAPI.forceRefund(id)
        .then((res) => {
          toast.success(res.data || '강제 환불 성공');
          setFailures(prev => prev.filter(f => f.id !== id)); // optimistic update
        })
        .catch((err) => {
          const msg = err.response?.data?.message || '강제 환불 실패';
          toast.error(msg);
          console.error('🚨 강제 환불 에러:', err);
        });
  };

  if (loading) {
    return <div className="text-center py-8 korean-text">불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8 korean-text">{error}</div>;
  }

  if (failures.length === 0) {
    return <div className="text-center text-muted-foreground py-8 korean-text">환불 실패 내역이 없습니다.</div>;
  }

  return (
      <div className="space-y-4">
        {failures.map((item) => (
            <div key={item.id} className="p-4 border rounded-md space-y-2">
              <div className="font-semibold">imp_uid: {item.impUid}</div>
              <div className="text-sm text-muted-foreground">금액: {item.amount.toLocaleString()}원</div>
              <div className="text-sm text-muted-foreground">요청일: {new Date(item.createdAt).toLocaleString()}</div>
              <Button size="sm" onClick={() => handleForceRefund(item.id)}>강제 환불</Button>
            </div>
        ))}
      </div>
  );
};

export default RefundFailureList;
