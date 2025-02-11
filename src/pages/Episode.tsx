
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Play, Bookmark, ThumbsUp, ThumbsDown, Share2, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const Episode = () => {
  const { id } = useParams<{ id: string }>();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userInteraction, setUserInteraction] = useState<'like' | 'dislike' | null>(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Array<{ text: string; timestamp: string }>>([]);
  
  const { data: episode, isLoading: isLoadingEpisode } = useQuery({
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

  const handleLike = () => {
    if (userInteraction === 'like') {
      setLikes(prev => prev - 1);
      setUserInteraction(null);
    } else {
      if (userInteraction === 'dislike') {
        setDislikes(prev => prev - 1);
      }
      setLikes(prev => prev + 1);
      setUserInteraction('like');
    }
    toast.success('Thanks for your feedback!');
  };

  const handleDislike = () => {
    if (userInteraction === 'dislike') {
      setDislikes(prev => prev - 1);
      setUserInteraction(null);
    } else {
      if (userInteraction === 'like') {
        setLikes(prev => prev - 1);
      }
      setDislikes(prev => prev + 1);
      setUserInteraction('dislike');
    }
    toast.success('Thanks for your feedback!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: episode?.name,
        text: `Watch ${episode?.name} on Tenjku Anime`,
        url: window.location.href,
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setComments(prev => [...prev, {
      text: comment,
      timestamp: new Date().toISOString()
    }]);
    setComment('');
    toast.success('Comment added!');
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

          {/* Interaction buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                userInteraction === 'like'
                  ? 'bg-green-600 text-white'
                  : 'bg-netflix-dark text-netflix-gray hover:text-white'
              }`}
            >
              <ThumbsUp className="w-5 h-5" />
              <span>{likes}</span>
            </button>
            <button
              onClick={handleDislike}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                userInteraction === 'dislike'
                  ? 'bg-red-600 text-white'
                  : 'bg-netflix-dark text-netflix-gray hover:text-white'
              }`}
            >
              <ThumbsDown className="w-5 h-5" />
              <span>{dislikes}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-netflix-dark text-netflix-gray hover:text-white"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>

          {/* Comments section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments
            </h2>
            <form onSubmit={handleComment} className="space-y-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-netflix-dark text-white rounded-md p-3 min-h-[100px]"
                placeholder="Write a comment..."
              />
              <button
                type="submit"
                className="px-4 py-2 bg-netflix-red text-white rounded-md hover:bg-netflix-red/90"
              >
                Post Comment
              </button>
            </form>
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div key={index} className="bg-netflix-dark/50 p-4 rounded-md">
                  <p className="text-white">{comment.text}</p>
                  <p className="text-sm text-netflix-gray mt-2">
                    {new Date(comment.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Episode thumbnail */}
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
