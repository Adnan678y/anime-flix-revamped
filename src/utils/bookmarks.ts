
// Function to get bookmarks from cookie
export const getBookmarks = (): number[] => {
  const bookmarksCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('bookmarks='));
  
  if (bookmarksCookie) {
    try {
      return JSON.parse(decodeURIComponent(bookmarksCookie.split('=')[1]));
    } catch {
      return [];
    }
  }
  return [];
};

// Function to save bookmarks to cookie
export const saveBookmarks = (bookmarks: number[]) => {
  // Set cookie to expire in 30 days
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  
  document.cookie = `bookmarks=${encodeURIComponent(JSON.stringify(bookmarks))}; expires=${expiryDate.toUTCString()}; path=/`;
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

