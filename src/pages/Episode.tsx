import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Play, Bookmark, ThumbsUp, ThumbsDown, Share2, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { getBookmarks, toggleBookmark } from '@/utils/bookmarks';
import { EpisodeGrid } from '@/components/EpisodeGrid';
import VideoPlayer from '@/components/VideoPlayer';

const Episode = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userInteraction, setUserInteraction] = useState<'like' | 'dislike' | null>(null);
  const [userIp, setUserIp] = useState<string>('');
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setUserIp(data.ip);
      } catch (error) {
        console.error('Failed to fetch IP:', error);
        setUserIp('0.0.0.0'); // Fallback IP
      }
    };
    fetchIp();
  }, []);

  const { data: episode, isLoading: isLoadingEpisode } = useQuery({
    queryKey: ['episode', id],
    queryFn: () => api.getEpisode(id!),
    enabled: !!id,
    meta: {
      onError: () => toast.error('Failed to load episode')
    }
  });

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

  const { data: userCurrentInteraction } = useQuery({
    queryKey: ['user-interaction', id, userIp],
    queryFn: async () => {
      if (!userIp) return null;
      const { data } = await supabase
        .from('episodes_interactions')
        .select('interaction_type')
        .eq('episode_id', id)
        .eq('ip_address', userIp)
        .maybeSingle();
      return data?.interaction_type as 'like' | 'dislike' | null;
    },
    enabled: !!id && !!userIp,
  });

  useEffect(() => {
    setUserInteraction(userCurrentInteraction || null);
  }, [userCurrentInteraction]);

  const likes = interactions?.filter(i => i.interaction_type === 'like').length || 0;
  const dislikes = interactions?.filter(i => i.interaction_type === 'dislike').length || 0;

  useEffect(() => {
    if (episode?.id) {
      setIsBookmarked(getBookmarks().includes(episode.id));
    }
  }, [episode?.id]);

  const toggleBookmarkHandler = () => {
    if (!episode) return;
    
    const newIsBookmarked = toggleBookmark(episode.id);
    setIsBookmarked(newIsBookmarked);
    toast.success(newIsBookmarked ? 'Bookmark added' : 'Bookmark removed');
  };

  const handleInteraction = async (type: 'like' | 'dislike') => {
    if (!userIp) {
      toast.error('Unable to process your interaction at this time');
      return;
    }

    try {
      if (userInteraction === type) {
        // Remove interaction
        await supabase
          .from('episodes_interactions')
          .delete()
          .eq('episode_id', id)
          .eq('ip_address', userIp);
        setUserInteraction(null);
      } else {
        // Check if there's an existing interaction
        const { data: existing } = await supabase
          .from('episodes_interactions')
          .select()
          .eq('episode_id', id)
          .eq('ip_address', userIp)
          .maybeSingle();

        if (existing) {
          // Update existing interaction
          await supabase
            .from('episodes_interactions')
            .update({ interaction_type: type })
            .eq('episode_id', id)
            .eq('ip_address', userIp);
        } else {
          // Insert new interaction
          await supabase
            .from('episodes_interactions')
            .insert({
              episode_id: id,
              interaction_type: type,
              ip_address: userIp
            });
        }
        setUserInteraction(type);
      }
      
      // Refresh interactions data
      queryClient.invalidateQueries({ queryKey: ['episode-interactions', id] });
      queryClient.invalidateQueries({ queryKey: ['user-interaction', id, userIp] });
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
    enabled: !!id && showComments, // Only fetch when comments are visible
  });

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !userIp) {
      toast.error('Unable to post comment at this time');
      return;
    }
    
    try {
      await supabase
        .from('episode_comments')
        .insert({
          episode_id: id,
          comment_text: comment,
          ip_address: userIp
        });
      
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
          <div className="flex items-center justify-between">
            <Link
              to={`/anime/${episode.animeId}`}
              className="flex items-center gap-2 text-netflix-gray hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to {episode.animeName}</span>
            </Link>
            <button
              onClick={toggleBookmarkHandler}
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

          <div className="bg-netflix-dark/50 p-4 rounded-md">
            <div className="text-netflix-gray">
              You are watching <span className="text-white font-semibold">{episode.name}</span>
            </div>
          </div>

          <div className="relative aspect-video bg-netflix-dark rounded-lg overflow-hidden">
            {episode.stream ? (
              <VideoPlayer 
                src={episode.stream} 
                poster={episode.poster}
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

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleInteraction('like')}
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
              onClick={() => handleInteraction('dislike')}
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
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-netflix-dark text-netflix-gray hover:text-white w-full justify-between"
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
