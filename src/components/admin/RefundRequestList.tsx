import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { paymentAPI } from '@/api';

const RefundRequestList = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        // 사용자 결제 내역 조회
        paymentAPI.getMyPurchases().then(res => {
            const refundList = JSON.parse(localStorage.getItem('refundRequests') || '[]');
            const filtered = res.data.filter(p => refundList.includes(p.merchantUid));
            setRequests(filtered);
        });
    }, []);

    const handleApprove = async (merchantUid: string) => {
        try {
            // 실제 환불 처리 요청
            await paymentAPI.cancelPayment(merchantUid);

            toast.success(`환불 승인 완료`);

            // UI 상태에서 제거
            setRequests(prev =>
                prev.filter(p => p.merchantUid !== merchantUid)
            );

            // 로컬스토리지에서도 제거
            const current = JSON.parse(localStorage.getItem('refundRequests') || '[]');
            localStorage.setItem('refundRequests', JSON.stringify(current.filter(m => m !== merchantUid)));
        } catch (err) {
            toast.error('환불 처리 실패');
            console.error('환불 승인 중 오류:', err);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-ghibli-forest">환불 요청 목록</h3>

            {requests.length === 0 ? (
                <p className="text-gray-500 text-sm">현재 환불 요청된 항목이 없습니다.</p>
            ) : (
                requests.map(r => (
                    <div key={r.merchantUid} className="border border-gray-300 p-4 rounded-md shadow-sm bg-white/60">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-medium">{r.productTitle}</div>
                                <div className="text-sm text-gray-600">강사: {r.instructor}</div>
                            </div>
                            <Button
                                onClick={() => handleApprove(r.merchantUid)}
                                className="bg-ghibli-meadow hover:bg-ghibli-forest text-white"
                            >
                                환불 승인
                            </Button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default RefundRequestList;
