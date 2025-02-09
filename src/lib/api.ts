
const BASE_URL = 'https://nekektkt.vercel.app';

export const api = {
  getHome: async () => {
    const response = await fetch(`${BASE_URL}/home`);
    if (!response.ok) throw new Error('Failed to fetch home data');
    return response.json();
  },

  getAnimeById: async (id: string) => {
    const response = await fetch(`${BASE_URL}/id/${id}`);
    if (!response.ok) throw new Error('Failed to fetch anime');
    return response.json();
  },

  getEpisode: async (episodeId: string) => {
    const response = await fetch(`${BASE_URL}/episode/${episodeId}`);
    if (!response.ok) throw new Error('Failed to fetch episode');
    return response.json();
  },

  getQuality: async (episodeId: string) => {
    const response = await fetch(`${BASE_URL}/quality/${episodeId}`);
    if (!response.ok) throw new Error('Failed to fetch quality options');
    return response.json();
  },

  getSlideshow: async () => {
    const response = await fetch(`${BASE_URL}/slideshow`);
    if (!response.ok) throw new Error('Failed to fetch slideshow');
    return response.json();
  },

  searchAnime: async (query: string) => {
    const response = await fetch(`${BASE_URL}/query?name=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search anime');
    return response.json();
  },

  getRecommendations: async (tag: string) => {
    const response = await fetch(`${BASE_URL}/query?tag=${encodeURIComponent(tag)}`);
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return response.json();
  },
};
