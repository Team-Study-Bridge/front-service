
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Mock popular courses
const popularCourses = Array(8).fill(null).map((_, idx) => ({
  id: `popular-${idx + 1}`,
  title: `인기 강의 ${idx + 1}`,
  instructor: `김강사 ${idx + 1}`,
  image: `https://api.dicebear.com/7.x/shapes/svg?seed=popular${idx + 1}`,
  rating: (4 + Math.random()).toFixed(1),
  price: (15000 + idx * 5000).toLocaleString(),
  bookmarks: Math.floor(Math.random() * 100),
  category: ['프론트엔드', '백엔드', '데이터 사이언스', 'AI 강의'][idx % 4],
}));

const PopularCoursesCarousel: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      
      carouselRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <div className="py-12 relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl md:text-3xl font-handwritten text-ghibli-forest">
          인기 강의
        </h2>
        <Link 
          to="/top-courses" 
          className="text-sm font-medium text-ghibli-forest hover:text-ghibli-midnight flex items-center"
        >
          모두 보기 
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      <div className="relative group">
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {popularCourses.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="min-w-[280px] max-w-[280px] snap-start"
            >
              <div className="bg-white rounded-lg overflow-hidden border border-ghibli-meadow/20 shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                <div className="relative">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-40 object-cover"
                  />
                  <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                    <Heart className="h-4 w-4 text-gray-500 hover:text-red-500" />
                  </button>
                  <div className="absolute bottom-0 left-0 bg-ghibli-meadow text-white px-3 py-1 text-xs font-medium">
                    {course.category}
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <Link to={`/course/${course.id}`}>
                    <h3 className="font-medium text-ghibli-midnight hover:text-ghibli-forest transition-colors mb-1 line-clamp-2 min-h-[48px]">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-ghibli-stone mb-2">
                    {course.instructor}
                  </p>
                  <div className="flex items-center space-x-1 mb-4">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="font-bold text-ghibli-midnight">₩{course.price}</span>
                    <span className="text-xs text-ghibli-stone flex items-center">
                      <Heart className="h-3 w-3 mr-1" /> {course.bookmarks}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 hidden md:flex rounded-full bg-white shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 hidden md:flex rounded-full bg-white shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PopularCoursesCarousel;
