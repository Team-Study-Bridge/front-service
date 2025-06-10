import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { UserCircle, Bell, Lock, BookOpen, Play } from 'lucide-react';
import { authAPI } from '@/api';
import { tokenManager } from '@/utils/tokenManager.ts';
import { paymentAPI } from '@/api/payment';


const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [activeTab, setActiveTab] = useState('account');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [purchases, setPurchases] = useState([]);

  // 최초 유저 정보 조회
  useEffect(() => {
    (async () => {
      try {
        const res = await authAPI.getUserInfo();
        if (res.data.success) {
          setUser(res.data);
          setNickname(res.data.nickname);
        } else {
          toast.error('로그인이 필요합니다.');
          navigate('/login');
        }
      } catch {
        toast.error('로그인이 필요합니다.');
        navigate('/login');
      }
    })();
  }, [navigate]);

  useEffect(() => {
  (async () => {
      try {
        const res = await paymentAPI.getMyPurchases();
        setPurchases(res.data);
     } catch (err) {
        toast.error('결제 내역을 불러오지 못했습니다.');
     }
    })();
  }, []);

  // 프로필 닉네임 업데이트
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) return toast.error('닉네임을 입력해주세요!');
    try {
      const res = await authAPI.updateNickname(nickname);
      if (res.data.success && res.data.accessToken) {
        tokenManager.setToken(res.data.accessToken);
        const refreshed = await authAPI.getUserInfo();
        setUser(refreshed.data);
        toast.success(res.data.message || '닉네임이 변경되었습니다!');
      } else {
        toast.error(res.data.message || '닉네임 변경에 실패했습니다.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  // 프로필 이미지 변경
  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) return toast.error('프로필 이미지는 최대 1MB까지만 업로드할 수 있습니다.');
    if (!['image/jpeg', 'image/png'].includes(file.type)) return toast.error('이미지는 JPG, PNG 형식만 가능합니다.');
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
      const res = await authAPI.updateProfileImage(formData);
      if (res.data.success && res.data.accessToken) {
        tokenManager.setToken(res.data.accessToken);
        const refreshed = await authAPI.getUserInfo();
        setUser(refreshed.data);
        toast.success(res.data.message || '이미지가 변경되었습니다!');
      } else {
        toast.error(res.data.message || '이미지 변경에 실패했습니다.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwords;
    if (newPassword !== confirmPassword) return toast.error('새 비밀번호가 일치하지 않습니다.');
    try {
      const res = await authAPI.updatePassword(currentPassword, newPassword);
      if (res.data.success) {
        toast.success(res.data.message || '비밀번호가 변경되었습니다.');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(res.data.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  // 로그아웃 후 로그인 페이지 이동
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-ghibli-meadow">로딩 중...</div>
        </div>
    );
  }

  const handleRefund = (merchantUid: string) => {
    toast.success('환불 요청이 접수되었습니다.');

    // 상태 변경
    setPurchases(prev =>
        prev.map(p =>
            p.merchantUid === merchantUid
                ? { ...p, status: 'REQUEST_REFUND' }
                : p
        )
    );

    // 로컬 스토리지에 merchantUid 저장
    const stored = JSON.parse(localStorage.getItem('refundRequests') || '[]');
    const updated = [...new Set([...stored, merchantUid])];
    localStorage.setItem('refundRequests', JSON.stringify(updated));
  };

  const isLocal = user.provider === 'LOCAL';

  return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-28 pb-16 container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-handwritten text-ghibli-forest mb-2">내 프로필</h1>
              <p className="text-ghibli-stone mb-8">계정 정보를 확인하고 관리하세요</p>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3">
                  <Card className="border-ghibli-meadow/30 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-3">
                        <label htmlFor="profile-upload" className="cursor-pointer">
                          <Avatar className="h-24 w-24 border-4 border-ghibli-meadow hover:opacity-80 transition">
                            {user.profileImage ? <AvatarImage src={user.profileImage} alt={user.nickname} /> : <AvatarFallback className="bg-ghibli-earth text-ghibli-forest text-lg">{user.nickname?.slice(0,2).toUpperCase()}</AvatarFallback>}
                          </Avatar>
                        </label>
                        <input id="profile-upload" type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
                      </div>
                      <p className="text-center text-sm text-ghibli-stone">프로필 이미지를 클릭하여 변경</p>
                      <CardTitle className="text-xl text-ghibli-forest">{user.nickname}</CardTitle>
                      {user.role === 'ADMIN' && <Button variant="outline" onClick={() => navigate('/admin')}>관리자 페이지</Button>}
                    </CardHeader>
                    <CardFooter>
                      <Button variant="outline" className="w-full text-rose-600 border-rose-200 hover:bg-rose-50" onClick={handleLogout}>로그아웃</Button>
                    </CardFooter>
                  </Card>
                </div>
                <div className="w-full md:w-2/3">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-6 bg-ghibli-cloud">
                      <TabsTrigger value="account">      <UserCircle className="h-4 w-4 mr-2"/> 계정</TabsTrigger>
                      {isLocal && <TabsTrigger value="security"><Lock className="h-4 w-4 mr-2"/> 보안</TabsTrigger>}
                      <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2"/> 알림</TabsTrigger>
                      <TabsTrigger value="courses"><BookOpen className="h-4 w-4 mr-2"/> 구매한 강의</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
                      <Card className="border-ghibli-meadow/30 bg-white/80 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-ghibli-forest">계정 정보</CardTitle><CardDescription>프로필 정보를 업데이트하세요</CardDescription></CardHeader>
                        <CardContent>
                          <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2"><Label htmlFor="nickname">닉네임</Label><Input id="nickname" value={nickname} onChange={e=>setNickname(e.target.value)} className="border-ghibli-meadow/50 focus:border-ghibli-forest"/></div>
                            <Button type="submit" className="mt-4 bg-ghibli-meadow hover:bg-ghibli-forest text-white">저장하기</Button>
                          </form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    {isLocal && <TabsContent value="security">
                      <Card className="border-ghibli-meadow/30 bg-white/80 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-ghibli-forest">보안</CardTitle><CardDescription>비밀번호 변경</CardDescription></CardHeader>
                        <CardContent>
                          <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2"><Label htmlFor="current-password">현재 비밀번호</Label><Input id="current-password" type="password" value={passwords.currentPassword} onChange={e=>setPasswords({...passwords,currentPassword:e.target.value})} className="border-ghibli-meadow/50 focus:border-ghibli-forest"/></div>
                            <div className="space-y-2"><Label htmlFor="new-password">새 비밀번호</Label><Input id="new-password" type="password" value={passwords.newPassword} onChange={e=>setPasswords({...passwords,newPassword:e.target.value})} className="border-ghibli-meadow/50 focus:border-ghibli-forest"/></div>
                            <div className="space-y-2"><Label htmlFor="confirm-password">새 비밀번호 확인</Label><Input id="confirm-password" type="password" value={passwords.confirmPassword} onChange={e=>setPasswords({...passwords,confirmPassword:e.target.value})} className="border-ghibli-meadow/50 focus:border-ghibli-forest"/></div>
                            <Button type="submit" className="mt-4 bg-ghibli-meadow hover:bg-ghibli-forest text-white">비밀번호 변경</Button>
                          </form>
                        </CardContent>
                      </Card>
                    </TabsContent>}
                    <TabsContent value="notifications">
                      <Card className="border-ghibli-meadow/30 bg-white/80 backdrop-blur-sm"><CardHeader><CardTitle>알림 설정</CardTitle><CardDescription>이메일 및 푸시 알림 관리</CardDescription></CardHeader><CardContent><div className="space-y-6">{["마케팅 이메일","보안 알림","앱 알림"].map((label,idx)=>(<div key={idx} className="flex items-center justify-between"><div><h4 className="text-sm font-medium">{label}</h4><p className="text-xs text-ghibli-stone">알림 설명 텍스트</p></div><div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer"/><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ghibli-meadow"></div></div></div>))}</div><Button className="mt-6 bg-ghibli-meadow hover:bg-ghibli-forest text-white">설정 저장</Button></CardContent></Card>
                    </TabsContent>
                    <TabsContent value="courses">
  <Card className="...">
    <CardHeader>
      <CardTitle>구매한 강의</CardTitle>
      <CardDescription>결제 완료한 강의 목록과 진행 상황</CardDescription>
    </CardHeader>
    <CardContent>
      {purchases.length === 0 ? (
          <p className="text-sm text-gray-500">구매한 강의가 없습니다.</p>
      ) : (
          <div className="space-y-4">
            {purchases.map((course) => (
                <div key={course.merchantUid} className="border border-ghibli-meadow/20 rounded-lg overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4">
                      <img
                          src={`https://api.dicebear.com/7.x/shapes/svg?seed=${course.productId}`}
                          alt={course.productTitle}
                          className="h-40 md:h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-ghibli-forest">{course.productTitle}</h3>
                          <p className="text-sm text-ghibli-stone">{course.instructor}</p>
                        </div>
                        <Link to={`/course/${course.productId}`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50">
                            <Play className="h-3 w-3" /> 강의 보기
                          </Button>
                        </Link>
                      </div>

                      <div className="mt-4 text-sm text-ghibli-stone">
                        결제 상태: {course.status === 'REQUEST_REFUND' ? '환불 요청됨' : course.status}
                      </div>

                      {course.status === 'COMPLETED' && (
                          <div className="mt-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRefund(course.merchantUid)}
                            >
                              환불 요청
                            </Button>
                          </div>
                      )}

                      {course.status === 'REQUEST_REFUND' && (
                          <div className="mt-2 text-sm text-orange-500 font-semibold">
                            환불 승인 대기 중
                          </div>
                      )}
                    </div>
                  </div>
                </div>
            ))}
          </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default Profile;
