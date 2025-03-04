
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { AnimeGrid } from '@/components/AnimeGrid';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { getContinueWatchingItems, updatePlaybackWithMetadata, addTestVideo } from '@/utils/playback';

interface ContinueWatchingItem {
  ID: string;
  name?: string;
  img?: string;
  progress: number;
  totalDuration: number;
  animeName?: string;
}

const Index = () => {
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);

  const { data: homeData, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: api.getHome,
  });

  useEffect(() => {
    const loadContinueWatching = () => {
      try {
        console.log('Loading continue watching items...');
        
        // Uncomment the line below for development testing
        // addTestVideo();
        
        // Get continue watching items from our utility
        const watchingItems = getContinueWatchingItems();
        console.log('Retrieved watching items:', watchingItems);
        
        // Update metadata for any items that might be missing it
        if (homeData) {
          watchingItems.forEach(item => {
            const episode = homeData?.["New release"]?.items.find(ep => ep.ID === item.ID) ||
                          homeData?.Popular?.items.find(ep => ep.ID === item.ID);
            
            if (episode && (!item.name || !item.img)) {
              // Update the metadata if it's missing
              updatePlaybackWithMetadata(item.ID, {
                name: episode.name,
                img: episode.img,
                animeName: episode.animeName
              });
            }
          });
        }
        
        // Set the continue watching items
        setContinueWatching(watchingItems);
      } catch (error) {
        console.error('Failed to load continue watching:', error);
      }
    };

    loadContinueWatching();
  }, [homeData]);

  // Setup a storage event listener to update the continue watching section
  // if playback positions are updated in another tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'video-playback-positions') {
        const watchingItems = getContinueWatchingItems();
        setContinueWatching(watchingItems);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  console.log('Current continue watching state:', continueWatching);

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
                      {item.img ? (
                        <img 
                          src={item.img} 
                          alt={item.name || 'Episode'}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-netflix-dark flex items-center justify-center">
                          <Play className="w-12 h-12 text-white/50" />
                        </div>
                      )}
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
                    <h3 className="mt-2 text-sm text-white/90 line-clamp-2">{item.name || 'Unknown Episode'}</h3>
                    {item.animeName && (
                      <p className="text-xs text-netflix-gray line-clamp-1">{item.animeName}</p>
                    )}
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
