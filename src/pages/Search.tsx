
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { AnimeGrid } from '@/components/AnimeGrid';
import { useState, useEffect } from 'react';
import { SearchX, Search as SearchIcon, History, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', query],
    queryFn: () => api.searchAnime(query),
    enabled: !!query,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('anime-search-history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    // Update input value when URL query changes
    setInputValue(query);
  }, [query]);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search query is empty",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setShowHistory(false);
    
    // Add to search history
    if (searchTerm.trim() && !searchHistory.includes(searchTerm)) {
      const newHistory = [searchTerm, ...searchHistory.slice(0, 9)];
      setSearchHistory(newHistory);
      localStorage.setItem('anime-search-history', JSON.stringify(newHistory));
    }

    // Update URL
    setSearchParams({ q: searchTerm });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(inputValue);
  };

  const handleHistoryItemClick = (term: string) => {
    setInputValue(term);
    handleSearch(term);
  };

  const removeHistoryItem = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(item => item !== term);
    setSearchHistory(newHistory);
    localStorage.setItem('anime-search-history', JSON.stringify(newHistory));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('anime-search-history');
    toast({
      title: "Search history cleared",
      description: "Your search history has been cleared",
    });
  };

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <div className="mb-8 max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center">
              <SearchIcon className="absolute left-3 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for anime..."
                className="pl-10 pr-4 py-6 bg-netflix-dark text-white border-gray-700 focus:border-netflix-red focus:ring-netflix-red rounded-lg w-full"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setShowHistory(searchHistory.length > 0)}
              />
              {inputValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-12 text-gray-400 hover:text-white"
                  onClick={() => {
                    setInputValue('');
                    setShowHistory(false);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
              <Button 
                type="submit" 
                className="ml-2 bg-netflix-red hover:bg-red-700"
              >
                Search
              </Button>
            </div>
            
            {/* Search History Dropdown */}
            {showHistory && searchHistory.length > 0 && (
              <div className="absolute z-10 mt-2 w-full bg-netflix-dark border border-gray-700 rounded-md shadow-lg animate-fade-in">
                <div className="flex items-center justify-between p-3 border-b border-gray-700">
                  <div className="flex items-center text-gray-300">
                    <History className="h-4 w-4 mr-2" />
                    <span>Search History</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    onClick={clearSearchHistory}
                  >
                    Clear All
                  </Button>
                </div>
                <ul className="max-h-60 overflow-y-auto">
                  {searchHistory.map((term, index) => (
                    <li 
                      key={index}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-800 cursor-pointer text-gray-300"
                      onClick={() => handleHistoryItemClick(term)}
                    >
                      <div className="flex items-center">
                        <SearchIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{term}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-500 hover:text-white"
                        onClick={(e) => removeHistoryItem(e, term)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>

          {query && (
            <div className="mt-4 text-sm text-gray-400">
              Showing results for <span className="text-white font-semibold">"{query}"</span>
            </div>
          )}
        </div>

        {query ? (
          <>
            {error ? (
              <div className="text-center py-16">
                <SearchX className="w-16 h-16 text-netflix-red mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Search Error</h2>
                <p className="text-netflix-gray mb-8">
                  We couldn't find any results for "{query}"
                </p>
                <Button 
                  onClick={() => setSearchParams({})}
                  className="bg-netflix-red hover:bg-red-700"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <AnimeGrid
                title={`Search Results for "${query}"`}
                items={searchResults?.items || []}
                isLoading={isLoading}
                emptyMessage={`No results found for "${query}". Try another search term.`}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <SearchIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Start searching for your favorite anime</h2>
            <p className="text-netflix-gray">
              Enter a search term to find anime titles, characters, and more
            </p>
            
            {searchHistory.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl text-white mb-4 font-medium">Recent Searches</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {searchHistory.slice(0, isMobile ? 4 : 8).map((term, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="bg-netflix-dark hover:bg-gray-800"
                      onClick={() => handleHistoryItemClick(term)}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
