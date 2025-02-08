
import { Link } from 'react-router-dom';

interface Anime {
  id: number;
  name: string;
  img: string;
}

interface AnimeGridProps {
  title: string;
  items: Anime[];
  isLoading?: boolean;
}

export const AnimeGrid = ({ title, items, isLoading }: AnimeGridProps) => {
  if (isLoading) {
    return (
      <div className="my-8">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] bg-netflix-dark animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!items?.length) {
    return null;
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((anime) => (
          <Link
            key={anime.id}
            to={`/anime/${anime.id}`}
            className="group relative aspect-[2/3] overflow-hidden rounded transition-transform hover:scale-105"
          >
            <img
              src={anime.img}
              alt={anime.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white text-lg font-semibold">{anime.name}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
