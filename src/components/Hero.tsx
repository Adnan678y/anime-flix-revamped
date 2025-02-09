
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Play, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const Hero = () => {
  const isMobile = useIsMobile();
  const { data: slideshow, isLoading } = useQuery({
    queryKey: ['slideshow'],
    queryFn: api.getSlideshow,
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!slideshow?.items?.length) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshow.items.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slideshow?.items?.length]);

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] md:h-[80vh] bg-netflix-dark animate-pulse" />
    );
  }

  if (!slideshow?.items?.length) {
    return null;
  }

  const currentAnime = slideshow.items[currentSlide];

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
        style={{ backgroundImage: `url(${currentAnime.img})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/80 to-transparent" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
        <div className="container mx-auto">
          <div className="max-w-2xl space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 animate-fade-in">
              {currentAnime.name}
            </h1>
            <div className="flex items-center space-x-4 mb-4 md:mb-6 animate-fade-in">
              <div className="flex items-center">
                <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" fill="currentColor" />
                <span className="ml-2 text-sm md:text-lg">Top Rated</span>
              </div>
              <span className="text-netflix-red font-semibold text-sm md:text-base">HD</span>
              <span className="text-gray-300 text-sm md:text-base">Sub | Dub</span>
            </div>
            <Link
              to={`/anime/${currentAnime.ID}`}
              className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 bg-netflix-red text-white rounded-lg hover:bg-red-700 transition-all duration-300 text-base md:text-lg font-semibold shadow-lg hover:shadow-red-500/20 transform hover:scale-105 animate-fade-in"
            >
              <Play className="mr-2 h-5 w-5 md:h-6 md:w-6" />
              Watch Now
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slideshow.items.length) % slideshow.items.length)}
          className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors pointer-events-auto"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slideshow.items.length)}
          className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors pointer-events-auto"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 flex space-x-3">
        {slideshow.items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 md:w-3 h-2 md:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-netflix-red w-4 md:w-6' 
                : 'bg-gray-400 hover:bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
