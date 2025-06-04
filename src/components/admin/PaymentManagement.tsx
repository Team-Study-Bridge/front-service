import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, Eye, Check, X, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { authAPI } from '@/api/auth';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 환불 요청 타입 정의
type RefundRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type RefundRequestType = 'DIRECT' | 'SYSTEM_ERROR';

interface RefundRequest {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userProfileImage?: string;
  lectureId: number;
  lectureName: string;
  amount: number;
  requestType: RefundRequestType;
  requestReason: string;
  requestDate: string;
  status: RefundRequestStatus;
}

interface RefundDetailResponse {
  success: boolean;
  message?: string;
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userProfileImage?: string;
  lectureId: number;
  lectureName: string;
  amount: number;
  requestType: RefundRequestType;
  requestReason: string;
  requestDate: string;
  status: RefundRequestStatus;
}

// 임시 데이터 (API 연동 전 테스트용)
const mockRefundRequests: RefundRequest[] = [
  {
    id: 1,
    userId: 101,
    userName: '김환불',
    userEmail: 'refund1@example.com',
    userProfileImage: '',
    lectureId: 201,
    lectureName: '자바스크립트 기초',
    amount: 50000,
    requestType: 'DIRECT',
    requestReason: '강의 내용이 기대와 달라서 환불 요청합니다.',
    requestDate: '2025-06-02T10:30:00',
    status: 'PENDING'
  },
  {
    id: 2,
    userId: 102,
    userName: '이취소',
    userEmail: 'cancel2@example.com',
    userProfileImage: '',
    lectureId: 202,
    lectureName: '리액트 마스터',
    amount: 75000,
    requestType: 'SYSTEM_ERROR',
    requestReason: '결제 과정에서 시스템 오류가 발생했습니다.',
    requestDate: '2025-06-01T15:45:00',
    status: 'PENDING'
  },
  {
    id: 3,
    userId: 103,
    userName: '박환불',
    userEmail: 'refund3@example.com',
    userProfileImage: '',
    lectureId: 203,
    lectureName: '파이썬 데이터 분석',
    amount: 65000,
    requestType: 'DIRECT',
    requestReason: '개인 사정으로 수강이 어려워졌습니다.',
    requestDate: '2025-06-02T09:15:00',
    status: 'PENDING'
  },
];

