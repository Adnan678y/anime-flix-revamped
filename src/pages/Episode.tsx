import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Play, Bookmark } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const Episode = () => {
  const { id } = useParams<{ id: string }>();
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const { data: episode, isLoading: isLoadingEpisode, error: episodeError } = useQuery({
    queryKey: ['episode', id],
    queryFn: () => api.getEpisode(id!),
    enabled: !!id,
    onError: () => toast.error('Failed to load episode'),
  });

  useEffect(() => {
    if (episode?.id) {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(episode.id));
    }
  }, [episode?.id]);

  const toggleBookmark = () => {
    if (!episode) return;
    
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    let newBookmarks;
    
    if (isBookmarked) {
      newBookmarks = bookmarks.filter((eid: number) => eid !== episode.id);
      toast.success('Bookmark removed');
    } else {
      newBookmarks = [...bookmarks, episode.id];
      toast.success('Bookmark added');
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  if (isLoadingEpisode) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <Navbar />
        <div className="container mx-auto px-4 py-32">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-netflix-dark rounded" />
            <div className="aspect-video bg-netflix-dark rounded" />
            <div className="h-4 w-full max-w-2xl bg-netflix-dark rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl text-white">Episode not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Link
              to={`/anime/${episode.animeId}`}
              className="flex items-center gap-2 text-netflix-gray hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to {episode.animeName}</span>
            </Link>
            <button
              onClick={toggleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                isBookmarked 
                ? 'bg-netflix-red text-white' 
                : 'bg-netflix-dark text-netflix-gray hover:text-white'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
          </div>

          {/* Status / Title */}
          <div className="bg-netflix-dark/50 p-4 rounded-md">
            <div className="text-netflix-gray">
              You are watching <span className="text-white font-semibold">{episode.name}</span>
            </div>
          </div>

          {/* Video player */}
          <div className="relative aspect-video bg-netflix-dark rounded-lg overflow-hidden">
            {episode.stream ? (
              <iframe
                src={`https://vvvidk.vercel.app/?url=${episode.stream}`}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <Play className="w-16 h-16 mx-auto mb-4" />
                  <p>Video not available</p>
                </div>
              </div>
            )}
          </div>

          {/* Episode description */}
          {episode.poster && (
            <div className="text-center">
              <img src={episode.poster} alt={episode.name} className="mx-auto rounded-lg max-w-xs" />
            </div>
          )}

          {episode.animeName && (
            <h2 className="text-xl font-semibold text-white text-center">{episode.animeName}</h2>
          )}

        </div>
      </div>
    </div>
  );
};

export default Episode;
