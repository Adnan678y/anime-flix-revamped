
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Trash, Pencil, Save, X, Film, 
  PlaySquare, FolderPlus, RefreshCcw, ChevronDown, ChevronUp 
} from 'lucide-react';

const Admin = () => {
  const queryClient = useQueryClient();

  // State for managing form visibility
  const [showAnimeForm, setShowAnimeForm] = useState(false);
  const [showEpisodeForm, setShowEpisodeForm] = useState(false);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [editingAnime, setEditingAnime] = useState<any>(null);
  const [editingEpisode, setEditingEpisode] = useState<any>(null);
  const [editingCollection, setEditingCollection] = useState<any>(null);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  
  // Form data states
  const [animeForm, setAnimeForm] = useState({
    name: '',
    overview: '',
    img: '',
    horizontal_img: '',
    release_year: '',
    status: '',
    tag: [] as string[]
  });
  
  const [episodeForm, setEpisodeForm] = useState({
    name: '',
    episode_number: 1,
    poster: '',
    stream_url: '',
    duration: 0,
    anime_id: ''
  });
  
  const [collectionForm, setCollectionForm] = useState({
    name: '',
    description: ''
  });
  
  const [tagInput, setTagInput] = useState('');
  
  // Fetch anime data
  const { 
    data: allAnime = [], 
    isLoading: loadingAnime 
  } = useQuery({
    queryKey: ['admin-all-anime'],
    queryFn: api.getAllAnime
  });
  
  // Fetch collections data
  const { 
    data: allCollections = [], 
    isLoading: loadingCollections 
  } = useQuery({
    queryKey: ['admin-all-collections'],
    queryFn: api.getAllCollections
  });
  
  // Fetch episodes for selected anime
  const { 
    data: animeEpisodes = [], 
    isLoading: loadingEpisodes 
  } = useQuery({
    queryKey: ['admin-anime-episodes', selectedAnimeId],
    queryFn: () => api.getAnimeEpisodes(selectedAnimeId!),
    enabled: !!selectedAnimeId
  });
  
  // Fetch anime in selected collection
  const { 
    data: collectionAnime = [], 
    isLoading: loadingCollectionAnime 
  } = useQuery({
    queryKey: ['admin-collection-anime', selectedCollectionId],
    queryFn: () => api.getCollectionAnime(selectedCollectionId!),
    enabled: !!selectedCollectionId
  });
  
  // Mutations
  const createAnimeMutation = useMutation({
    mutationFn: api.createAnime,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-anime'] });
      toast.success('Anime created successfully');
      resetAnimeForm();
    },
    onError: (error) => {
      toast.error('Failed to create anime: ' + error.message);
    }
  });
  
  const updateAnimeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.updateAnime(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-anime'] });
      toast.success('Anime updated successfully');
      resetAnimeForm();
    },
    onError: (error) => {
      toast.error('Failed to update anime: ' + error.message);
    }
  });
  
  const deleteAnimeMutation = useMutation({
    mutationFn: api.deleteAnime,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-anime'] });
      toast.success('Anime deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete anime: ' + error.message);
    }
  });
  
  const createEpisodeMutation = useMutation({
    mutationFn: api.createEpisode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-anime-episodes', selectedAnimeId] });
      toast.success('Episode created successfully');
      resetEpisodeForm();
    },
    onError: (error) => {
      toast.error('Failed to create episode: ' + error.message);
    }
  });
  
  const updateEpisodeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.updateEpisode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-anime-episodes', selectedAnimeId] });
      toast.success('Episode updated successfully');
      resetEpisodeForm();
    },
    onError: (error) => {
      toast.error('Failed to update episode: ' + error.message);
    }
  });
  
  const deleteEpisodeMutation = useMutation({
    mutationFn: api.deleteEpisode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-anime-episodes', selectedAnimeId] });
      toast.success('Episode deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete episode: ' + error.message);
    }
  });
  
  const createCollectionMutation = useMutation({
    mutationFn: api.createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-collections'] });
      toast.success('Collection created successfully');
      resetCollectionForm();
    },
    onError: (error) => {
      toast.error('Failed to create collection: ' + error.message);
    }
  });
  
  const updateCollectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.updateCollection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-collections'] });
      toast.success('Collection updated successfully');
      resetCollectionForm();
    },
    onError: (error) => {
      toast.error('Failed to update collection: ' + error.message);
    }
  });
  
  const deleteCollectionMutation = useMutation({
    mutationFn: api.deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-collections'] });
      toast.success('Collection deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete collection: ' + error.message);
    }
  });
  
  const addAnimeToCollectionMutation = useMutation({
    mutationFn: ({ collectionId, animeId }: { collectionId: string, animeId: string }) => 
      api.addAnimeToCollection(collectionId, animeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collection-anime', selectedCollectionId] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      toast.success('Anime added to collection');
    },
    onError: (error) => {
      toast.error('Failed to add anime to collection: ' + error.message);
    }
  });
  
  const removeAnimeFromCollectionMutation = useMutation({
    mutationFn: ({ collectionId, animeId }: { collectionId: string, animeId: string }) => 
      api.removeAnimeFromCollection(collectionId, animeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collection-anime', selectedCollectionId] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      toast.success('Anime removed from collection');
    },
    onError: (error) => {
      toast.error('Failed to remove anime from collection: ' + error.message);
    }
  });
  
  // Form handlers
  const handleAnimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAnime) {
      updateAnimeMutation.mutate({
        id: editingAnime.id,
        data: animeForm
      });
    } else {
      createAnimeMutation.mutate(animeForm);
    }
  };
  
  const handleEpisodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEpisode) {
      updateEpisodeMutation.mutate({
        id: editingEpisode.id,
        data: episodeForm
      });
    } else {
      createEpisodeMutation.mutate(episodeForm);
    }
  };
  
  const handleCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCollection) {
      updateCollectionMutation.mutate({
        id: editingCollection.id,
        data: collectionForm
      });
    } else {
      createCollectionMutation.mutate(collectionForm);
    }
  };
  
  const resetAnimeForm = () => {
    setAnimeForm({
      name: '',
      overview: '',
      img: '',
      horizontal_img: '',
      release_year: '',
      status: '',
      tag: []
    });
    setTagInput('');
    setEditingAnime(null);
    setShowAnimeForm(false);
  };
  
  const resetEpisodeForm = () => {
    setEpisodeForm({
      name: '',
      episode_number: 1,
      poster: '',
      stream_url: '',
      duration: 0,
      anime_id: selectedAnimeId || ''
    });
    setEditingEpisode(null);
    setShowEpisodeForm(false);
  };
  
  const resetCollectionForm = () => {
    setCollectionForm({
      name: '',
      description: ''
    });
    setEditingCollection(null);
    setShowCollectionForm(false);
  };
  
  const editAnime = (anime: any) => {
    setEditingAnime(anime);
    setAnimeForm({
      name: anime.name || '',
      overview: anime.overview || '',
      img: anime.img || '',
      horizontal_img: anime.horizontal_img || '',
      release_year: anime.release_year || '',
      status: anime.status || '',
      tag: anime.tag || []
    });
    setShowAnimeForm(true);
  };
  
  const editEpisode = (episode: any) => {
    setEditingEpisode(episode);
    setEpisodeForm({
      name: episode.name || '',
      episode_number: episode.episode_number || 1,
      poster: episode.poster || '',
      stream_url: episode.stream_url || '',
      duration: episode.duration || 0,
      anime_id: episode.anime_id || selectedAnimeId || ''
    });
    setShowEpisodeForm(true);
  };
  
  const editCollection = (collection: any) => {
    setEditingCollection(collection);
    setCollectionForm({
      name: collection.name || '',
      description: collection.description || ''
    });
    setShowCollectionForm(true);
  };
  
  const addTag = () => {
    if (tagInput.trim()) {
      setAnimeForm({
        ...animeForm,
        tag: [...animeForm.tag, tagInput.trim()]
      });
      setTagInput('');
    }
  };
  
  const removeTag = (index: number) => {
    setAnimeForm({
      ...animeForm,
      tag: animeForm.tag.filter((_, i) => i !== index)
    });
  };
  
  const handleAnimeSelect = (animeId: string) => {
    setSelectedAnimeId(animeId);
    setEpisodeForm(prev => ({
      ...prev,
      anime_id: animeId
    }));
  };
  
  const handleCollectionSelect = (collectionId: string) => {
    setSelectedCollectionId(collectionId);
  };
  
  const addAnimeToCollection = (animeId: string) => {
    if (selectedCollectionId) {
      addAnimeToCollectionMutation.mutate({
        collectionId: selectedCollectionId,
        animeId
      });
    }
  };
  
  const removeAnimeFromCollection = (animeId: string) => {
    if (selectedCollectionId) {
      removeAnimeFromCollectionMutation.mutate({
        collectionId: selectedCollectionId,
        animeId
      });
    }
  };
  
  // When selecting an anime, pre-populate the episode form with anime_id
  useEffect(() => {
    if (selectedAnimeId) {
      setEpisodeForm(prev => ({
        ...prev,
        anime_id: selectedAnimeId
      }));
    }
  }, [selectedAnimeId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-netflix-black to-netflix-dark">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>
        
        <Tabs defaultValue="anime" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="anime" className="text-lg">Anime</TabsTrigger>
            <TabsTrigger value="episodes" className="text-lg">Episodes</TabsTrigger>
            <TabsTrigger value="collections" className="text-lg">Collections</TabsTrigger>
          </TabsList>
          
          {/* Anime Tab */}
          <TabsContent value="anime" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Anime List</h2>
              <Button 
                onClick={() => {
                  resetAnimeForm();
                  setShowAnimeForm(!showAnimeForm);
                }}
                className="bg-netflix-red hover:bg-red-700"
              >
                {showAnimeForm ? <X className="mr-2" /> : <Plus className="mr-2" />}
                {showAnimeForm ? 'Cancel' : 'Add Anime'}
              </Button>
            </div>
            
            {showAnimeForm && (
              <div className="bg-netflix-dark p-6 rounded-lg shadow-lg mb-6 animate-fade-in">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {editingAnime ? 'Edit Anime' : 'Add New Anime'}
                </h3>
                <form onSubmit={handleAnimeSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                      <input
                        type="text"
                        value={animeForm.name}
                        onChange={(e) => setAnimeForm({...animeForm, name: e.target.value})}
                        className="w-full bg-netflix-black text-white p-2 rounded"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                      <select
                        value={animeForm.status}
                        onChange={(e) => setAnimeForm({...animeForm, status: e.target.value})}
                        className="w-full bg-netflix-black text-white p-2 rounded"
                      >
                        <option value="">Select Status</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Upcoming">Upcoming</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Release Year</label>
                      <input
                        type="text"
                        value={animeForm.release_year}
                        onChange={(e) => setAnimeForm({...animeForm, release_year: e.target.value})}
                        className="w-full bg-netflix-black text-white p-2 rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Poster Image URL</label>
                      <input
                        type="url"
                        value={animeForm.img}
                        onChange={(e) => setAnimeForm({...animeForm, img: e.target.value})}
                        className="w-full bg-netflix-black text-white p-2 rounded"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Horizontal Image URL</label>
                      <input
                        type="url"
                        value={animeForm.horizontal_img}
                        onChange={(e) => setAnimeForm({...animeForm, horizontal_img: e.target.value})}
                        className="w-full bg-netflix-black text-white p-2 rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          className="flex-grow bg-netflix-black text-white p-2 rounded-l"
                          placeholder="Add tag and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button 
                          type="button"
                          onClick={addTag}
                          className="bg-blue-600 hover:bg-blue-700 rounded-l-none"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {animeForm.tag.map((tag, index) => (
                          <div key={index} className="bg-blue-600 text-white px-2 py-1 rounded flex items-center">
                            <span>{tag}</span>
                            <button 
                              type="button"
                              onClick={() => removeTag(index)}
                              className="ml-2 text-white hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Overview</label>
                    <textarea
                      value={animeForm.overview}
                      onChange={(e) => setAnimeForm({...animeForm, overview: e.target.value})}
                      className="w-full bg-netflix-black text-white p-2 rounded min-h-[100px]"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button"
                      onClick={resetAnimeForm}
                      variant="outline"
                      className="border-gray-500 text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-netflix-red hover:bg-red-700"
                    >
                      <Save className="mr-2 w-4 h-4" />
                      {editingAnime ? 'Update' : 'Save'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="overflow-hidden rounded-lg border border-gray-700">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-netflix-dark">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-netflix-black divide-y divide-gray-700">
                  {loadingAnime ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-400">Loading...</td>
                    </tr>
                  ) : allAnime.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-400">No anime found. Add your first anime!</td>
                    </tr>
                  ) : (
                    allAnime.map((anime: any) => (
                      <tr key={anime.id} className="hover:bg-gray-900">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {anime.img && (
                              <img 
                                src={anime.img} 
                                alt={anime.name} 
                                className="h-10 w-7 object-cover rounded mr-3"
                              />
                            )}
                            <div className="text-sm font-medium text-white">{anime.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {anime.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {anime.release_year || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => editAnime(anime)}
                              variant="outline" 
                              size="sm"
                              className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              onClick={() => deleteAnimeMutation.mutate(anime.id)}
                              variant="outline" 
                              size="sm"
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          {/* Episodes Tab */}
          <TabsContent value="episodes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Episodes</h2>
              <div className="flex space-x-2">
                <select
                  value={selectedAnimeId || ''}
                  onChange={(e) => handleAnimeSelect(e.target.value)}
                  className="bg-netflix-black text-white p-2 rounded border border-gray-700"
                >
                  <option value="">Select Anime</option>
                  {allAnime.map((anime: any) => (
                    <option key={anime.id} value={anime.id}>{anime.name}</option>
                  ))}
                </select>
                
                <Button 
                  onClick={() => {
                    if (!selectedAnimeId) {
                      toast.error('Please select an anime first');
                      return;
                    }
                    resetEpisodeForm();
                    setShowEpisodeForm(!showEpisodeForm);
                  }}
                  className="bg-netflix-red hover:bg-red-700"
                  disabled={!selectedAnimeId}
                >
                  {showEpisodeForm ? <X className="mr-2" /> : <Plus className="mr-2" />}
                  {showEpisodeForm ? 'Cancel' : 'Add Episode'}
                </Button>
              </div>
            </div>
            
            {!selectedAnimeId && (
              <div className="text-center py-8 text-gray-400">
                Please select an anime to manage its episodes
              </div>
            )}
            
            {selectedAnimeId && showEpisodeForm && (
              <div className="bg-netflix-dark p-6 rounded-lg shadow-lg mb-6 animate-fade-in">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {editingEpisode ? 'Edit Episode' : 'Add New Episode'}
                </h3>
                <form onSubmit={handleEpisodeSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Episode Name</label>
                      <input
                        type="text"
                        value={episodeForm.name}
                        onChange={(e) => setEpisodeForm({...episodeForm, name: e.target.value})}
                        className="w-full bg-netflix-black text-white p-2 rounded"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Episode Number</label>
                      <input
                        type="number"
                        value={episodeForm.episode_number}
                        onChange={(e) => setEpisodeForm({...episodeForm, episode_number: parseInt(e.target.value)})}
                        className="w-full bg-netflix-black text-white p-2 rounded"
                        required
                        min="1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Duration (seconds)</label>
                      <input
                        type="number"
                        value={episodeForm.duration}
                        onChange={(e) => setEpisodeForm({...episodeForm, duration: parseInt(e.target.value)})}
                        className="w-full bg-netflix-black text-white p-2 rounded"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Poster Image URL</label>
                      <input
                        type="url"
                        value={episodeForm.poster}
                        onChange={(e) => setEpisodeForm({...episodeForm, poster: e.target.value})}
                        className="w-full bg-netflix-black text-white p-2 rounded"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Stream URL</label>
                    <input
                      type="url"
                      value={episodeForm.stream_url}
                      onChange={(e) => setEpisodeForm({...episodeForm, stream_url: e.target.value})}
                      className="w-full bg-netflix-black text-white p-2 rounded"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button"
                      onClick={() => setShowEpisodeForm(false)}
                      variant="outline"
                      className="border-gray-500 text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-netflix-red hover:bg-red-700"
                    >
                      <Save className="mr-2 w-4 h-4" />
                      {editingEpisode ? 'Update' : 'Save'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
            
            {selectedAnimeId && (
              <div className="overflow-hidden rounded-lg border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-netflix-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Episode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-netflix-black divide-y divide-gray-700">
                    {loadingEpisodes ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-400">Loading...</td>
                      </tr>
                    ) : animeEpisodes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-400">No episodes found. Add your first episode!</td>
                      </tr>
                    ) : (
                      animeEpisodes.map((episode: any) => (
                        <tr key={episode.id} className="hover:bg-gray-900">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {episode.poster && (
                                <img 
                                  src={episode.poster} 
                                  alt={episode.name} 
                                  className="h-10 w-16 object-cover rounded mr-3"
                                />
                              )}
                              <div className="text-sm font-medium text-white">#{episode.episode_number}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {episode.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {episode.duration ? `${Math.floor(episode.duration / 60)}:${(episode.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button 
                                onClick={() => editEpisode(episode)}
                                variant="outline" 
                                size="sm"
                                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button 
                                onClick={() => deleteEpisodeMutation.mutate(episode.id)}
                                variant="outline" 
                                size="sm"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
          
          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Collections List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Collections</h2>
                  <Button 
                    onClick={() => {
                      resetCollectionForm();
                      setShowCollectionForm(!showCollectionForm);
                    }}
                    className="bg-netflix-red hover:bg-red-700"
                  >
                    {showCollectionForm ? <X className="mr-2" /> : <Plus className="mr-2" />}
                    {showCollectionForm ? 'Cancel' : 'Add Collection'}
                  </Button>
                </div>
                
                {showCollectionForm && (
                  <div className="bg-netflix-dark p-4 rounded-lg shadow-lg mb-4 animate-fade-in">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {editingCollection ? 'Edit Collection' : 'Add New Collection'}
                    </h3>
                    <form onSubmit={handleCollectionSubmit} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Collection Name</label>
                        <input
                          type="text"
                          value={collectionForm.name}
                          onChange={(e) => setCollectionForm({...collectionForm, name: e.target.value})}
                          className="w-full bg-netflix-black text-white p-2 rounded"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea
                          value={collectionForm.description}
                          onChange={(e) => setCollectionForm({...collectionForm, description: e.target.value})}
                          className="w-full bg-netflix-black text-white p-2 rounded min-h-[80px]"
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button"
                          onClick={() => setShowCollectionForm(false)}
                          variant="outline"
                          className="border-gray-500 text-gray-300"
                          size="sm"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          className="bg-netflix-red hover:bg-red-700"
                          size="sm"
                        >
                          <Save className="mr-2 w-4 h-4" />
                          {editingCollection ? 'Update' : 'Save'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
                
                <div className="overflow-hidden rounded-lg border border-gray-700">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-netflix-dark">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-netflix-black divide-y divide-gray-700">
                      {loadingCollections ? (
                        <tr>
                          <td colSpan={2} className="px-4 py-4 text-center text-gray-400">Loading...</td>
                        </tr>
                      ) : allCollections.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-4 py-4 text-center text-gray-400">No collections found. Add your first collection!</td>
                        </tr>
                      ) : (
                        allCollections.map((collection: any) => (
                          <tr 
                            key={collection.id} 
                            className={`hover:bg-gray-900 cursor-pointer ${selectedCollectionId === collection.id ? 'bg-gray-800' : ''}`}
                            onClick={() => handleCollectionSelect(collection.id)}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">{collection.name}</div>
                              {collection.description && (
                                <div className="text-xs text-gray-400">{collection.description}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                <Button 
                                  onClick={() => editCollection(collection)}
                                  variant="outline" 
                                  size="sm"
                                  className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button 
                                  onClick={() => deleteCollectionMutation.mutate(collection.id)}
                                  variant="outline" 
                                  size="sm"
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Collection Content */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">
                    {selectedCollectionId 
                      ? `Anime in ${allCollections.find((c: any) => c.id === selectedCollectionId)?.name || 'Collection'}`
                      : 'Select a Collection'}
                  </h2>
                  {selectedCollectionId && (
                    <Button 
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-collection-anime', selectedCollectionId] })}
                      variant="outline"
                      className="border-blue-500 text-blue-500"
                      size="sm"
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  )}
                </div>
                
                {!selectedCollectionId ? (
                  <div className="text-center py-8 text-gray-400">
                    Please select a collection to manage its content
                  </div>
                ) : loadingCollectionAnime ? (
                  <div className="text-center py-8 text-gray-400">
                    Loading collection content...
                  </div>
                ) : (
                  <>
                    <div className="bg-netflix-dark p-4 rounded-lg">
                      <h3 className="text-white font-medium mb-2">Add Anime to Collection</h3>
                      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                        {allAnime.filter((anime: any) => 
                          !collectionAnime.some((ca: any) => ca.id === anime.id)
                        ).map((anime: any) => (
                          <div 
                            key={anime.id}
                            className="flex items-center justify-between p-2 hover:bg-netflix-black rounded"
                          >
                            <div className="flex items-center">
                              {anime.img && (
                                <img 
                                  src={anime.img} 
                                  alt={anime.name} 
                                  className="h-10 w-7 object-cover rounded mr-3"
                                />
                              )}
                              <span className="text-white text-sm">{anime.name}</span>
                            </div>
                            <Button
                              onClick={() => addAnimeToCollection(anime.id)}
                              variant="outline"
                              size="sm"
                              className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-netflix-dark p-4 rounded-lg">
                      <h3 className="text-white font-medium mb-2">Anime in This Collection</h3>
                      {collectionAnime.length === 0 ? (
                        <div className="text-center py-4 text-gray-400">
                          No anime in this collection yet
                        </div>
                      ) : (
                        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                          {collectionAnime.map((anime: any) => (
                            <div 
                              key={anime.id}
                              className="flex items-center justify-between p-2 hover:bg-netflix-black rounded"
                            >
                              <div className="flex items-center">
                                {anime.img && (
                                  <img 
                                    src={anime.img} 
                                    alt={anime.name} 
                                    className="h-10 w-7 object-cover rounded mr-3"
                                  />
                                )}
                                <span className="text-white text-sm">{anime.name}</span>
                              </div>
                              <Button
                                onClick={() => removeAnimeFromCollection(anime.id)}
                                variant="outline"
                                size="sm"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
