import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InstructorManagement from '@/components/admin/InstructorManagement';
import LectureManagement from '@/components/admin/LectureManagement';
import PaymentManagement from '@/components/admin/PaymentManagement';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CreditCard,
  Mail,
  Calendar,
  Clock,
  Send
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {authAPI} from "@/api";
import { notiAPI, RecipientType } from '@/api/noti';

const Admin: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('instructors');
  const [recipientType, setRecipientType] = useState('all');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [notificationTime, setNotificationTime] = useState('12:00');
  const [notificationSubject, setNotificationSubject] = useState('');
  const [notificationContent, setNotificationContent] = useState('');
  const [isScheduleActive, setIsScheduleActive] = useState(false);

  const toggleScheduleActivation = () => {
    setIsScheduleActive((prev) => !prev);
  };

  useEffect(() => {
    // URL 경로에서 현재 탭 확인
    const path = location.pathname.split('/').pop();
    if (path === 'lectures') {
      setActiveTab('lectures');
    } else if (path === 'payments') {
      setActiveTab('payments');
    } else if (path === 'messages') {
      setActiveTab('messages');
    } else {
      setActiveTab('instructors');
    }
  }, [location]);

  // 관리자 권한 체크
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await authAPI.getUserRole();
        const role = response.data?.role;

        if (role !== 'ADMIN') {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('권한 확인 중 오류 발생:', error);
        toast.error('권한 확인 실패. 다시 로그인해주세요.');
        navigate('/login', { replace: true });
      }
    };

    checkAdmin();
  }, [navigate]);

  const convertRecipientType = (value: string): RecipientType => {
    switch (value) {
      case 'all':
        return 'ALL';
      case 'instructors':
        return 'INSTRUCTORS';
      case 'students':
        return 'STUDENTS';
      default:
        throw new Error('잘못된 수신자 타입입니다.');
    }
  };


  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    const recipient = convertRecipientType(recipientType);

    try {
      if (isScheduleActive && selectedDate && notificationTime) {
        const scheduleTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${notificationTime}:00`).toISOString();
        await notiAPI.sendScheduledEmail({
          recipientType: recipient,
          subject: emailSubject,
          content: emailContent,
          scheduleTime,
        });
        toast.success("이메일 예약 전송 완료!");
      } else {
        await notiAPI.sendEmail({
          recipientType: recipient,
          subject: emailSubject,
          content: emailContent,
        });
        toast.success("이메일 전송 완료!");
      }

      // Reset form
      setEmailSubject('');
      setEmailContent('');
    } catch (err) {
      console.error(err);
      toast.error("이메일 전송에 실패했습니다.");
    }
  };


  const handleSendPush = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    const recipient = convertRecipientType(recipientType);

    try {
      if (isScheduleActive && selectedDate && notificationTime) {
        const scheduleTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${notificationTime}:00`).toISOString();
        await notiAPI.sendScheduledPushNotification({
          recipientType: recipient,
          title: emailSubject,
          body: emailContent,
          scheduleTime,
        });
        toast.success("푸시 예약 전송 완료!");
      } else {
        await notiAPI.sendPushNotification({
          recipientType: recipient,
          title: emailSubject,
          body: emailContent,
        });
        toast.success("푸시 전송 완료!");
      }

      // Reset form
      setEmailSubject('');
      setEmailContent('');
    } catch (err) {
      console.error(err);
      toast.error("푸시 전송에 실패했습니다.");
    }
  };


  const handleScheduleNotification = () => {
    // This would connect to an API in a real application
    if (!notificationSubject.trim() || !notificationContent.trim() || !selectedDate || !notificationTime) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    const formattedDate = selectedDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    toast.success(`${formattedDate} ${notificationTime}에 알림이 예약되었습니다.`);

    // Reset form
    setNotificationSubject('');
    setNotificationContent('');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full p-6">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>접근 권한 없음</AlertTitle>
              <AlertDescription>
                관리자 계정으로 로그인해야 이 페이지에 접근할 수 있습니다.
                <div className="mt-4 space-y-2">
                  <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                    홈으로 돌아가기
                  </Button>
                  <Button onClick={() => navigate('/login')} className="w-full">
                    관리자 로그인하기
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-ghibli-midnight mb-8" lang="ko">
            관리자 페이지
          </h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-12 bg-white/20 backdrop-blur-sm border-white/20">
              <TabsTrigger
                value="instructors"
                className="flex-1 h-full data-[state=active]:bg-white/50"
                asChild
              >
                <Link to="/admin">강사 관리</Link>
              </TabsTrigger>
              <TabsTrigger
                value="lectures"
                className="flex-1 h-full data-[state=active]:bg-white/50"
                asChild
              >
                <Link to="/admin/lectures">강의 관리</Link>
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="flex-1 h-full data-[state=active]:bg-white/50"
                asChild
              >
                <Link to="/admin/payments">결제 관리</Link>
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="flex-1 h-full data-[state=active]:bg-white/50"
                asChild
              >
                <Link to="/admin/messages">메시지 발송</Link>
              </TabsTrigger>
            </TabsList>

            <Routes>
              <Route path="/" element={<Navigate to="instructors" replace />} />
              <Route path="instructors" element={<InstructorManagement />} />
              <Route path="lectures" element={<LectureManagement />} />
              <Route path="payments" element={<PaymentManagement />} />
              <Route path="messages" element={
                <div className="grid gap-6 md:grid-cols-2">
                  {/* 왼쪽: 메시지 작성 + 모든 버튼 */}
                  <Card className="bg-white/50 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        메시지 작성
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* 수신자 선택 */}
                        <div className="space-y-2">
                          <Label htmlFor="recipient">수신자 선택</Label>
                          <Select value={recipientType} onValueChange={setRecipientType}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="수신자 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">모든 사용자</SelectItem>
                              <SelectItem value="instructors">강사</SelectItem>
                              <SelectItem value="students">학생</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* 제목 */}
                        <div className="space-y-2">
                          <Label htmlFor="subject">제목</Label>
                          <Input
                              id="subject"
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                              placeholder="제목 입력"
                          />
                        </div>

                        {/* 내용 */}
                        <div className="space-y-2">
                          <Label htmlFor="content">내용</Label>
                          <Textarea
                              id="content"
                              value={emailContent}
                              onChange={(e) => setEmailContent(e.target.value)}
                              placeholder="메시지 내용 입력"
                              rows={5}
                          />
                        </div>

                        {/* 정사각형 버튼들 (모두 왼쪽에) */}
                        <div className="flex gap-4 justify-between pt-2">
                          <Button
                              className="w-48 h-16 bg-blue-500 hover:bg-blue-600 text-white text-sm"
                              onClick={handleSendEmail}
                          >
                            이메일 보내기
                          </Button>
                          <Button
                              className="w-48 h-16 bg-green-500 hover:bg-green-600 text-white text-sm"
                              onClick={handleSendPush}
                          >
                            푸시알람 보내기
                          </Button>
                          <Button
                              className={`w-16 h-16 ${isScheduleActive ? 'bg-orange-500' : 'bg-gray-400'} text-white text-[11px] leading-4 flex items-center justify-center`}
                              onClick={toggleScheduleActivation}
                              style={{ whiteSpace: 'pre-line' }} // 개행 문자 적용
                          >
                            {isScheduleActive ? '예약\n활성' : '예약\n비활성'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 오른쪽: 예약 설정 (버튼 없음) */}
                  <Card className="bg-white/50 backdrop-blur-sm border-white/20 relative">
                    {!isScheduleActive && (
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm z-10 rounded-xl" />
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        예약 설정
                      </CardTitle>
                    </CardHeader>
                    <CardContent className={`${!isScheduleActive ? 'pointer-events-none select-none' : ''}`}>
                      <div className="space-y-4">
                        {/* 날짜 선택 */}
                        <div className="space-y-2">
                          <Label>날짜 선택</Label>
                          <div className="border rounded-md p-1">
                            <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="mx-auto"
                            />
                          </div>
                        </div>

                        {/* 시간 선택 */}
                        <div className="space-y-2">
                          <Label htmlFor="time">시간 선택</Label>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="time"
                                type="time"
                                value={notificationTime}
                                onChange={(e) => setNotificationTime(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              } />


            </Routes>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
