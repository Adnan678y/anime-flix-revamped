
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RefreshCcw, Database, UploadCloud } from 'lucide-react';

const SeedData = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState(0);
  const [seedLog, setSeedLog] = useState<string[]>([]);

  // Sample data
  const sampleAnime = [
    {
      name: "Attack on Titan",
      overview: "In a world where humanity lives within cities surrounded by enormous walls that protect them from gigantic man-eating humanoids referred to as Titans, the story follows Eren Yeager, who vows to retake the world after a Titan brings about the destruction of his hometown and the death of his mother.",
      img: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
      horizontal_img: "https://cdn.myanimelist.net/images/anime/1909/135051.jpg",
      release_year: "2013",
      status: "Completed",
      tag: ["action", "drama", "fantasy", "trending"]
    },
    {
      name: "Demon Slayer",
      overview: "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to find a cure for his sister and to avenge his family.",
      img: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
      horizontal_img: "https://cdn.myanimelist.net/images/anime/1949/121759.jpg",
      release_year: "2019",
      status: "Ongoing",
      tag: ["action", "supernatural", "trending"]
    },
    {
      name: "My Hero Academia",
      overview: "In a world where people with superpowers (known as 'Quirks') are the norm, Izuku Midoriya has dreams of one day becoming a Hero, despite being bullied by his classmates for not having a Quirk. After being the only one to try and save his childhood friend, Katsuki, from a villain, All Might, the world's greatest Hero, bestows upon him his own quirk, 'One For All'.",
      img: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
      horizontal_img: "https://cdn.myanimelist.net/images/anime/1600/132452.jpg",
      release_year: "2016",
      status: "Ongoing",
      tag: ["action", "school", "shounen"]
    },
    {
      name: "Fullmetal Alchemist: Brotherhood",
      overview: "After a horrific alchemy experiment goes wrong in the Elric household, brothers Edward and Alphonse are left in a catastrophic new reality. They search for the Philosopher's Stone to restore their bodies.",
      img: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
      horizontal_img: "https://cdn.myanimelist.net/images/anime/1208/94745.jpg",
      release_year: "2009",
      status: "Completed",
      tag: ["action", "adventure", "drama", "fantasy"]
    },
    {
      name: "One Punch Man",
      overview: "The story of Saitama, a hero who can defeat any enemy with a single punch but seeks a worthy opponent after growing bored by a lack of challenge.",
      img: "https://cdn.myanimelist.net/images/anime/12/76049.jpg",
      horizontal_img: "https://cdn.myanimelist.net/images/anime/1797/111800.jpg",
      release_year: "2015",
      status: "Ongoing",
      tag: ["action", "comedy", "sci-fi", "superhero"]
    },
    {
      name: "Death Note",
      overview: "Light Yagami discovers a notebook that kills anyone whose name is written in it. He decides to use it to rid the world of criminals, but a detective known as L tries to track him down.",
      img: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
      horizontal_img: "https://cdn.myanimelist.net/images/anime/10/15627.jpg",
      release_year: "2006",
      status: "Completed",
      tag: ["mystery", "psychological", "supernatural", "thriller"]
    },
    {
      name: "Jujutsu Kaisen",
      overview: "Yuji Itadori, a kind-hearted teenager, joins his school's Occult Club for fun, but discovers that its members are actual sorcerers who can manipulate the energy between beings for their own use. He hears about a cursed object - a rotting finger, tainted with the curse of Ryomen Sukuna, a demon.",
      img: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
      horizontal_img: "https://cdn.myanimelist.net/images/anime/1896/130240.jpg",
      release_year: "2020",
      status: "Ongoing",
      tag: ["action", "horror", "supernatural", "trending"]
    },
    {
      name: "Spy x Family",
      overview: "A spy on an undercover mission gets married and adopts a child as part of his cover. His wife and daughter have secrets of their own, and neither family member knows the other's true identity.",
      img: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg",
      horizontal_img: "https://cdn.myanimelist.net/images/anime/1111/121262.jpg",
      release_year: "2022",
      status: "Ongoing",
      tag: ["action", "comedy", "spy", "dubbed"]
    }
  ];

  const sampleCollections = [
    { name: "Popular Anime", description: "The most watched anime series of all time" },
    { name: "New Releases", description: "Fresh anime content that just came out" },
    { name: "Action", description: "Heart-pumping action anime series" },
    { name: "Drama", description: "Emotional and heartfelt stories" },
    { name: "Fantasy", description: "Magical worlds and extraordinary powers" }
  ];

  // Function to clear all data
  const clearAllData = async () => {
    try {
      setSeedLog(prev => [...prev, "Clearing existing data..."]);
      
      // Clear collection_anime first (foreign key constraint)
      await supabase.from('collection_anime').delete().neq('anime_id', 'dummy');
      setSeedLog(prev => [...prev, "✓ Cleared collection_anime"]);
      
      // Clear episodes (foreign key constraint)
      await supabase.from('episodes').delete().neq('anime_id', 'dummy');
      setSeedLog(prev => [...prev, "✓ Cleared episodes"]);
      
      // Clear collections
      await supabase.from('collections').delete().neq('id', 'dummy');
      setSeedLog(prev => [...prev, "✓ Cleared collections"]);
      
      // Clear anime
      await supabase.from('anime').delete().neq('id', 'dummy');
      setSeedLog(prev => [...prev, "✓ Cleared anime"]);
      
      setSeedLog(prev => [...prev, "All data cleared successfully"]);
      return true;
    } catch (error: any) {
      console.error('Error clearing data:', error);
      setSeedLog(prev => [...prev, `❌ Error clearing data: ${error.message}`]);
      throw error;
    }
  };

  // Function to seed collections
  const seedCollections = async () => {
    try {
      setSeedLog(prev => [...prev, "Seeding collections..."]);
      
      const collectionsData = [];
      for (const collection of sampleCollections) {
        const { data, error } = await supabase
          .from('collections')
          .insert(collection)
          .select();
        
        if (error) throw error;
        
        collectionsData.push(data[0]);
        setSeedLog(prev => [...prev, `✓ Added collection: ${collection.name}`]);
      }
      
      setSeedLog(prev => [...prev, `${collectionsData.length} collections seeded successfully`]);
      return collectionsData;
    } catch (error: any) {
      console.error('Error seeding collections:', error);
      setSeedLog(prev => [...prev, `❌ Error seeding collections: ${error.message}`]);
      throw error;
    }
  };

  // Function to seed anime
  const seedAnime = async () => {
    try {
      setSeedLog(prev => [...prev, "Seeding anime..."]);
      
      const animeData = [];
      for (const anime of sampleAnime) {
        const { data, error } = await supabase
          .from('anime')
          .insert(anime)
          .select();
        
        if (error) throw error;
        
        animeData.push(data[0]);
        setSeedLog(prev => [...prev, `✓ Added anime: ${anime.name}`]);
      }
      
      setSeedLog(prev => [...prev, `${animeData.length} anime seeded successfully`]);
      return animeData;
    } catch (error: any) {
      console.error('Error seeding anime:', error);
      setSeedLog(prev => [...prev, `❌ Error seeding anime: ${error.message}`]);
      throw error;
    }
  };

  // Function to seed episodes
  const seedEpisodes = async (animeData: any[]) => {
    try {
      setSeedLog(prev => [...prev, "Seeding episodes..."]);
      
      let episodeCount = 0;
      
      for (const anime of animeData) {
        // Create 2-5 episodes for each anime
        const episodeNum = Math.floor(Math.random() * 4) + 2;
        
        for (let i = 1; i <= episodeNum; i++) {
          const episode = {
            anime_id: anime.id,
            name: `Episode ${i}: ${getRandomEpisodeTitle()}`,
            episode_number: i,
            poster: anime.img, // Use anime image as poster for simplicity
            stream_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Sample video
            duration: Math.floor(Math.random() * 600) + 1200 // Random duration between 20-30 minutes
          };
          
          const { error } = await supabase
            .from('episodes')
            .insert(episode);
          
          if (error) throw error;
          
          episodeCount++;
        }
        
        setSeedLog(prev => [...prev, `✓ Added ${episodeNum} episodes for: ${anime.name}`]);
      }
      
      setSeedLog(prev => [...prev, `${episodeCount} episodes seeded successfully`]);
      return episodeCount;
    } catch (error: any) {
      console.error('Error seeding episodes:', error);
      setSeedLog(prev => [...prev, `❌ Error seeding episodes: ${error.message}`]);
      throw error;
    }
  };

  // Function to seed collection_anime relationships
  const seedCollectionAnime = async (collections: any[], animeData: any[]) => {
    try {
      setSeedLog(prev => [...prev, "Assigning anime to collections..."]);
      
      let relationCount = 0;
      
      for (const collection of collections) {
        // Get a random number of anime for each collection (between 3 and 6)
        const numAnime = Math.floor(Math.random() * 4) + 3;
        const shuffledAnime = [...animeData].sort(() => 0.5 - Math.random());
        const selectedAnime = shuffledAnime.slice(0, numAnime);
        
        for (const anime of selectedAnime) {
          const relation = {
            collection_id: collection.id,
            anime_id: anime.id
          };
          
          const { error } = await supabase
            .from('collection_anime')
            .insert(relation);
          
          if (error) {
            // Skip duplicates (might happen if we run the seeder multiple times)
            if (!error.message.includes('duplicate')) {
              throw error;
            }
          } else {
            relationCount++;
          }
        }
        
        setSeedLog(prev => [...prev, `✓ Added ${numAnime} anime to collection: ${collection.name}`]);
      }
      
      setSeedLog(prev => [...prev, `${relationCount} collection-anime relationships seeded successfully`]);
      return relationCount;
    } catch (error: any) {
      console.error('Error seeding collection_anime:', error);
      setSeedLog(prev => [...prev, `❌ Error seeding collection_anime: ${error.message}`]);
      throw error;
    }
  };

  // Helper function to generate random episode titles
  const getRandomEpisodeTitle = () => {
    const titles = [
      "The Beginning", "New Horizons", "Darkness Falls", "Rising Hope",
      "Unexpected Encounter", "The Battle Begins", "Lost Memories", "Reunion",
      "Betrayal", "Hidden Truth", "The Promise", "A New Power",
      "Into the Unknown", "Final Countdown", "Rebirth", "Awakening",
      "The Decision", "Breaking Point", "Last Stand", "Dawn of Hope"
    ];
    
    return titles[Math.floor(Math.random() * titles.length)];
  };

  // Main seed function
  const seedDatabase = async () => {
    try {
      setIsSeeding(true);
      setSeedLog(["Starting database seeding process..."]);
      setSeedProgress(10);
      
      // Clear existing data
      await clearAllData();
      setSeedProgress(25);
      
      // Seed collections
      const collections = await seedCollections();
      setSeedProgress(40);
      
      // Seed anime
      const animeData = await seedAnime();
      setSeedProgress(60);
      
      // Seed episodes
      await seedEpisodes(animeData);
      setSeedProgress(80);
      
      // Seed collection_anime relationships
      await seedCollectionAnime(collections, animeData);
      setSeedProgress(100);
      
      setSeedLog(prev => [...prev, "✅ Database seeding completed successfully!"]);
      toast.success("Database seeded successfully!");
    } catch (error: any) {
      console.error('Error seeding database:', error);
      setSeedLog(prev => [...prev, `❌ ERROR: ${error.message}`]);
      toast.error("Error seeding database: " + error.message);
      setSeedProgress(0);
    } finally {
      setIsSeeding(false);
    }
  };

  // Query to check current database state
  const { data: dbStats, isLoading: loadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['seed-db-stats'],
    queryFn: async () => {
      const anime = await supabase.from('anime').select('*', { count: 'exact' });
      const episodes = await supabase.from('episodes').select('*', { count: 'exact' });
      const collections = await supabase.from('collections').select('*', { count: 'exact' });
      const relations = await supabase.from('collection_anime').select('*', { count: 'exact' });
      
      return {
        animeCount: anime.count || 0,
        episodeCount: episodes.count || 0,
        collectionCount: collections.count || 0,
        relationCount: relations.count || 0
      };
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-netflix-black to-netflix-dark">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Database Seeder</h1>
            <p className="text-netflix-gray">
              This tool will populate your database with sample anime data
            </p>
          </div>
          
          <div className="bg-netflix-dark p-6 rounded-lg shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Database className="mr-2" />
                Current Database Stats
              </h2>
              <Button onClick={() => refetchStats()} variant="outline" size="sm">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            {loadingStats ? (
              <div className="text-center py-4 text-gray-400">Loading stats...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-netflix-black p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">{dbStats?.animeCount}</div>
                  <div className="text-sm text-netflix-gray">Anime</div>
                </div>
                <div className="bg-netflix-black p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">{dbStats?.episodeCount}</div>
                  <div className="text-sm text-netflix-gray">Episodes</div>
                </div>
                <div className="bg-netflix-black p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">{dbStats?.collectionCount}</div>
                  <div className="text-sm text-netflix-gray">Collections</div>
                </div>
                <div className="bg-netflix-black p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">{dbStats?.relationCount}</div>
                  <div className="text-sm text-netflix-gray">Collection-Anime</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-netflix-dark p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <UploadCloud className="mr-2" />
                Seed Database
              </h2>
            </div>
            
            <div className="mb-6">
              <p className="text-white mb-2">This will:</p>
              <ul className="list-disc list-inside text-netflix-gray space-y-1 mb-4">
                <li>Clear all existing anime, episodes, collections, and relationships</li>
                <li>Create {sampleCollections.length} sample collections</li>
                <li>Create {sampleAnime.length} sample anime with episodes</li>
                <li>Add anime to random collections</li>
              </ul>
              <div className="bg-yellow-900/20 border border-yellow-700/30 rounded p-3 text-yellow-200 text-sm">
                <strong>Warning:</strong> This will delete all existing content in your database. Make sure you know what you're doing.
              </div>
            </div>
            
            {seedProgress > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-netflix-gray mb-1">
                  <span>Progress</span>
                  <span>{seedProgress}%</span>
                </div>
                <div className="w-full bg-netflix-black rounded-full h-2.5">
                  <div 
                    className="bg-netflix-red h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${seedProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="flex justify-center">
              <Button 
                onClick={seedDatabase}
                disabled={isSeeding}
                className="bg-netflix-red hover:bg-red-700 px-8 py-3 text-lg"
              >
                {isSeeding ? "Seeding Database..." : "Seed Database"}
              </Button>
            </div>
            
            {seedLog.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-2">Seed Log:</h3>
                <div className="bg-netflix-black p-3 rounded max-h-[300px] overflow-y-auto text-sm font-mono">
                  {seedLog.map((log, index) => (
                    <div key={index} className={`mb-1 ${log.includes('❌') ? 'text-red-400' : log.includes('✓') ? 'text-green-400' : 'text-gray-400'}`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeedData;
