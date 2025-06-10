import React, { useState, useEffect } from 'react';
import {useParams, useNavigate, useLocation} from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Heart, Share2, Clock, Users, Award, Bot, Play, MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import CurriculumPreview from '@/components/lectures/CurriculumPreview';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { lectureAPI } from '@/api/lecture';
import VideoLectureModal from '@/components/VideoLectureModal';
import {paymentAPI} from "@/api";
import PurchasedCoursesButton from "@/components/lectures/PurchasedCoursesButton.tsx";

const LectureDetail: React.FC = () => {
  const { lectureId } = useParams<{ lectureId: string }>();
  const [lecture, setLecture] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('intro');
  const [showVideoModal, setShowVideoModal] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const location = useLocation();
  const paymentSuccess = location.state?.paymentSuccess;

  useEffect(() => {
    const fetchLecture = async () => {
      if (!lectureId) return;

      try {
        const [lectureRes, purchasesRes] = await Promise.all([
          lectureAPI.getLectureDetail(lectureId),
          user ? paymentAPI.getMyPurchases() : Promise.resolve({ data: [] }) // 로그인 안 한 경우 빈 배열
        ]);

        const lectureData = lectureRes.data;
        const purchases = purchasesRes.data;

        const isPurchased = purchases.some((p: any) => String(p.productId) === String(lectureId));

        setLecture({
          ...lectureData,
          isPurchased
        });
      } catch (err) {
        toast.error('강의 정보를 불러오지 못했습니다.');
      }
    };

    fetchLecture();
  }, [lectureId, user, paymentSuccess]);

  const toggleBookmark = () => {
    setIsBookmarked((prev) => !prev);
    toast.success(isBookmarked ? '북마크가 해제되었습니다.' : '북마크에 추가되었습니다.');
  };

  const handleShare = () => {
    toast.success('링크가 클립보드에 복사되었습니다.');
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('결제를 진행하려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    navigate(`/checkout/${lecture.id}`);
  };

  const handleWatchLecture = () => {
    setShowVideoModal(true);
  };

  const handleSubmitReview = () => {
    if (!user) {
      toast.error('수강평을 작성하려면 로그인이 필요합니다.');
      return;
    }

    if (!lecture?.isPurchased) {
      toast.error('강의를 구매한 후에 수강평을 작성할 수 있습니다.');
      return;
    }

    if (!reviewComment.trim()) {
      toast.error('수강평 내용을 입력해주세요.');
      return;
    }

    setIsSubmittingReview(true);

    // 💡 API 호출로 대체 가능
    setTimeout(() => {
      const newReview = {
        name: user.nickname || '익명',
        rating: reviewRating,
        comment: reviewComment,
      };

      setLecture((prev: any) => ({
        ...prev,
        reviews: [newReview, ...prev.reviews],
        reviewCount: prev.reviewCount + 1,
      }));

      setReviewComment('');
      setReviewRating(5);
      setIsSubmittingReview(false);

      toast.success('수강평이 등록되었습니다.');
    }, 1000);
  };

  if (!lecture) {
    return (
        <div className="min-h-screen">
          <Header />
          <main className="container mx-auto pt-32 px-4 pb-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ghibli-forest mx-auto"></div>
            <p className="mt-4 text-ghibli-forest">강의 정보를 불러오는 중...</p>
          </main>
          <Footer />
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto pt-24 px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Lecture Info */}
            <div className="lg:col-span-2">
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
              >
                {/* Instructor info */}
                <div className="flex items-center mb-6">
                  <img
                      src={lecture.instructorImage}
                      alt={lecture.instructor}
                      className="h-16 w-16 rounded-full border-2 border-ghibli-meadow mr-4"
                  />
                  <div>
                    <h2 className="text-xl font-medium text-ghibli-midnight">{lecture.instructor}</h2>
                    <p className="text-ghibli-stone">{lecture.isAI ? 'AI 튜터' : '전문 강사'}</p>
                  </div>
                </div>

                {/* Lecture thumbnail */}
                <div className="mb-8 relative rounded-xl overflow-hidden">
                  <img
                      src={lecture.image}
                      alt={lecture.title}
                      className="w-full h-80 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <div className="inline-block px-3 py-1 bg-ghibli-meadow text-white rounded-full text-sm font-medium mb-2">
                      {lecture.category}
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">{lecture.title}</h1>
                    <div className="flex items-center text-white">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-medium mr-2">{Number(lecture.rating).toFixed(1)}</span>
                      <span className="text-sm text-white/80">({lecture.reviewCount} 리뷰)</span>
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
                        <p className="text-ghibli-midnight mb-6">{lecture.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-ghibli-forest" />
                            <div>
                              <p className="text-sm text-ghibli-stone">수강생</p>
                              <p className="font-medium text-ghibli-midnight">{lecture.studentCount.toLocaleString()}명</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Clock className="h-5 w-5 text-ghibli-forest" />
                            <div>
                              <p className="text-sm text-ghibli-stone">총 강의 시간</p>
                              <p className="font-medium text-ghibli-midnight">{lecture.duration}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Award className="h-5 w-5 text-ghibli-forest" />
                            <div>
                              <p className="text-sm text-ghibli-stone">난이도</p>
                              <p className="font-medium text-ghibli-midnight">{lecture.level}</p>
                            </div>
                          </div>
                          {lecture.isAI && (
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
                          <li>{lecture.isAI ? 'AI 기술' : '웹 개발'}에 관심이 있는 초보자</li>
                          <li>실무에 적용할 수 있는 실전 기술을 배우고 싶은 분</li>
                          <li>체계적인 커리큘럼을 통해 학습하고 싶은 분</li>
                          <li>프로젝트 경험을 쌓고 싶은 분</li>
                        </ul>

                        {/* AI 자동 생성 커리큘럼 */}
                        {lecture.curriculum && lecture.curriculum.length > 0 && (
                            <CurriculumPreview curriculum={lecture.curriculum} />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="curriculum" className="pt-6">
                    <Card className="border border-ghibli-meadow/20">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-ghibli-forest mb-4">커리큘럼</h3>
                        <p className="text-ghibli-midnight mb-6">
                          총 {lecture.lectureContent.reduce((acc: number, section: any) => acc + section.lectures.length, 0)}개의 강의로 구성되어 있습니다.
                        </p>

                        <div className="space-y-6">
                          {lecture.lectureContent.map((section: any, index: number) => (
                              <div key={index}>
                                <h4 className="text-lg font-medium text-ghibli-forest mb-2">{section.title}</h4>

                                {/* AI 분석 내용을 보여주는 부분 */}
                                {section.content && (
                                    <p className="text-sm text-ghibli-stone mb-3 whitespace-pre-line">
                                      {section.content}
                                    </p>
                                )}

                                <ul className="space-y-3">
                                  {section.lectures.map((lec: string, lectureIndex: number) => (
                                      <li key={lectureIndex} className="p-3 bg-ghibli-cloud/50 rounded-lg flex justify-between items-center">
                                        <span>{lec}</span>
                                        {!user && <span className="text-xs text-ghibli-stone">미리보기 불가</span>}
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
                            <span className="font-bold text-lg">{Number(lecture.rating).toFixed(1)}</span>
                            <span className="text-ghibli-stone ml-2">({lecture.reviewCount} 리뷰)</span>
                          </div>
                        </div>

                        {/* 수강평 작성 영역 */}
                        {user && lecture.isPurchased && (
                            <div className="mb-8 bg-ghibli-cloud/30 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-3">
                                <MessageSquare className="h-5 w-5 text-ghibli-forest" />
                                <h4 className="font-medium">수강평 작성</h4>
                              </div>

                              <div className="mb-3">
                                <p className="text-sm text-ghibli-stone mb-2">별점</p>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                          key={star}
                                          type="button"
                                          onClick={() => setReviewRating(star)}
                                          className="p-1"
                                      >
                                        <Star
                                            className={`h-6 w-6 ${star <= reviewRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                        />
                                      </button>
                                  ))}
                                </div>
                              </div>

                              <div className="mb-3">
                                <p className="text-sm text-ghibli-stone mb-2">내용</p>
                                <Textarea
                                    placeholder="수강평을 작성해주세요..."
                                    className="resize-none"
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                />
                              </div>

                              <div className="flex justify-end">
                                <Button
                                    onClick={handleSubmitReview}
                                    disabled={isSubmittingReview || reviewComment.trim() === ''}
                                    className="bg-ghibli-meadow hover:bg-ghibli-forest"
                                >
                                  {isSubmittingReview ? '제출 중...' : '수강평 등록'}
                                </Button>
                              </div>
                            </div>
                        )}

                        <div className="space-y-6">
                          {lecture.reviews.map((review: any, index: number) => (
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
                      <h2 className="text-2xl font-semibold text-ghibli-forest mb-4">{lecture.title}</h2>

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
                          {lecture.bookmarks} 북마크
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="font-semibold mr-2">{Number(lecture.rating).toFixed(1)}</span>
                          <span className="text-sm text-ghibli-stone">({lecture.reviewCount} 리뷰)</span>
                        </div>
                        <div className="text-3xl font-bold text-ghibli-midnight mb-2">
                          {lecture.isPurchased ? (
                              <span className="text-green-600">구매 완료</span>
                          ) : (
                              <>₩{lecture.price.toLocaleString('ko-KR')}</>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-ghibli-forest mr-2" />
                          <span className="text-sm">총 강의 시간: {lecture.duration}</span>
                        </div>
                        {lecture.isAI && (
                            <div className="flex items-center">
                              <Bot className="h-4 w-4 text-ghibli-forest mr-2" />
                              <span className="text-sm">AI 도움받기 가능</span>
                            </div>
                        )}
                      </div>

                      {lecture.isPurchased ? (
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
                        조회수: {lecture.views.toLocaleString()}
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
            course={lecture}
            lectureId={lecture.id}
        />
        <PurchasedCoursesButton />
      </div>

  );
};

export default LectureDetail;