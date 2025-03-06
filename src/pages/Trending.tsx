
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { AnimeGrid } from '@/components/AnimeGrid';
import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

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
      <div className="pt-24 pb-10">
        <div className="container mx-auto px-4">
          <div className="mb-8 bg-gradient-to-r from-netflix-dark/80 to-transparent p-6 rounded-lg border-l-4 border-netflix-red">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-7 h-7 text-netflix-red" />
              <h1 className="text-3xl font-bold text-white">Trending Anime</h1>
            </div>
            <p className="text-netflix-gray max-w-2xl">Discover the most popular anime that everyone is watching right now. These titles are generating buzz throughout the anime community.</p>
          </div>
          
          <AnimeGrid
            title=""
            items={trendingAnime}
            isLoading={isLoading}
            showRank={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Trending;
