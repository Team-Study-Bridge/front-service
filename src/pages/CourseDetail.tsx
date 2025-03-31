
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Heart, Share2, Clock, Users, Award, Bot, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import VideoLectureModal from '@/components/VideoLectureModal';

// Mock course data
const getCourseData = (id: string) => ({
  id,
  title: `웹 개발의 모든 것 ${id.includes('ai') ? '- AI 강의' : ''}`,
  instructor: id.includes('ai') ? `AI 튜터 ${id.slice(-1)}` : `김강사 ${id.slice(-1)}`,
  image: `https://api.dicebear.com/7.x/shapes/svg?seed=${id}`,
  instructorImage: `https://api.dicebear.com/7.x/avatars/svg?seed=${id}`,
  category: id.includes('ai') ? 'AI 기초' : '프론트엔드',
  rating: (4 + Math.random()).toFixed(1),
  reviewCount: Math.floor(Math.random() * 500) + 50,
  studentCount: Math.floor(Math.random() * 5000) + 500,
  price: (id.includes('ai') ? 22000 : 15000).toLocaleString(),
  bookmarks: Math.floor(Math.random() * 100),
  duration: `${Math.floor(Math.random() * 20) + 10}시간`,
  level: ['입문', '초급', '중급', '고급'][Math.floor(Math.random() * 4)],
  isAI: id.includes('ai'),
  isPurchased: Math.random() > 0.5, // Mock purchase status - would be from API in real app
  views: Math.floor(Math.random() * 10000) + 1000,
  description: `이 강의는 ${id.includes('ai') ? 'AI 기술' : '웹 개발'}의 기초부터 고급 기술까지 모든 것을 다루는 종합적인 과정입니다. 실습 위주의 학습을 통해 실무에 바로 적용할 수 있는 역량을 키울 수 있습니다.`,
  curriculum: [
    { title: '섹션 1: 기초 개념 이해', lectures: ['강의 1: 소개', '강의 2: 환경 설정', '강의 3: 기본 구조'] },
    { title: '섹션 2: 핵심 기술 학습', lectures: ['강의 4: 주요 기능', '강의 5: 응용 사례', '강의 6: 문제 해결'] },
    { title: '섹션 3: 프로젝트 실습', lectures: ['강의 7: 기획', '강의 8: 개발', '강의 9: 배포'] },
  ],
  reviews: [
    { name: '이학생', rating: 5, comment: '정말 좋은 강의입니다. 많은 것을 배울 수 있었습니다.' },
    { name: '김수강', rating: 4, comment: '실습 위주라 이해하기 쉬웠고, 실무에 바로 적용할 수 있었습니다.' },
    { name: '박개발', rating: 5, comment: '강사님의 설명이 정말 명확하고 이해하기 쉬웠습니다.' }
  ]
});

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('intro');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  useEffect(() => {
    if (courseId) {
      // In a real app, we would fetch course data from an API
      setCourse(getCourseData(courseId));
    }
  }, [courseId]);
  
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? '북마크가 해제되었습니다.' : '북마크에 추가되었습니다.');
  };
  
  const handleShare = () => {
    // In a real app, we would use the Web Share API or copy to clipboard
    toast.success('링크가 클립보드에 복사되었습니다.');
  };
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('결제를 진행하려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    navigate(`/checkout/${courseId}`);
  };
  
  const handleWatchLecture = () => {
    setShowVideoModal(true);
  };
  
  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto pt-32 px-4 pb-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ghibli-forest mx-auto"></div>
          <p className="mt-4 text-ghibli-forest">강의 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto pt-24 px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Course Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Instructor info */}
              <div className="flex items-center mb-6">
                <img 
                  src={course.instructorImage} 
                  alt={course.instructor}
                  className="h-16 w-16 rounded-full border-2 border-ghibli-meadow mr-4"
                />
                <div>
                  <h2 className="text-xl font-medium text-ghibli-midnight">{course.instructor}</h2>
                  <p className="text-ghibli-stone">{course.isAI ? 'AI 튜터' : '전문 강사'}</p>
                </div>
              </div>
              
              {/* Course thumbnail */}
              <div className="mb-8 relative rounded-xl overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <div className="inline-block px-3 py-1 bg-ghibli-meadow text-white rounded-full text-sm font-medium mb-2">
                    {course.category}
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-1">{course.title}</h1>
                  <div className="flex items-center text-white">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-medium mr-2">{course.rating}</span>
                    <span className="text-sm text-white/80">({course.reviewCount} 리뷰)</span>
                  </div>
                </div>
              </div>
              
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="w-full border-b border-ghibli-meadow/20 bg-transparent">
                  <TabsTrigger 
                    value="intro"
                    className={`text-base pb-2 ${activeTab === 'intro' ? 'border-b-2 border-ghibli-forest text-ghibli-forest' : 'text-ghibli-stone'}`}
                  >
                    클래스 소개
                  </TabsTrigger>
                  <TabsTrigger 
                    value="curriculum"
                    className={`text-base pb-2 ${activeTab === 'curriculum' ? 'border-b-2 border-ghibli-forest text-ghibli-forest' : 'text-ghibli-stone'}`}
                  >
                    커리큘럼
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reviews"
                    className={`text-base pb-2 ${activeTab === 'reviews' ? 'border-b-2 border-ghibli-forest text-ghibli-forest' : 'text-ghibli-stone'}`}
                  >
                    수강평
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="intro" className="pt-6">
                  <Card className="border border-ghibli-meadow/20">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-ghibli-forest mb-4">강의 소개</h3>
                      <p className="text-ghibli-midnight mb-6">{course.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-ghibli-forest" />
                          <div>
                            <p className="text-sm text-ghibli-stone">수강생</p>
                            <p className="font-medium text-ghibli-midnight">{course.studentCount.toLocaleString()}명</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-ghibli-forest" />
                          <div>
                            <p className="text-sm text-ghibli-stone">총 강의 시간</p>
                            <p className="font-medium text-ghibli-midnight">{course.duration}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Award className="h-5 w-5 text-ghibli-forest" />
                          <div>
                            <p className="text-sm text-ghibli-stone">난이도</p>
                            <p className="font-medium text-ghibli-midnight">{course.level}</p>
                          </div>
                        </div>
                        {course.isAI && (
                          <div className="flex items-center space-x-3">
                            <Bot className="h-5 w-5 text-ghibli-forest" />
                            <div>
                              <p className="font-medium text-ghibli-midnight">AI 도움받기 가능</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-ghibli-forest mb-4">이런 분들께 추천해요</h3>
                      <ul className="list-disc list-inside text-ghibli-midnight space-y-2 mb-6">
                        <li>{course.isAI ? 'AI 기술' : '웹 개발'}에 관심이 있는 초보자</li>
                        <li>실무에 적용할 수 있는 실전 기술을 배우고 싶은 분</li>
                        <li>체계적인 커리큘럼을 통해 학습하고 싶은 분</li>
                        <li>프로젝트 경험을 쌓고 싶은 분</li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="curriculum" className="pt-6">
                  <Card className="border border-ghibli-meadow/20">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-ghibli-forest mb-4">커리큘럼</h3>
                      <p className="text-ghibli-midnight mb-6">
                        총 {course.curriculum.reduce((acc: number, section: any) => acc + section.lectures.length, 0)}개의 강의로 구성되어 있습니다.
                      </p>
                      
                      <div className="space-y-6">
                        {course.curriculum.map((section: any, index: number) => (
                          <div key={index}>
                            <h4 className="text-lg font-medium text-ghibli-forest mb-3">{section.title}</h4>
                            <ul className="space-y-3">
                              {section.lectures.map((lecture: string, lectureIndex: number) => (
                                <li key={lectureIndex} className="p-3 bg-ghibli-cloud/50 rounded-lg flex justify-between items-center">
                                  <span>{lecture}</span>
                                  {!isAuthenticated && <span className="text-xs text-ghibli-stone">미리보기 불가</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="reviews" className="pt-6">
                  <Card className="border border-ghibli-meadow/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-ghibli-forest">수강평</h3>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="font-bold text-lg">{course.rating}</span>
                          <span className="text-ghibli-stone ml-2">({course.reviewCount} 리뷰)</span>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        {course.reviews.map((review: any, index: number) => (
                          <div key={index} className="border-b border-ghibli-meadow/10 pb-6 last:border-0">
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-medium">{review.name}</div>
                              <div className="flex">
                                {[...Array(5)].map((_, starIndex) => (
                                  <Star 
                                    key={starIndex}
                                    className={`h-4 w-4 ${starIndex < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-ghibli-midnight">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
          
          {/* Right: Checkout panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-28"
            >
              <Card className="border border-ghibli-meadow/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold text-ghibli-forest mb-4">{course.title}</h2>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex space-x-3">
                        <button onClick={handleShare} className="p-2 rounded-full border border-ghibli-earth/30 hover:bg-ghibli-cloud transition-colors">
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={toggleBookmark}
                          className="p-2 rounded-full border border-ghibli-earth/30 hover:bg-ghibli-cloud transition-colors"
                        >
                          <Heart className={`h-4 w-4 ${isBookmarked ? 'text-red-500 fill-red-500' : ''}`} />
                        </button>
                      </div>
                      <div className="text-sm text-ghibli-stone">
                        {course.bookmarks} 북마크
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-semibold mr-2">{course.rating}</span>
                        <span className="text-sm text-ghibli-stone">({course.reviewCount} 리뷰)</span>
                      </div>
                      <div className="text-3xl font-bold text-ghibli-midnight mb-2">
                        {course.isPurchased ? (
                          <span className="text-green-600">구매 완료</span>
                        ) : (
                          <>₩{course.price}</>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-ghibli-forest mr-2" />
                        <span className="text-sm">총 강의 시간: {course.duration}</span>
                      </div>
                      {course.isAI && (
                        <div className="flex items-center">
                          <Bot className="h-4 w-4 text-ghibli-forest mr-2" />
                          <span className="text-sm">AI 도움받기 가능</span>
                        </div>
                      )}
                    </div>
                    
                    {course.isPurchased ? (
                      <Button 
                        onClick={handleWatchLecture}
                        className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Play className="h-4 w-4" /> 강의 듣기
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleCheckout}
                        className="w-full bg-ghibli-meadow hover:bg-ghibli-forest text-white transition-all duration-300"
                      >
                        결제하기
                      </Button>
                    )}
                  </div>
                  
                  <div className="bg-ghibli-cloud/50 p-4 text-center">
                    <p className="text-sm text-ghibli-stone">
                      조회수: {course.views.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Video Lecture Modal */}
      <VideoLectureModal 
        isOpen={showVideoModal} 
        onClose={() => setShowVideoModal(false)} 
        course={course} 
      />
    </div>
  );
};

export default CourseDetail;
