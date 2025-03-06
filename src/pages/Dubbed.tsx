
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { AnimeGrid } from '@/components/AnimeGrid';
import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';

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
      <div className="pt-24 pb-10">
        <div className="container mx-auto px-4">
          <div className="mb-8 bg-gradient-to-r from-netflix-dark/80 to-transparent p-6 rounded-lg border-l-4 border-netflix-red">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare className="w-7 h-7 text-netflix-red" />
              <h1 className="text-3xl font-bold text-white">Dubbed Anime</h1>
            </div>
            <p className="text-netflix-gray max-w-2xl">Watch your favorite anime with English voice acting. These shows have been carefully translated and voiced over to provide an immersive experience in your language.</p>
          </div>
          
          <AnimeGrid
            title=""
            items={dubbedAnime}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Dubbed;
