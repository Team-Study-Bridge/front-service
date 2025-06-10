import { useEffect, useState } from 'react';
import { paymentAPI } from '@/api/payment';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PurchaseFailure } from '@/types/payment';

const VerificationFailureList = () => {
  const [failures, setFailures] = useState<PurchaseFailure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentAPI.getFailedVerifications(0, 10);
      setFailures(res.data);
    } catch (e) {
      toast.error('검증 실패 목록 조회 실패');
      setError('검증 실패 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryVerification = async (purchaseId: number) => {
    try {
      const res = await paymentAPI.retryVerification(purchaseId);
      toast.success(res.data || '검증 재시도 완료');
      setFailures(prev => prev.filter(f => f.id !== purchaseId)); // optimistic update
    } catch (e: any) {
      const msg = e.response?.data?.message || '검증 재시도 실패';
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-8 korean-text">불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8 korean-text">{error}</div>;
  }

  if (failures.length === 0) {
    return <div className="text-center text-muted-foreground py-8 korean-text">검증 실패 내역이 없습니다.</div>;
  }

  return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border-b">ID</th>
            <th className="p-2 border-b">imp_uid</th>
            <th className="p-2 border-b">결제 금액</th>
            <th className="p-2 border-b">실패 사유</th>
            <th className="p-2 border-b">처리</th>
          </tr>
          </thead>
          <tbody>
          {failures.map(f => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="p-2 border-b">{f.id}</td>
                <td className="p-2 border-b">{f.impUid}</td>
                <td>{f.paidAmount ? f.paidAmount.toLocaleString() + '원' : '금액 없음'}</td>
                <td className="p-2 border-b text-muted-foreground">{f.reason}</td>
                <td className="p-2 border-b">
                  <Button size="sm" onClick={() => handleRetryVerification(f.id)}>
                    검증 재시도
                  </Button>
                </td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
};

export default VerificationFailureList;
