
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { AnimeGrid } from '@/components/AnimeGrid';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

interface ContinueWatchingItem {
  ID: string;
  name: string;
  img: string;
  progress: number;
  totalDuration: number;
}

const PLAYBACK_STORAGE_KEY = 'video-playback-positions';

const Index = () => {
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);

  const { data: homeData, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: api.getHome,
  });

  useEffect(() => {
    const loadContinueWatching = async () => {
      const savedPositions = JSON.parse(localStorage.getItem(PLAYBACK_STORAGE_KEY) || '{}');
      const positions = Object.entries(savedPositions);

      if (positions.length === 0) return;

      const watchingItems = positions.map(([url, position]) => {
        // Extract the episode ID from the URL
        const match = url.match(/episode\/(.+)$/);
        if (!match) return null;

        const episodeId = match[1];
        const episode = homeData?.["New release"]?.items.find(item => item.ID === episodeId) ||
                       homeData?.Popular?.items.find(item => item.ID === episodeId);

        if (!episode) return null;

        return {
          ID: episode.ID,
          name: episode.name,
          img: episode.img,
          progress: position as number,
          totalDuration: 0 // We don't have this information stored yet
        };
      }).filter(Boolean) as ContinueWatchingItem[];

      setContinueWatching(watchingItems.slice(0, 10)); // Show only the last 10 items
    };

    if (homeData) {
      loadContinueWatching();
    }
  }, [homeData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-netflix-black to-netflix-dark">
      <Navbar />
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-12">
          {continueWatching.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {continueWatching.map((item) => (
                  <div key={item.ID} className="relative group">
                    <Link 
                      to={`/episode/${item.ID}`}
                      className="block relative aspect-video overflow-hidden rounded-lg"
                    >
                      <img 
                        src={item.img} 
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                        <div 
                          className="h-full bg-netflix-red"
                          style={{ 
                            width: `${(item.progress / (item.totalDuration || 100)) * 100}%` 
                          }}
                        />
                      </div>
                    </Link>
                    <h3 className="mt-2 text-sm text-white/90 line-clamp-2">{item.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}
          <AnimeGrid
            title="Popular Anime"
            items={homeData?.Popular?.items || []}
            isLoading={isLoading}
          />
          <AnimeGrid
            title="New Releases"
            items={homeData?.["New release"]?.items || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
