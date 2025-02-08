
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
        <h2 className="text-3xl font-bold text-white mb-6 inline-block relative after:content-[''] after:absolute after:w-1/3 after:h-1 after:bg-netflix-red after:-bottom-2 after:left-0">
          {title}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] bg-netflix-dark/50 animate-pulse rounded-lg shadow-xl" />
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
      <h2 className="text-3xl font-bold text-white mb-6 inline-block relative after:content-[''] after:absolute after:w-1/3 after:h-1 after:bg-netflix-red after:-bottom-2 after:left-0">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {items.map((anime) => (
          <Link
            key={anime.id}
            to={`/anime/${anime.id}`}
            className="group relative aspect-[2/3] overflow-hidden rounded-lg shadow-xl transition-transform duration-300 hover:scale-105 hover:-translate-y-2"
          >
            <img
              src={anime.img}
              alt={anime.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white text-lg font-semibold line-clamp-2">{anime.name}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
