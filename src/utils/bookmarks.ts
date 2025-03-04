
// Function to get bookmarks from localStorage
export const getBookmarks = (): number[] => {
  try {
    const bookmarks = localStorage.getItem('bookmarks');
    if (bookmarks) {
      return JSON.parse(bookmarks);
    }
  } catch (error) {
    console.error('Error getting bookmarks:', error);
  }
  return [];
};

// Function to save bookmarks to localStorage
export const saveBookmarks = (bookmarks: number[]) => {
  try {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Error saving bookmarks:', error);
  }
};

// Function to toggle bookmark
export const toggleBookmark = (episodeId: number): boolean => {
  const bookmarks = getBookmarks();
  const isBookmarked = bookmarks.includes(episodeId);
  
  if (isBookmarked) {
    saveBookmarks(bookmarks.filter(id => id !== episodeId));
    return false;
  } else {
    saveBookmarks([...bookmarks, episodeId]);
    return true;
  }
};

// Function to check if an episode is bookmarked
export const isBookmarked = (episodeId: number): boolean => {
  return getBookmarks().includes(episodeId);
};
