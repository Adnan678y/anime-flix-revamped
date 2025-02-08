
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

const AnimeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: anime, isLoading } = useQuery({
    queryKey: ['anime', id],
    queryFn: () => api.getAnimeById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <Navbar />
        <div className="h-[50vh] bg-netflix-dark animate-pulse" />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl text-white">Anime not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="relative">
        <div
          className="h-[50vh] bg-cover bg-center"
          style={{ backgroundImage: `url(${anime.img})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/50 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="relative -mt-32 z-10">
            <img
              src={anime.img}
              alt={anime.name}
              className="w-48 h-72 object-cover rounded shadow-lg"
            />
            <div className="mt-4">
              <h1 className="text-4xl font-bold text-white mb-4">{anime.name}</h1>
              {anime.episodes && anime.episodes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                  {anime.episodes.map((episode) => (
                    <Link
                      key={episode.id}
                      to={`/episode/${episode.id}`}
                      className="relative group aspect-video overflow-hidden rounded bg-netflix-dark"
                    >
                      <img
                        src={episode.img}
                        alt={episode.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                        <p className="text-white text-sm">{episode.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
