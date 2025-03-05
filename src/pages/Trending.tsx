
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { AnimeGrid } from '@/components/AnimeGrid';
import { useEffect, useState } from 'react';

const Trending = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [trendingAnime, setTrendingAnime] = useState<any[]>([]);

  const { data: homeData } = useQuery({
    queryKey: ['home'],
    queryFn: api.getHome,
  });

  const { data: recommendedData } = useQuery({
    queryKey: ['trending-recommendations'],
    queryFn: () => api.getRecommendations('trending'),
    enabled: !homeData?.Popular?.items,
  });

  useEffect(() => {
    if (homeData?.Popular?.items) {
      setTrendingAnime(homeData.Popular.items);
      setIsLoading(false);
    } else if (recommendedData?.results) {
      setTrendingAnime(recommendedData.results);
      setIsLoading(false);
    }
  }, [homeData, recommendedData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-netflix-black to-netflix-dark">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Trending Anime</h1>
            <p className="text-netflix-gray">Discover the most popular anime that everyone is watching right now</p>
          </div>
          
          <AnimeGrid
            title=""
            items={trendingAnime}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Trending;
