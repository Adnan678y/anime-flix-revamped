import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { AnimeGrid } from '@/components/AnimeGrid';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Trash2, Clock, CheckCircle } from 'lucide-react';
import { getContinueWatchingItems, addTestVideo, clearWatchHistory } from '@/utils/playback';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { toast } = useToast();

  const { data: homeData, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: api.getHome,
  });

  useEffect(() => {
    const loadContinueWatching = () => {
      try {
        console.log('Loading continue watching items...');
        
        // Uncomment for development testing if needed
        // addTestVideo(); 
        
        // Get continue watching items from our utility
        const watchingItems = getContinueWatchingItems();
        console.log('Retrieved watching items:', watchingItems);
        
        // Set the continue watching items
        setContinueWatching(watchingItems);
      } catch (error) {
        console.error('Failed to load continue watching:', error);
      }
    };

    loadContinueWatching();

    // Setup interval to refresh continue watching periodically
    const interval = setInterval(loadContinueWatching, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
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

  const handleClearWatchHistory = () => {
    clearWatchHistory();
    setContinueWatching([]);
    toast({
      title: "Watch history cleared",
      description: "Your continue watching list has been cleared.",
      duration: 3000,
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-netflix-black to-netflix-dark">
      <Navbar />
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-12">
          {continueWatching.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-netflix-red" />
                  <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearWatchHistory}
                  className="text-white/70 hover:text-white hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {continueWatching.map((item) => (
                  <div key={item.ID} className="relative group overflow-hidden rounded-lg bg-netflix-dark/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl border border-netflix-dark">
                    <Link 
                      to={`/episode/${item.ID}`}
                      className="block relative aspect-video overflow-hidden rounded-t-lg"
                    >
                      {item.img ? (
                        <img 
                          src={item.img} 
                          alt={item.name || 'Episode'}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-netflix-dark flex items-center justify-center">
                          <Play className="w-12 h-12 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white text-sm">
                            {formatTime(item.totalDuration - item.progress)}
                          </p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                          <Play className="w-12 h-12 text-white fill-current" />
                        </div>
                      </div>
                    </Link>
                    <div className="p-3">
                      <h3 className="text-sm text-white/90 line-clamp-2 font-medium">{item.name || 'Unknown Episode'}</h3>
                      {item.animeName && (
                        <p className="text-xs text-netflix-gray line-clamp-1 mt-1">{item.animeName}</p>
                      )}
                      <div className="mt-2">
                        <Progress 
                          className="h-1 bg-gray-700" 
                          value={(item.progress / (item.totalDuration || 100)) * 100}
                        />
                        <div className="flex items-center justify-between mt-1 text-xs text-netflix-gray">
                          <span>{Math.round((item.progress / (item.totalDuration || 100)) * 100)}%</span>
                          <span>{formatTime(item.totalDuration - item.progress)}</span>
                        </div>
                      </div>
                    </div>
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
