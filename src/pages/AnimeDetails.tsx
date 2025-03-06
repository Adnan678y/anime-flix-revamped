import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Link } from 'react-router-dom';
import { Play, Star, Clock, Calendar, Users, Info } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnimeGrid } from '@/components/AnimeGrid';

const AnimeDetails = () => {
  const isMobile = useIsMobile();
  const { id } = useParams<{ id: string }>();
  const { data: anime, isLoading } = useQuery({
    queryKey: ['anime', id],
    queryFn: () => api.getAnimeById(id!),
    enabled: !!id,
  });

  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['recommendations', anime?.tag?.[0]],
    queryFn: () => api.getRecommendations(anime?.tag?.[0] || ''),
    enabled: !!anime?.tag?.[0],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <Navbar />
        <div className="h-[50vh] bg-netflix-dark animate-pulse" />
        <div className="container mx-auto px-4">
          <div className="relative -mt-32 z-10">
            <div className="w-48 h-72 bg-netflix-dark animate-pulse rounded" />
            <div className="mt-4 space-y-4">
              <div className="h-8 w-64 bg-netflix-dark animate-pulse rounded" />
              <div className="h-4 w-full max-w-2xl bg-netflix-dark animate-pulse rounded" />
              <div className="h-4 w-full max-w-xl bg-netflix-dark animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl text-white">Anime not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="relative">
        <div
          className="h-[60vh] bg-cover bg-center relative"
          style={{ backgroundImage: `url(${anime.horizontal_img || anime.img})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="relative -mt-48 z-10 grid md:grid-cols-[300px_1fr] gap-8">
            <div className="animate-fade-in">
              <img
                src={anime.img}
                alt={anime.name}
                className="w-full aspect-[2/3] object-cover rounded-lg shadow-2xl transition-transform duration-300 hover:scale-105"
              />
              <div className="mt-4 flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                  <span className="text-white font-semibold">4.8</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-5 h-5 text-netflix-gray" />
                  <span className="text-netflix-gray">24 min/ep</span>
                </div>
              </div>
            </div>

            <div className="text-white space-y-6 animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">{anime.name}</h1>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-netflix-red" />
                  <span>{anime.Release_year}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-netflix-red" />
                  <span>{anime.status}</span>
                </div>
                <div className="bg-netflix-red/20 text-netflix-red px-3 py-1 rounded-full text-sm font-semibold">
                  {anime.status}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-netflix-gray shrink-0 mt-1" />
                  <p className="text-netflix-gray text-base md:text-lg leading-relaxed">
                    {anime.overview || 'No description available.'}
                  </p>
                </div>
              </div>

              {anime?.episodes && anime.episodes.length > 0 && (
                <div className="pt-8">
                  <h2 className="text-xl md:text-2xl font-bold mb-6 inline-block relative after:content-[''] after:absolute after:w-1/3 after:h-1 after:bg-netflix-red after:-bottom-2 after:left-0">
                    Episodes
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {anime.episodes.map((episode) => (
                      <Link
                        key={episode.id}
                        to={`/episode/${episode.id}`}
                        className="group relative bg-netflix-dark rounded-lg overflow-hidden active:scale-95 transition-all duration-300"
                      >
                        <div className="aspect-video relative">
                          <img
                            src={episode.poster}
                            alt={episode.name}
                            className="w-full h-full object-cover transition-transform duration-300 @media(hover: hover){group-hover:scale-110}"
                            loading="lazy"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = anime.img;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 @media(hover: hover){group-hover:opacity-100} transition-all duration-300">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-netflix-red/90 flex items-center justify-center transform scale-0 @media(hover: hover){group-hover:scale-100} transition-transform duration-300">
                                <Play className="w-6 h-6 text-white" fill="currentColor" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2 @media(hover: hover){group-hover:text-netflix-red} transition-colors duration-300">
                            {episode.name}
                          </h3>
                          <div className="mt-2 flex items-center space-x-2 text-netflix-gray text-xs md:text-sm">
                            <Clock className="w-4 h-4" />
                            <span>24min</span>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 @media(hover: hover){group-hover:opacity-100} transition-opacity duration-300">
                          <div className="bg-netflix-red text-white text-xs font-bold px-2 py-1 rounded">
                            HD
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {recommendations?.items && recommendations.items.length > 0 && (
            <div className="mt-16">
              <AnimeGrid
                title="More Like This"
                items={recommendations.items}
                isLoading={isLoadingRecommendations}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
