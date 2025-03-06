
const BASE_URL = 'https://nekektkt.vercel.app';

export const api = {
  getHome: async () => {
    try {
      const response = await fetch(`${BASE_URL}/home`);
      if (!response.ok) throw new Error('Failed to fetch home data');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error (getHome):', error);
      throw error;
    }
  },

  getAnimeById: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/id/${id}`);
      if (!response.ok) throw new Error('Failed to fetch anime');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error (getAnimeById):', error);
      throw error;
    }
  },

  getEpisode: async (episodeId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/episode/${episodeId}`);
      if (!response.ok) throw new Error('Failed to fetch episode');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error (getEpisode):', error);
      throw error;
    }
  },

  getQuality: async (episodeId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/quality/${episodeId}`);
      if (!response.ok) throw new Error('Failed to fetch quality options');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error (getQuality):', error);
      throw error;
    }
  },

  getSlideshow: async () => {
    try {
      const response = await fetch(`${BASE_URL}/slideshow`);
      if (!response.ok) throw new Error('Failed to fetch slideshow');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error (getSlideshow):', error);
      throw error;
    }
  },

  searchAnime: async (query: string) => {
    try {
      const response = await fetch(`${BASE_URL}/query?name=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search anime');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error (searchAnime):', error);
      throw error;
    }
  },

  getRecommendations: async (tag: string) => {
    try {
      const response = await fetch(`${BASE_URL}/query?tag=${encodeURIComponent(tag)}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      // Ensure we return data with the items property for compatibility
      return data;
    } catch (error) {
      console.error('API Error (getRecommendations):', error);
      throw error;
    }
  },
};
