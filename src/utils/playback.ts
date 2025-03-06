
const PLAYBACK_STORAGE_KEY = 'video-playback-positions';

export interface PlaybackPosition {
  progress: number;
  totalDuration: number;
  lastWatched: string;
  name?: string;
  img?: string;
  animeName?: string;
  completed?: boolean;
}

export interface PlaybackPositions {
  [episodeId: string]: PlaybackPosition;
}

// Function to get all playback positions with optimized caching
let cachedPositions: PlaybackPositions | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 3000; // Cache valid for 3 seconds

// Function to get all playback positions
export const getPlaybackPositions = (): PlaybackPositions => {
  try {
    // Use cached version if available and recent
    const now = Date.now();
    if (cachedPositions && (now - cacheTimestamp < CACHE_TTL)) {
      return cachedPositions;
    }
    
    // Otherwise load from localStorage
    const positionsJSON = localStorage.getItem(PLAYBACK_STORAGE_KEY) || '{}';
    cachedPositions = JSON.parse(positionsJSON);
    cacheTimestamp = now;
    return cachedPositions;
  } catch (error) {
    console.error('Failed to load playback positions:', error);
    return {};
  }
};

// Function to get a specific playback position
export const getPlaybackPosition = (episodeId: string): PlaybackPosition | null => {
  if (!episodeId) {
    console.error('Invalid episodeId provided to getPlaybackPosition');
    return null;
  }
  const positions = getPlaybackPositions();
  return positions[episodeId] || null;
};

// Function to save a playback position with efficient updates
export const savePlaybackPosition = (
  episodeId: string, 
  position: PlaybackPosition
): void => {
  try {
    if (!episodeId) {
      console.error('Invalid episodeId provided to savePlaybackPosition');
      return;
    }

    console.log(`Saving playback for episode ${episodeId}:`, position);
    
    const positions = getPlaybackPositions();
    
    // Calculate if video is completed based on progress
    const isCompleted = position.totalDuration > 0 && 
      (position.progress / position.totalDuration) >= 0.95;
    
    // Update the position for this episode
    positions[episodeId] = {
      ...position,
      lastWatched: new Date().toISOString(),
      completed: isCompleted
    };
    
    // Invalidate cache
    cachedPositions = positions;
    cacheTimestamp = Date.now();
    
    // Save to localStorage
    localStorage.setItem(PLAYBACK_STORAGE_KEY, JSON.stringify(positions));
    
    // Dispatch a storage event to notify other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: PLAYBACK_STORAGE_KEY,
      newValue: JSON.stringify(positions)
    }));
  } catch (error) {
    console.error('Failed to save playback position:', error);
  }
};

// Function to get continue watching items, sorted by most recently watched
export const getContinueWatchingItems = (limit: number = 10): Array<PlaybackPosition & { ID: string }> => {
  try {
    const positions = getPlaybackPositions();
    
    const items = Object.entries(positions)
      .map(([episodeId, data]) => ({
        ID: episodeId,
        ...data
      }))
      .sort((a, b) => 
        new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime()
      )
      .filter(item => 
        // Only include items with valid duration that aren't marked as completed
        item.totalDuration > 0 && 
        !item.completed &&
        // Ensure there's some actual progress (more than 10 seconds)
        item.progress > 10 &&
        // And haven't reached the end (less than 95%)
        (item.progress / item.totalDuration) < 0.95
      )
      .slice(0, limit);
    
    console.log('Continue watching items:', items);
    return items;
  } catch (error) {
    console.error('Failed to get continue watching items:', error);
    return [];
  }
};

// Function to update playback with metadata
export const updatePlaybackWithMetadata = (
  episodeId: string,
  metadata: { name?: string; img?: string; animeName?: string }
): void => {
  if (!episodeId) {
    console.error('Invalid episodeId provided to updatePlaybackWithMetadata');
    return;
  }

  console.log(`Updating metadata for episode ${episodeId}:`, metadata);
  
  const position = getPlaybackPosition(episodeId);
  if (position) {
    // Only update fields that are provided and not empty
    const updatedMetadata: Partial<PlaybackPosition> = {};
    if (metadata.name) updatedMetadata.name = metadata.name;
    if (metadata.img) updatedMetadata.img = metadata.img;
    if (metadata.animeName) updatedMetadata.animeName = metadata.animeName;
    
    savePlaybackPosition(episodeId, {
      ...position,
      ...updatedMetadata
    });
  } else {
    // Create a new playback position if it doesn't exist
    savePlaybackPosition(episodeId, {
      progress: 0,
      totalDuration: 0,
      lastWatched: new Date().toISOString(),
      ...metadata
    });
  }
};

// Function to mark an episode as watched/unwatched
export const markEpisodeAsWatched = (episodeId: string, watched: boolean): void => {
  if (!episodeId) return;
  
  const position = getPlaybackPosition(episodeId);
  if (position) {
    if (watched) {
      // Mark as completed by setting progress to 99% of duration
      savePlaybackPosition(episodeId, {
        ...position,
        progress: position.totalDuration * 0.99,
        completed: true
      });
    } else {
      // Mark as not completed by resetting progress to 0
      savePlaybackPosition(episodeId, {
        ...position,
        progress: 0,
        completed: false
      });
    }
  }
};

// Function to clear all watch history
export const clearWatchHistory = (): void => {
  localStorage.removeItem(PLAYBACK_STORAGE_KEY);
  cachedPositions = {};
  cacheTimestamp = Date.now();
  
  // Notify other tabs
  window.dispatchEvent(new StorageEvent('storage', {
    key: PLAYBACK_STORAGE_KEY,
    newValue: '{}'
  }));
};

// Function to add a test video for development purposes
export const addTestVideo = () => {
  savePlaybackPosition('test-episode-1', {
    progress: 300,
    totalDuration: 1800,
    lastWatched: new Date().toISOString(),
    name: 'Test Episode 1',
    img: 'https://assets-prd.ignimgs.com/2021/10/14/demonslayer-art-1634244394273.png',
    animeName: 'Test Anime'
  });
  
  savePlaybackPosition('test-episode-2', {
    progress: 450,
    totalDuration: 1500,
    lastWatched: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    name: 'Test Episode 2',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfvg0u2c4IkVIzhVsJgY0ySPgqa5O5pXwXvhs5RG56Hovth_-ulnvU1Zkn&s=10',
    animeName: 'Another Test Anime'
  });
};
