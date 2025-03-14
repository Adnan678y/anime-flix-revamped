
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { getBookmarks } from '@/utils/bookmarks';
import { Link } from 'react-router-dom';
import { Bookmark, Play } from 'lucide-react';

const MyList = () => {
  // Change the type from number[] to string[] to match what getBookmarks() returns
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Refresh bookmarks whenever the component is mounted
  useEffect(() => {
    setBookmarkedIds(getBookmarks());
    
    // Also set up a listener for storage changes to update the UI if bookmarks change
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bookmarks') {
        setBookmarkedIds(getBookmarks());
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { data: episodes, isLoading } = useQuery({
    queryKey: ['bookmarked-episodes', bookmarkedIds],
    queryFn: async () => {
      if (bookmarkedIds.length === 0) return [];
      
      const promises = bookmarkedIds.map(id => api.getEpisode(id));
      const results = await Promise.all(promises.map(p => p.catch(() => null)));
      return results.filter(episode => episode !== null);
    },
    enabled: bookmarkedIds.length > 0,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <Navbar />
        <div className="container mx-auto px-4 py-32">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-netflix-dark rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-video bg-netflix-dark rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="container mx-auto px-4 py-32">
        <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
          <Bookmark className="w-6 h-6" />
          My List
        </h1>

        {(!episodes || episodes.length === 0) ? (
          <div className="text-center text-netflix-gray py-12">
            <p className="text-xl mb-4">Your list is empty</p>
            <p>Add shows and movies to your list to watch them later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {episodes.map((episode) => (
              <Link
                key={episode.id}
                to={`/episode/${episode.id}`}
                className="group relative aspect-video bg-netflix-dark rounded-md overflow-hidden"
              >
                {episode.poster ? (
                  <img
                    src={episode.poster}
                    alt={episode.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-netflix-gray" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold line-clamp-2">{episode.name}</h3>
                    {episode.animeName && (
                      <p className="text-netflix-gray text-sm mt-1">{episode.animeName}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyList;
