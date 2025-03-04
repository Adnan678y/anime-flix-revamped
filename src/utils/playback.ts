
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
    
    return Object.entries(positions)
      .map(([episodeId, data]) => ({
        ID: episodeId,
        ...data
      }))
      .sort((a, b) => 
        new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime()
      )
      .slice(0, limit)
      .filter(item => 
        // Only include items with more than 10 seconds progress
        // and less than 95% complete
        item.progress > 10 && 
        item.totalDuration > 0 &&
        (item.progress / item.totalDuration) < 0.95
      );
  } catch (error) {
    console.error('Failed to get continue watching items:', error);
    return [];
  }
};

// Function to update playback position with metadata
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
  }
};
