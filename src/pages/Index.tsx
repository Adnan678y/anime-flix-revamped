
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { AnimeGrid } from '@/components/AnimeGrid';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Index = () => {
  const { data: homeData, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: api.getHome,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-netflix-black to-netflix-dark">
      <Navbar />
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-12">
          {Object.entries(homeData || {}).map(([collectionName, collection]: [string, any]) => (
            <AnimeGrid
              key={collectionName}
              title={collectionName}
              items={collection?.items || []}
              isLoading={isLoading}
            />
          ))}
          
          {/* Admin Panel Link */}
          <div className="mt-8 flex justify-center">
            <Link 
              to="/admin" 
              className="flex items-center gap-2 px-4 py-2 bg-netflix-dark text-netflix-gray hover:text-white rounded-md transition-colors"
            >
              <Shield className="w-5 h-5" />
              <span>Admin Panel</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
