import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { AnimeGrid } from '@/components/AnimeGrid';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

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
    const loadContinueWatching = () => {
      if (!homeData) return;

      try {
        const positionsJSON = localStorage.getItem(PLAYBACK_STORAGE_KEY) || '{}';
        const positions = JSON.parse(positionsJSON);
        
        const progressData = Object.entries(positions).map(([episodeId, data]) => ({
          episode_id: episodeId,
          progress: (data as any).progress,
          total_duration: (data as any).totalDuration,
          last_watched: (data as any).lastWatched
        }));
        
        progressData.sort((a, b) => 
          new Date(b.last_watched).getTime() - new Date(a.last_watched).getTime()
        );
        
        const watchingItems = progressData
          .slice(0, 10)
          .map(progress => {
            const episode = homeData?.["New release"]?.items.find(item => item.ID === progress.episode_id) ||
                          homeData?.Popular?.items.find(item => item.ID === progress.episode_id);

            if (!episode) return null;

            return {
              ID: episode.ID,
              name: episode.name,
              img: episode.img,
              progress: progress.progress,
              totalDuration: progress.total_duration || 0
            };
          }).filter(Boolean) as ContinueWatchingItem[];

        setContinueWatching(watchingItems);
      } catch (error) {
        console.error('Failed to load continue watching:', error);
      }
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
