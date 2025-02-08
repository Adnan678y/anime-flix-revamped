
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { AnimeGrid } from '@/components/AnimeGrid';

const Index = () => {
  const { data: homeData, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: api.getHome,
  });

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <AnimeGrid
          title="Popular Anime"
          items={homeData?.Popular?.items || []}
          isLoading={isLoading}
        />
        <AnimeGrid
          title="New Releases"
          items={homeData?.["New release"]?.items || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Index;
