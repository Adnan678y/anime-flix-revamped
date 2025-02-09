
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { AnimeGrid } from '@/components/AnimeGrid';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => api.searchAnime(query),
    enabled: !!query,
  });

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        {query ? (
          <AnimeGrid
            title={`Search Results for "${query}"`}
            items={searchResults?.items || []}
            isLoading={isLoading}
          />
        ) : (
          <div className="text-center text-netflix-gray">
            <h2 className="text-2xl font-bold">Start searching for your favorite anime!</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