const PaymentManagement: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>(mockRefundRequests);
  const [selectedRequest, setSelectedRequest] = useState<RefundDetailResponse | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState<boolean>(true);
  const navigate = useNavigate();

  // 관리자 권한 확인
  useEffect(() => {
    (async () => {
      try {
        const res = await authAPI.getUserRole();
        if (res.data?.role !== 'ADMIN') {
          toast.error('관리자 권한이 필요합니다.');
          navigate('/', { replace: true });
        }
      } catch {
        toast.error('권한 확인 중 오류가 발생했습니다.');
        navigate('/', { replace: true });
      } finally {
        setIsCheckingRole(false);
      }
    })();
  }, [navigate]);

  // 환불 요청 목록 조회 (실제 API 연동 시 사용)
  const fetchRefundRequests = async () => {
    try {
      // 실제 API 연동 시 아래 주석 해제
      // const res = await paymentAPI.getRefundRequests(
      //     1,
      //     30,
      //     filter === 'all' ? undefined : filter,
      // );
      // const data = res.data;
      // if (data.success) {
      //   setRefundRequests(data.refundRequests);
      // } else {
      //   toast.error(data.message || '환불 요청 목록 조회에 실패했습니다.');
      // }

      // 임시 데이터 필터링 (API 연동 전)
      if (filter === 'all') {
        setRefundRequests(mockRefundRequests);
      } else {
        const filteredRequests = mockRefundRequests.filter(
          request => request.requestType === (filter === 'direct' ? 'DIRECT' : 'SYSTEM_ERROR')
        );
        setRefundRequests(filteredRequests);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || '서버 오류로 환불 요청 목록을 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    if (!isCheckingRole) fetchRefundRequests();
  }, [filter, isCheckingRole]);

  // 환불 상태 변경
  const handleStatusChange = async (id: number, approve: boolean) => {
    try {
      // 실제 API 연동 시 아래 주석 해제
      // const res = await paymentAPI.updateRefundStatus(id, approve);
      // if (res.data.success) {
      //   toast.success(res.data.message);
      //   fetchRefundRequests();
      // } else {
      //   toast.error(res.data.message || '상태 변경 실패');
      // }

      // 임시 데이터 업데이트 (API 연동 전)
      setRefundRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? {...request, status: approve ? 'APPROVED' : 'REJECTED'} 
            : request
        )
      );
      toast.success(approve ? '환불 요청이 승인되었습니다.' : '환불 요청이 거절되었습니다.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || '서버 오류로 상태 변경 실패');
    }
  };

  // 상세 조회
  const handleViewDetail = async (id: number) => {
    try {
      // 실제 API 연동 시 아래 주석 해제
      // const res = await paymentAPI.getRefundDetail(id);
      // const data = res.data as RefundDetailResponse;
      // if (data.success) {
      //   setSelectedRequest(data);
      // } else {
      //   toast.error(data.message || '상세 조회 실패');
      // }

      // 임시 데이터 사용 (API 연동 전)
      const request = mockRefundRequests.find(r => r.id === id);
      if (request) {
        setSelectedRequest({
          success: true,
          ...request
        });
      } else {
        toast.error('환불 요청 정보를 찾을 수 없습니다.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || '서버 오류로 상세 조회 실패');
    }
  };

  // 상태 배지
  const getStatusBadge = (status: RefundRequestStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-500 korean-text">승인됨</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500 korean-text">거절됨</Badge>;
      default:
        return <Badge className="bg-amber-500 korean-text">대기중</Badge>;
    }
  };

  // 요청 유형 배지
  const getRequestTypeBadge = (type: RefundRequestType) => {
    switch (type) {
      case 'DIRECT':
        return <Badge className="bg-blue-500 korean-text">직접요청</Badge>;
      case 'SYSTEM_ERROR':
        return <Badge className="bg-purple-500 korean-text">시스템 장애</Badge>;
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
    } catch (e) {
      return dateString;
    }
  };

  if (isCheckingRole) return null;

  return (
    <div className="space-y-6">
      {/* 헤더 & 검색 영역 */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="이름 또는 강의명 검색..."
              className="pl-8 korean-text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 탭 영역 */}
      <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
        <TabsList className="korean-text">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="direct">직접요청</TabsTrigger>
          <TabsTrigger value="system">시스템 장애</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {/* 카드 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {refundRequests
              .filter(
                (request) =>
                  request.userName.includes(searchTerm) ||
                  request.lectureName.includes(searchTerm)
              )
              .map((request) => (
                <Card key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-4 bg-muted/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={request.userProfileImage} alt={request.userName} />
                              <AvatarFallback>{request.userName.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium korean-text">{request.userName}</div>
                              <div className="text-xs text-muted-foreground">{request.userEmail}</div>
                            </div>
                          </div>
                          <div className="text-sm font-medium korean-text">{request.lectureName}</div>
                          <div className="text-sm korean-text">{request.amount.toLocaleString()}원</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(request.status)}
                          {getRequestTypeBadge(request.requestType)}
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(request.requestDate)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 korean-text"
                          onClick={() => handleViewDetail(request.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" /> 상세보기
                        </Button>
                        {request.status === 'PENDING' && (
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 korean-text"
                            onClick={() => handleStatusChange(request.id, true)}
                          >
                            <Check className="h-3 w-3 mr-1" /> 취소처리
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {refundRequests.length === 0 && (
              <div className="text-center py-12 korean-text col-span-full">
                환불 요청이 없습니다
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* 상세 다이얼로그 */}
      {selectedRequest && (
        <Dialog open onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-3xl korean-text">
            <DialogHeader>
              <DialogTitle>환불 요청 상세정보</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage
                    src={selectedRequest.userProfileImage}
                    alt={selectedRequest.userName}
                  />
                  <AvatarFallback>
                    {selectedRequest.userName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold korean-text">
                  {selectedRequest.userName}
                </h3>
                <Badge variant="outline" className="mt-2 korean-text">
                  {selectedRequest.lectureName}
                </Badge>
                <div className="mt-4 flex flex-col gap-2 items-center">
                  {getStatusBadge(selectedRequest.status)}
                  {getRequestTypeBadge(selectedRequest.requestType)}
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h4 className="font-semibold korean-text">환불 금액</h4>
                  <p className="text-sm text-muted-foreground korean-text">
                    {selectedRequest.amount.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold korean-text">환불 사유</h4>
                  <p className="text-sm text-muted-foreground korean-text">
                    {selectedRequest.requestReason || '사유가 없습니다.'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold korean-text">요청 일시</h4>
                  <p className="text-sm text-muted-foreground korean-text">
                    {formatDate(selectedRequest.requestDate)}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              {selectedRequest.status === 'PENDING' ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleStatusChange(selectedRequest.id, true);
                      setSelectedRequest(null);
                    }}
                  >
                    <Check className="h-4 w-4" /> 환불 승인
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleStatusChange(selectedRequest.id, false);
                      setSelectedRequest(null);
                    }}
                  >
                    <X className="h-4 w-4" /> 환불 거절
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setSelectedRequest(null)}
                >
                  닫기
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PaymentManagement;
