
import { supabase } from "@/integrations/supabase/client";

export const api = {
  getHome: async () => {
    try {
      // Get collections with their anime
      const { data: collections, error: collectionsError } = await supabase
        .from('collections')
        .select('*')
        .order('name');
      
      if (collectionsError) throw collectionsError;
      
      // Create a result object with collection data
      const result: Record<string, any> = {};
      
      // For each collection, get the associated anime
      for (const collection of collections || []) {
        const { data: animeRelations, error: relationsError } = await supabase
          .from('collection_anime')
          .select('anime_id')
          .eq('collection_id', collection.id);
        
        if (relationsError) throw relationsError;
        
        if (animeRelations && animeRelations.length > 0) {
          const animeIds = animeRelations.map(rel => rel.anime_id);
          
          const { data: animeItems, error: animeError } = await supabase
            .from('anime')
            .select('*')
            .in('id', animeIds);
          
          if (animeError) throw animeError;
          
          // Format the result to match the expected structure
          result[collection.name] = {
            items: animeItems.map(anime => ({
              id: anime.id,
              name: anime.name,
              img: anime.img,
              overview: anime.overview
            }))
          };
        } else {
          result[collection.name] = { items: [] };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching home data:', error);
      throw new Error('Failed to fetch home data');
    }
  },

  getAnimeById: async (id: string) => {
    try {
      // Get anime details
      const { data: anime, error: animeError } = await supabase
        .from('anime')
        .select('*')
        .eq('id', id)
        .single();
      
      if (animeError) throw animeError;
      
      // Get episodes for this anime
      const { data: episodes, error: episodesError } = await supabase
        .from('episodes')
        .select('*')
        .eq('anime_id', id)
        .order('episode_number');
      
      if (episodesError) throw episodesError;
      
      // Return the anime with episodes
      return {
        ...anime,
        episodes: episodes || []
      };
    } catch (error) {
      console.error('Error fetching anime:', error);
      throw new Error('Failed to fetch anime');
    }
  },

  getEpisode: async (episodeId: string) => {
    try {
      const { data: episode, error } = await supabase
        .from('episodes')
        .select(`
          *,
          anime:anime_id (
            id,
            name
          )
        `)
        .eq('id', episodeId)
        .single();
      
      if (error) throw error;
      
      return {
        id: episode.id,
        name: episode.name,
        poster: episode.poster,
        stream: episode.stream_url,
        animeId: episode.anime_id,
        animeName: episode.anime?.name
      };
    } catch (error) {
      console.error('Error fetching episode:', error);
      throw new Error('Failed to fetch episode');
    }
  },

  getQuality: async (episodeId: string) => {
    try {
      const { data: episode, error } = await supabase
        .from('episodes')
        .select('stream_url')
        .eq('id', episodeId)
        .single();
      
      if (error) throw error;
      
      // Since we're managing our own data, we'll return a simple quality structure
      return {
        sources: [
          {
            url: episode.stream_url,
            quality: "default"
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching quality options:', error);
      throw new Error('Failed to fetch quality options');
    }
  },

  getSlideshow: async () => {
    try {
      // Get some featured anime for the slideshow (limit to 5)
      const { data: anime, error } = await supabase
        .from('anime')
        .select('*')
        .limit(5);
      
      if (error) throw error;
      
      return {
        items: anime.map(item => ({
          ID: item.id,
          name: item.name,
          img: item.horizontal_img || item.img,
          overview: item.overview
        }))
      };
    } catch (error) {
      console.error('Error fetching slideshow:', error);
      throw new Error('Failed to fetch slideshow');
    }
  },

  searchAnime: async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('anime')
        .select('*')
        .ilike('name', `%${query}%`);
      
      if (error) throw error;
      
      return {
        items: data.map(anime => ({
          id: anime.id,
          name: anime.name,
          img: anime.img,
          overview: anime.overview
        }))
      };
    } catch (error) {
      console.error('Error searching anime:', error);
      throw new Error('Failed to search anime');
    }
  },

  getRecommendations: async (tag: string) => {
    try {
      const { data, error } = await supabase
        .from('anime')
        .select('*')
        .contains('tag', [tag]);
      
      if (error) throw error;
      
      return {
        results: data.map(anime => ({
          id: anime.id,
          name: anime.name,
          img: anime.img,
          overview: anime.overview
        }))
      };
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw new Error('Failed to fetch recommendations');
    }
  },

  // Admin APIs
  createAnime: async (animeData: any) => {
    const { data, error } = await supabase
      .from('anime')
      .insert(animeData)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  updateAnime: async (id: string, animeData: any) => {
    const { data, error } = await supabase
      .from('anime')
      .update(animeData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  deleteAnime: async (id: string) => {
    const { error } = await supabase
      .from('anime')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  createEpisode: async (episodeData: any) => {
    const { data, error } = await supabase
      .from('episodes')
      .insert(episodeData)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  updateEpisode: async (id: string, episodeData: any) => {
    const { data, error } = await supabase
      .from('episodes')
      .update(episodeData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  deleteEpisode: async (id: string) => {
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  createCollection: async (collectionData: any) => {
    const { data, error } = await supabase
      .from('collections')
      .insert(collectionData)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  updateCollection: async (id: string, collectionData: any) => {
    const { data, error } = await supabase
      .from('collections')
      .update(collectionData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  deleteCollection: async (id: string) => {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  addAnimeToCollection: async (collectionId: string, animeId: string) => {
    const { data, error } = await supabase
      .from('collection_anime')
      .insert({ collection_id: collectionId, anime_id: animeId })
      .select();
    
    if (error) throw error;
    return data[0];
  },

  removeAnimeFromCollection: async (collectionId: string, animeId: string) => {
    const { error } = await supabase
      .from('collection_anime')
      .delete()
      .eq('collection_id', collectionId)
      .eq('anime_id', animeId);
    
    if (error) throw error;
    return true;
  },

  getAllAnime: async () => {
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  getAllCollections: async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  getCollectionAnime: async (collectionId: string) => {
    const { data, error } = await supabase
      .from('collection_anime')
      .select(`
        anime_id,
        anime:anime_id (*)
      `)
      .eq('collection_id', collectionId);
    
    if (error) throw error;
    return data.map(item => item.anime);
  },

  getAnimeEpisodes: async (animeId: string) => {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('anime_id', animeId)
      .order('episode_number');
    
    if (error) throw error;
    return data;
  }
};
