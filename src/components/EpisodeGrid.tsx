
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

interface Episode {
  id: string;
  name: string;
  poster: string;
}

interface EpisodeGridProps {
  episodes: Episode[];
  currentEpisodeId: string;
}

export const EpisodeGrid = ({ episodes, currentEpisodeId }: EpisodeGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {episodes.map((episode) => (
        <Link
          key={episode.id}
          to={`/episode/${episode.id}`}
          className={`group relative aspect-video rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 ${
            episode.id === currentEpisodeId ? 'ring-2 ring-netflix-red' : ''
          }`}
        >
          <img
            src={episode.poster}
            alt={episode.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-12 h-12 text-netflix-red" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
            <h3 className="text-white text-sm font-medium truncate">{episode.name}</h3>
          </div>
          {episode.id === currentEpisodeId && (
            <div className="absolute top-2 right-2">
              <div className="bg-netflix-red text-white text-xs px-2 py-1 rounded">
                Current
              </div>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};
