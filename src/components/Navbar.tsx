
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-netflix-black/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-netflix-red text-2xl font-bold">Tenjku Anime</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link to="/trending" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Trending
              </Link>
              <Link to="/dubbed" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Dubbed
              </Link>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search anime..."
                  className="bg-netflix-dark/50 text-white pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </form>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-netflix-black/95 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </Link>
            <Link
              to="/trending"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Trending
            </Link>
            <Link
              to="/dubbed"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Dubbed
            </Link>
            <form onSubmit={handleSearch} className="relative px-3 py-2">
              <input
                type="text"
                placeholder="Search anime..."
                className="w-full bg-netflix-dark/50 text-white pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-6 top-4.5 h-5 w-5 text-gray-400" />
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};
