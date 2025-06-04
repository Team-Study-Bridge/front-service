
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { paymentAPI } from '@/api/payment';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { PaymentItem } from '@/types/payment';

const PaymentHistory = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {

    const fetchPayments = async () => {
      try {
        const response = await paymentAPI.getPaymentHistory();
        setPayments(response.data || []);
      } catch (error) {
        console.error('Failed to fetch payment history:', error);
        toast.error('결제 내역을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [navigate]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ghibli-meadow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-ghibli-stone">결제 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8 text-ghibli-forest">결제 내역</h1>

          {payments.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-8 text-center">
              <p className="text-ghibli-stone text-lg">결제 내역이 없습니다.</p>
              <Button 
                onClick={() => navigate('/dev-courses')}
                className="mt-4 bg-ghibli-meadow hover:bg-ghibli-forest"
              >
                강의 둘러보기
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {payments.map((payment) => (
                <Card key={payment.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{payment.lectureName}</CardTitle>
                    <CardDescription>주문번호: {payment.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-ghibli-stone">결제금액:</span>
                        <span className="font-medium">{formatCurrency(payment.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ghibli-stone">결제일:</span>
                        <span>{formatDate(payment.paymentDate)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ghibli-stone">상태:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(payment.status)}`}>
                          {payment.status === 'COMPLETED' ? '결제완료' : 
                           payment.status === 'PENDING' ? '처리중' : '실패'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      onClick={() => navigate(`/lecture/${payment.lectureId}`)}
                      variant="outline" 
                      className="w-full"
                    >
                      강의 보기
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentHistory;
