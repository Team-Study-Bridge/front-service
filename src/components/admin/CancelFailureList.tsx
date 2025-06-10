import { useEffect, useState } from 'react';
import { paymentAPI } from '@/api/payment';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CancelFailure } from '@/types/payment';

const CancelFailureList = () => {
  const [failures, setFailures] = useState<CancelFailure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentAPI.getFailedCancels(0, 10);
      setFailures(res.data);
    } catch (e) {
      toast.error('취소 실패 목록 조회 실패');
      setError('목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleForceCancel = async (purchaseId: number) => {
    try {
      const res = await paymentAPI.forceCancel(purchaseId);
      toast.success(res.data || '강제 취소 완료');
      setFailures(prev => prev.filter(f => f.purchaseId !== purchaseId)); // optimistic update
    } catch (e: any) {
      const msg = e.response?.data?.message || '강제 취소 실패';
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
    return <div className="text-center text-muted-foreground py-8 korean-text">취소 실패 내역이 없습니다.</div>;
  }

  return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border-b">Purchase ID</th>
            <th className="p-2 border-b">요청 시각</th>
            <th className="p-2 border-b">처리</th>
          </tr>
          </thead>
          <tbody>
          {failures.map(f => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="p-2 border-b">{f.purchaseId}</td>
                <td className="p-2 border-b">{new Date(f.createdAt).toLocaleString()}</td>
                <td className="p-2 border-b">
                  <Button size="sm" onClick={() => handleForceCancel(f.purchaseId)}>
                    강제 취소
                  </Button>
                </td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
};

export default CancelFailureList;
