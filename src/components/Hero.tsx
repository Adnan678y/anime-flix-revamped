
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export const Hero = () => {
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
      <div className="w-full h-[80vh] bg-netflix-dark animate-pulse" />
    );
  }

  if (!slideshow?.items?.length) {
    return null;
  }

  const currentAnime = slideshow.items[currentSlide];

  return (
    <div className="relative w-full h-[80vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 scale-105"
        style={{ backgroundImage: `url(${currentAnime.img})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/70 to-transparent" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
          {currentAnime.name}
        </h1>
        <Link
          to={`/anime/${currentAnime.ID}`}
          className="inline-flex items-center px-8 py-4 bg-netflix-red text-white rounded-lg hover:bg-red-700 transition-colors duration-300 text-lg font-semibold shadow-lg hover:shadow-red-500/20"
        >
          <Play className="mr-2 h-6 w-6" />
          Watch Now
        </Link>
      </div>

      <div className="absolute bottom-8 right-8 flex space-x-3">
        {slideshow.items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-netflix-red w-6' 
                : 'bg-gray-400 hover:bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
