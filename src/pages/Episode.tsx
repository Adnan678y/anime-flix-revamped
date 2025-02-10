
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
  
  const { data: episode, isLoading: isLoadingEpisode } = useQuery({
    queryKey: ['episode', id],
    queryFn: () => api.getEpisode(id!),
    enabled: !!id,
  });

  const { data: qualities, isLoading: isLoadingQualities } = useQuery({
    queryKey: ['qualities', id],
    queryFn: () => api.getQuality(id!),
    enabled: !!id,
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
      newBookmarks = bookmarks.filter((id: string) => id !== episode.id);
      toast.success('Bookmark removed');
    } else {
      newBookmarks = [...bookmarks, episode.id];
      toast.success('Bookmark added');
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  const isLoading = isLoadingEpisode || isLoadingQualities;

  if (isLoading) {
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

  if (!episode || !qualities) {
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
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="space-y-8">
          {/* Navigation and title */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to={`/anime/${episode.animeId}`}
                className="flex items-center gap-2 text-netflix-gray hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to series</span>
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{episode.name}</h1>
            </div>
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

          {/* Video player */}
          <div className="relative aspect-video bg-netflix-dark rounded-lg overflow-hidden group">
            {qualities.sources?.[0]?.url ? (
              <video
                controls
                className="w-full h-full"
                poster={episode.poster}
                key={qualities.sources[0].url}
              >
                <source src={qualities.sources[0].url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <Play className="w-16 h-16 mx-auto mb-4" />
                  <p>Video not available</p>
                </div>
              </div>
            )}
          </div>

          {/* Quality selection */}
          {qualities.sources && qualities.sources.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Quality</h2>
              <div className="flex flex-wrap gap-4">
                {qualities.sources.map((source, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 rounded-md bg-netflix-dark text-white hover:bg-netflix-red transition-colors"
                  >
                    {source.quality || 'Default'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Episode description */}
          {episode.overview && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Overview</h2>
              <p className="text-netflix-gray text-lg leading-relaxed">
                {episode.overview}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Episode;
