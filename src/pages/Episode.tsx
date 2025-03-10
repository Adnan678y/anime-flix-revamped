
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Play, Bookmark, ThumbsUp, ThumbsDown, Share2, MessageSquare, HomeIcon, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { getBookmarks, toggleBookmark, isBookmarked } from '@/utils/bookmarks';
import { EpisodeGrid } from '@/components/EpisodeGrid';
import VideoPlayer from '@/components/VideoPlayer';
import { updatePlaybackWithMetadata } from '@/utils/playback';
import { Button } from '@/components/ui/button';

const Episode = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [bookmarked, setBookmarked] = useState(false);
  const [userInteraction, setUserInteraction] = useState<'like' | 'dislike' | null>(null);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const DEFAULT_ANIME_NAME = "Attack on Titan";
  const DEFAULT_THUMBNAIL = "https://cdn.myanimelist.net/images/anime/10/47347.jpg";

  const { data: episode, isLoading: isLoadingEpisode, error: episodeError } = useQuery({
    queryKey: ['episode', id],
    queryFn: () => api.getEpisode(id!),
    enabled: !!id,
    meta: {
      onError: () => toast.error('Failed to load episode')
    }
  });

  useEffect(() => {
    if (id) {
      const metadata = {
        name: episode?.name || `Episode ${id}`,
        img: episode?.poster || DEFAULT_THUMBNAIL,
        animeName: episode?.animeName || DEFAULT_ANIME_NAME
      };
      
      updatePlaybackWithMetadata(id, metadata);
    }
  }, [id, episode]);

  const { data: otherEpisodes, isLoading: isLoadingOtherEpisodes } = useQuery({
    queryKey: ['anime-episodes', episode?.animeId],
    queryFn: () => api.getAnimeById(episode!.animeId),
    enabled: !!episode?.animeId,
    meta: {
      onError: () => toast.error('Failed to load other episodes')
    }
  });

  const { data: interactions } = useQuery({
    queryKey: ['episode-interactions', id],
    queryFn: async () => {
      const { data: likes } = await supabase
        .from('episodes_interactions')
        .select('interaction_type')
        .eq('episode_id', id);
      return likes || [];
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (episode?.id) {
      setBookmarked(isBookmarked(episode.id));
    }
  }, [episode?.id]);

  const likes = interactions?.filter(i => i.interaction_type === 'like').length || 0;
  const dislikes = interactions?.filter(i => i.interaction_type === 'dislike').length || 0;

  const toggleBookmarkHandler = () => {
    if (!episode) return;
    
    const newIsBookmarked = toggleBookmark(episode.id);
    setBookmarked(newIsBookmarked);
    toast.success(newIsBookmarked ? 'Bookmark added' : 'Bookmark removed');
  };

  const handleInteraction = async (type: 'like' | 'dislike') => {
    if (!id) return;
    
    try {
      const interactionsJSON = localStorage.getItem('user-interactions') || '{}';
      const interactions = JSON.parse(interactionsJSON);
      
      if (userInteraction === type) {
        delete interactions[id];
        setUserInteraction(null);
      } else {
        interactions[id] = type;
        setUserInteraction(type);
      }
      
      localStorage.setItem('user-interactions', JSON.stringify(interactions));
      
      queryClient.invalidateQueries({ queryKey: ['episode-interactions', id] });
      toast.success('Thanks for your feedback!');
    } catch (error) {
      console.error('Interaction error:', error);
      toast.error('Failed to save your feedback');
    }
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

  const { data: comments = [] } = useQuery({
    queryKey: ['episode-comments', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('episode_comments')
        .select('*')
        .eq('episode_id', id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!id && showComments,
  });

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !id) {
      toast.error('Unable to post comment at this time');
      return;
    }
    
    try {
      const commentsJSON = localStorage.getItem('user-comments') || '{}';
      const userComments = JSON.parse(commentsJSON);
      
      if (!userComments[id]) {
        userComments[id] = [];
      }
      
      const newComment = {
        id: Date.now().toString(),
        episode_id: id,
        comment_text: comment,
        created_at: new Date().toISOString()
      };
      
      userComments[id].unshift(newComment);
      localStorage.setItem('user-comments', JSON.stringify(userComments));
      
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['episode-comments', id] });
      toast.success('Comment added!');
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Failed to add comment');
    }
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

  if (!episode || episodeError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A1A2E] to-[#16213E]">
        <Navbar />
        <div className="container mx-auto px-4 py-12 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-12 text-center">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E50914]/20 to-[#ff8080]/20 blur-xl rounded-full" />
              <h1 className="relative text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#E50914] via-[#ff6b6b] to-[#ff8080] text-transparent bg-clip-text animate-pulse">
                Episode Not Found
              </h1>
            </div>
            
            <div className="text-center mb-12">
              <p className="text-xl text-white/80 mb-4">
                Oops! The episode you're looking for seems to have disappeared into the anime void.
              </p>
              <p className="text-lg text-white/60">
                It might have been removed, or perhaps the URL is incorrect.
              </p>
            </div>
            
            <div className="aspect-video max-w-3xl mx-auto bg-netflix-dark/30 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 shadow-xl">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-6">
                  <Play className="w-20 h-20 text-white/20 mx-auto" />
                  <p className="text-white/60 text-xl">Video not available</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#E50914]/10">
                <ArrowLeft className="w-10 h-10 text-[#E50914] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2 text-center">Go Back</h3>
                <p className="text-white/70 mb-4 text-center">Return to the previous page you were viewing.</p>
                <Button 
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
              </div>
              
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#E50914]/10">
                <HomeIcon className="w-10 h-10 text-[#E50914] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2 text-center">Home Page</h3>
                <p className="text-white/70 mb-4 text-center">Return to the home page to discover other content.</p>
                <Link to="/">
                  <Button 
                    className="w-full bg-gradient-to-r from-[#E50914] to-[#ff4d4d] hover:opacity-90 text-white"
                  >
                    Go Home
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/search" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <Search className="w-4 h-4" />
                <span>Search for another anime</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              to={`/anime/${episode.animeId}`}
              className="flex items-center gap-2 text-netflix-gray hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to {episode.animeName || DEFAULT_ANIME_NAME}</span>
            </Link>
          </div>

          <div className="bg-netflix-dark/50 p-4 rounded-md mb-4">
            <div className="text-netflix-gray">
              You are watching <span className="text-white font-semibold">{episode.name}</span>
            </div>
          </div>

          <div className="relative aspect-video bg-netflix-dark rounded-lg overflow-hidden mb-4">
            {episode.stream ? (
              <VideoPlayer 
                src={episode.stream} 
                poster={episode.poster || DEFAULT_THUMBNAIL}
                autoPlay={true}
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

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => handleInteraction('like')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                userInteraction === 'like'
                  ? 'bg-netflix-red text-white'
                  : 'bg-netflix-dark text-netflix-gray hover:text-white'
              }`}
            >
              <ThumbsUp className="w-5 h-5" />
              <span>{likes}</span>
            </button>
            <button
              onClick={() => handleInteraction('dislike')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
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
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-netflix-dark text-netflix-gray hover:text-white transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
            <button
              onClick={toggleBookmarkHandler}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                bookmarked 
                ? 'bg-netflix-red text-white' 
                : 'bg-netflix-dark text-netflix-gray hover:text-white'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
              <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
          </div>

          {otherEpisodes?.episodes && otherEpisodes.episodes.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Other Episodes</h2>
              <EpisodeGrid 
                episodes={otherEpisodes.episodes} 
                currentEpisodeId={episode.id}
              />
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-netflix-dark text-netflix-gray hover:text-white w-full justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <span>Comments ({comments.length})</span>
              </div>
              <span>{showComments ? '▼' : '▶'}</span>
            </button>

            {showComments && (
              <div className="space-y-4 animate-fade-in">
                <form onSubmit={handleComment} className="space-y-2">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-netflix-dark text-white rounded-md p-3 min-h-[100px] resize-none"
                    placeholder="Write a comment..."
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-netflix-red text-white rounded-md hover:bg-netflix-red/90 transition-colors"
                      disabled={!comment.trim()}
                    >
                      Post Comment
                    </button>
                  </div>
                </form>

                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className="bg-netflix-dark/50 p-4 rounded-md hover:bg-netflix-dark/70 transition-colors"
                    >
                      <p className="text-white whitespace-pre-wrap break-words">{comment.comment_text}</p>
                      <p className="text-sm text-netflix-gray mt-2">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-netflix-gray text-center py-4">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Episode;
