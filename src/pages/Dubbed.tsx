
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { AnimeGrid } from '@/components/AnimeGrid';
import { useEffect, useState } from 'react';

const Dubbed = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dubbedAnime, setDubbedAnime] = useState<any[]>([]);

  const { data: recommendedData } = useQuery({
    queryKey: ['dubbed-recommendations'],
    queryFn: () => api.getRecommendations('dubbed'),
  });

  useEffect(() => {
    if (recommendedData?.results) {
      setDubbedAnime(recommendedData.results);
      setIsLoading(false);
    }
  }, [recommendedData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-netflix-black to-netflix-dark">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Dubbed Anime</h1>
            <p className="text-netflix-gray">Watch your favorite anime with English voice acting</p>
          </div>
          
          <AnimeGrid
            title=""
            items={dubbedAnime}
            isLoading={isLoading}
            showTitle={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Dubbed;
