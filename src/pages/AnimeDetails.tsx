import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Link } from 'react-router-dom';
import { Play, Star, Clock, Calendar, Users, Info, Bookmark, ThumbsUp, Share2, HomeIcon, Search, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnimeGrid } from '@/components/AnimeGrid';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { isBookmarked, toggleBookmark } from '@/utils/bookmarks';
import { Button } from '@/components/ui/button';

const AnimeDetails = () => {
  const isMobile = useIsMobile();
  const { id } = useParams<{ id: string }>();
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  
  const { data: anime, isLoading } = useQuery({
    queryKey: ['anime', id],
    queryFn: () => api.getAnimeById(id!),
    enabled: !!id,
  });

  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['recommendations', anime?.tag?.[0]],
    queryFn: () => api.getRecommendations(anime?.tag?.[0] || ''),
    enabled: !!anime?.tag?.[0],
  });
  
  useEffect(() => {
    if (id) {
      setBookmarked(isBookmarked(id));
      const likedAnimes = JSON.parse(localStorage.getItem('liked-animes') || '{}');
      setLiked(!!likedAnimes[id]);
    }
  }, [id]);
  
  const handleBookmark = () => {
    if (!id) return;
    const newState = toggleBookmark(id);
    setBookmarked(newState);
    toast.success(newState ? 'Added to your list' : 'Removed from your list');
  };
  
  const handleLike = () => {
    if (!id) return;
    setLiked(!liked);
    const likedAnimes = JSON.parse(localStorage.getItem('liked-animes') || '{}');
    if (liked) {
      delete likedAnimes[id];
    } else {
      likedAnimes[id] = true;
    }
    localStorage.setItem('liked-animes', JSON.stringify(likedAnimes));
    toast.success(liked ? 'Removed from liked animes' : 'Added to liked animes');
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: anime?.name,
        text: `Check out ${anime?.name} on Tenjku Anime`,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <Navbar />
        <div className="h-[50vh] bg-netflix-dark animate-pulse" />
        <div className="container mx-auto px-4">
          <div className="relative -mt-32 z-10">
            <div className="w-48 h-72 bg-netflix-dark animate-pulse rounded" />
            <div className="mt-4 space-y-4">
              <div className="h-8 w-64 bg-netflix-dark animate-pulse rounded" />
              <div className="h-4 w-full max-w-2xl bg-netflix-dark animate-pulse rounded" />
              <div className="h-4 w-full max-w-xl bg-netflix-dark animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A1A2E] to-[#16213E]">
        <Navbar />
        <div className="container mx-auto px-4 py-12 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E50914]/20 to-[#ff8080]/20 blur-xl rounded-full" />
              <h1 className="relative text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#E50914] via-[#ff6b6b] to-[#ff8080] text-transparent bg-clip-text animate-pulse">
                Anime Not Found
              </h1>
            </div>
            
            <p className="text-xl text-white/80 mb-8">
              The anime you're looking for seems to have teleported to another dimension...
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-12">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#E50914]/10">
                <Search className="w-10 h-10 text-[#E50914] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Find Something Else</h3>
                <p className="text-white/70 mb-4">Discover other exciting anime titles in our collection.</p>
                <Link to="/search">
                  <Button 
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    Search Catalog
                  </Button>
                </Link>
              </div>
              
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#E50914]/10">
                <HomeIcon className="w-10 h-10 text-[#E50914] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Back to Home</h3>
                <p className="text-white/70 mb-4">Return to the home page to browse trending and popular anime.</p>
                <Link to="/">
                  <Button 
                    className="w-full bg-gradient-to-r from-[#E50914] to-[#ff4d4d] hover:opacity-90 text-white"
                  >
                    Go Home
                  </Button>
                </Link>
              </div>
            </div>
            
            <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="relative">
        <div
          className="h-[60vh] bg-cover bg-center relative"
          style={{ backgroundImage: `url(${anime.horizontal_img || anime.img})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="relative -mt-48 z-10 grid md:grid-cols-[300px_1fr] gap-8">
            <div className="animate-fade-in">
              <div className="relative">
                <img
                  src={anime.img}
                  alt={anime.name}
                  className="w-full aspect-[2/3] object-cover rounded-lg shadow-2xl transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <button
                    onClick={handleBookmark}
                    className={`p-2 rounded-full backdrop-blur-md ${bookmarked ? 'bg-netflix-red text-white' : 'bg-black/40 text-white'}`}
                    title={bookmarked ? "Remove from My List" : "Add to My List"}
                  >
                    <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleLike}
                    className={`p-2 rounded-full backdrop-blur-md ${liked ? 'bg-netflix-red text-white' : 'bg-black/40 text-white'}`}
                    title={liked ? "Unlike" : "Like"}
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                  <span className="text-white font-semibold">4.8</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-5 h-5 text-netflix-gray" />
                  <span className="text-netflix-gray">24 min/ep</span>
                </div>
              </div>
              
              <Link
                to={anime.episodes && anime.episodes.length > 0 ? `/episode/${anime.episodes[0].id}` : '#'}
                className={`mt-6 flex items-center justify-center gap-2 bg-netflix-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md transition-colors w-full ${!anime.episodes || anime.episodes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Play className="w-5 h-5" fill="currentColor" />
                <span>Watch Now</span>
              </Link>
            </div>

            <div className="text-white space-y-6 animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">{anime.name}</h1>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-netflix-red" />
                  <span>{anime.release_year}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-netflix-red" />
                  <span>{anime.status}</span>
                </div>
                <div className="bg-netflix-red/20 text-netflix-red px-3 py-1 rounded-full text-sm font-semibold">
                  {anime.status}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-netflix-gray shrink-0 mt-1" />
                  <p className="text-netflix-gray text-base md:text-lg leading-relaxed">
                    {anime.overview || 'No description available.'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {anime.tag && anime.tag.map((tag, index) => (
                  <Link 
                    key={index} 
                    to={`/search?tag=${tag}`}
                    className="bg-netflix-dark hover:bg-netflix-dark/80 text-netflix-gray text-sm px-3 py-1 rounded-full transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              {anime?.episodes && anime.episodes.length > 0 && (
                <div className="pt-8">
                  <h2 className="text-xl md:text-2xl font-bold mb-6 inline-block relative after:content-[''] after:absolute after:w-1/3 after:h-1 after:bg-netflix-red after:-bottom-2 after:left-0">
                    Episodes
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {anime.episodes.map((episode) => (
                      <Link
                        key={episode.id}
                        to={`/episode/${episode.id}`}
                        className="group relative bg-netflix-dark rounded-lg overflow-hidden hover:scale-105 active:scale-95 transition-all duration-300"
                      >
                        <div className="aspect-video relative">
                          <img
                            src={episode.poster}
                            alt={episode.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = anime.img;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-netflix-red/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                <Play className="w-6 h-6 text-white" fill="currentColor" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2 group-hover:text-netflix-red transition-colors duration-300">
                            {episode.name}
                          </h3>
                          <div className="mt-2 flex items-center space-x-2 text-netflix-gray text-xs md:text-sm">
                            <Clock className="w-4 h-4" />
                            <span>24min</span>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-netflix-red text-white text-xs font-bold px-2 py-1 rounded">
                            HD
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {recommendations?.results && recommendations.results.length > 0 && (
            <div className="mt-16">
              <AnimeGrid
                title="More Like This"
                items={recommendations.results}
                isLoading={isLoadingRecommendations}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
