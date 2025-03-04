
const PLAYBACK_STORAGE_KEY = 'video-playback-positions';

export interface PlaybackPosition {
  progress: number;
  totalDuration: number;
  lastWatched: string;
  name?: string;
  img?: string;
  animeName?: string;
}

export interface PlaybackPositions {
  [episodeId: string]: PlaybackPosition;
}

// Function to get all playback positions
export const getPlaybackPositions = (): PlaybackPositions => {
  try {
    const positionsJSON = localStorage.getItem(PLAYBACK_STORAGE_KEY) || '{}';
    return JSON.parse(positionsJSON);
  } catch (error) {
    console.error('Failed to load playback positions:', error);
    return {};
  }
};

// Function to get a specific playback position
export const getPlaybackPosition = (episodeId: string): PlaybackPosition | null => {
  const positions = getPlaybackPositions();
  return positions[episodeId] || null;
};

// Function to save a playback position
export const savePlaybackPosition = (
  episodeId: string, 
  position: PlaybackPosition
): void => {
  try {
    const positions = getPlaybackPositions();
    
    // Update the position for this episode
    positions[episodeId] = {
      ...position,
      lastWatched: new Date().toISOString()
    };
    
    // Save back to localStorage
    localStorage.setItem(PLAYBACK_STORAGE_KEY, JSON.stringify(positions));
  } catch (error) {
    console.error('Failed to save playback position:', error);
  }
};

// Function to get continue watching items, sorted by most recently watched
export const getContinueWatchingItems = (limit: number = 10): Array<PlaybackPosition & { ID: string }> => {
  try {
    const positions = getPlaybackPositions();
    console.log('Raw playback positions:', positions);
    
    const items = Object.entries(positions)
      .map(([episodeId, data]) => ({
        ID: episodeId,
        ...data
      }))
      .sort((a, b) => 
        new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime()
      )
      .slice(0, limit)
      // Relaxed filtering criteria - only filter out completed videos (95%+)
      .filter(item => 
        item.totalDuration > 0 &&
        (item.progress / item.totalDuration) < 0.95
      );
    
    console.log('Continue watching items after processing:', items);
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
  const position = getPlaybackPosition(episodeId);
  if (position) {
    savePlaybackPosition(episodeId, {
      ...position,
      ...metadata
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

// Helper function to add a test video for development purposes
export const addTestVideo = () => {
  savePlaybackPosition('test-episode-1', {
    progress: 300,
    totalDuration: 1800,
    lastWatched: new Date().toISOString(),
    name: 'Test Episode 1',
    img: 'https://assets-prd.ignimgs.com/2021/10/14/demonslayer-art-1634244394273.png',
    animeName: 'Test Anime'
  });
};
