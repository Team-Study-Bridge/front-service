
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Eye, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CourseType } from '@/types/admin';

const CourseManagement: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLecture, setSelectedLecture] = useState<CourseType | null>(null);

  // 임시 데이터
  const mockLectures: CourseType[] = [
    {
      id: 3,
      title: "백엔드 아키텍처 완전정복",
      description: "백엔드 아키텍처",
      instructor: "정강사",
      category: "백엔드",
      thumbnailUrl: "https://aigongbu-lecture-files.s3.ap-northeast-2.amazonaws.com/thumbnails/tum.png",
      publishedAt: "2025-06-02",
      status: "pending"
    },
  ];

  const filteredLectures = mockLectures.filter(lecture => {
    if (filter !== 'all' && lecture.status !== filter) return false;
    if (searchTerm && !lecture.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleStatusChange = (lectureId: number, newStatus: CourseType['status']) => {
    // 실제 구현에서는 API 호출 필요
    console.log(`Lecture ${lectureId} status changed to ${newStatus}`);
    // 상태 변경 후 목업 데이터 업데이트 로직 (실제 구현에서는 API 응답 후 상태 업데이트)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold korean-text">강의 관리</h2>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="강의 검색..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="korean-text">필터</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
        <TabsList className="mb-6">
          <TabsTrigger value="all" className="korean-text">전체</TabsTrigger>
          <TabsTrigger value="published" className="korean-text">승인됨</TabsTrigger>
          <TabsTrigger value="pending" className="korean-text">대기중</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLectures.map(lecture => (
              <Card key={lecture.id} className="overflow-hidden">
                <div className="relative h-40">
                  <img 
                    src={lecture.thumbnailUrl} 
                    alt={lecture.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge 
                    className={`absolute top-2 right-2 ${
                      lecture.status === 'published' ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                  >
                    {lecture.status === 'published' ? '승인됨' : '대기중'}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1 korean-text">{lecture.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2 korean-text">
                    {lecture.instructor} • {lecture.category}
                  </p>
                  <p className="text-sm line-clamp-2 mb-4 korean-text">{lecture.description}</p>
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => setSelectedLecture(lecture)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="text-xs korean-text">상세보기</span>
                    </Button>
                    {lecture.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="p-1 h-8 w-8"
                          onClick={() => handleStatusChange(lecture.id, 'published')}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="p-1 h-8 w-8"
                          onClick={() => console.log(`Reject lecture ${lecture.id}`)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredLectures.length === 0 && (
            <div className="text-center py-12 korean-text">
              <p className="text-muted-foreground">검색 결과가 없습니다</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedLecture && (
        <Dialog open={!!selectedLecture} onOpenChange={(open) => !open && setSelectedLecture(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="korean-text">{selectedLecture.title}</DialogTitle>
              <DialogDescription className="korean-text">
                {selectedLecture.instructor} • {selectedLecture.category} • {new Date(selectedLecture.publishedAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <img 
                  src={selectedLecture.thumbnailUrl} 
                  alt={selectedLecture.title}
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
              <div>
                <h4 className="font-semibold mb-2 korean-text">강의 설명</h4>
                <p className="text-sm text-muted-foreground korean-text">{selectedLecture.description}</p>
              </div>
            </div>

            <DialogFooter>
              {selectedLecture.status === 'pending' ? (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => {
                      handleStatusChange(selectedLecture.id, 'published');
                      setSelectedLecture(null);
                    }}
                  >
                    <Check className="h-4 w-4" />
                    <span className="korean-text">승인</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex items-center gap-2"
                    onClick={() => {
                      console.log(`Reject lecture ${selectedLecture.id}`);
                      setSelectedLecture(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                    <span className="korean-text">거절</span>
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setSelectedLecture(null)}
                  className="korean-text"
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

export default CourseManagement;
