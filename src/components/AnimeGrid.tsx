
import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Anime {
  id: number;
  name: string;
  img: string;
}

interface AnimeGridProps {
  title: string;
  items: Anime[];
  isLoading?: boolean;
}

export const AnimeGrid = ({ title, items, isLoading }: AnimeGridProps) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="my-6 md:my-8">
        <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-white mb-4 md:mb-6 inline-block relative after:content-[''] after:absolute after:w-1/3 after:h-1 after:bg-netflix-red after:-bottom-2 after:left-0 animate-fade-in`}>
          {title}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div 
              key={index} 
              className="aspect-[2/3] bg-netflix-dark/50 animate-pulse rounded-lg shadow-xl" 
            />
          ))}
        </div>
      </div>
    );
  }

  if (!items?.length) {
    return null;
  }

  return (
    <div className="my-6 md:my-8 animate-fade-in">
      <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-white mb-4 md:mb-6 inline-block relative after:content-[''] after:absolute after:w-1/3 after:h-1 after:bg-netflix-red after:-bottom-2 after:left-0`}>
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
        {items.map((anime) => (
          <Link
            key={anime.id}
            to={`/anime/${anime.id}`}
            className="group relative aspect-[2/3] overflow-hidden rounded-lg shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-netflix-red/20"
          >
            <img
              src={anime.img}
              alt={anime.name}
              className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center space-x-2 mb-2">
                  <Play className="w-4 h-4 md:w-5 md:h-5 text-netflix-red" />
                  <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" fill="currentColor" />
                </div>
                <h3 className="text-white text-sm md:text-lg font-semibold line-clamp-2">{anime.name}</h3>
              </div>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-netflix-red text-white text-xs font-bold px-2 py-1 rounded">
                NEW
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
