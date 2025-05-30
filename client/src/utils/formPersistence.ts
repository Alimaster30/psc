// Form persistence utility functions

/**
 * Save form data to localStorage
 * @param key Unique key for the form
 * @param data Form data to save
 */
export const saveFormData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error saving form data to localStorage:', error);
  }
};

/**
 * Load form data from localStorage
 * @param key Unique key for the form
 * @returns The saved form data or null if not found
 */
export const loadFormData = <T>(key: string): { data: T; timestamp: string } | null => {
  try {
    const savedData = localStorage.getItem(key);
    if (!savedData) return null;
    
    return JSON.parse(savedData);
  } catch (error) {
    console.error('Error loading form data from localStorage:', error);
    return null;
  }
};

/**
 * Clear saved form data from localStorage
 * @param key Unique key for the form
 */
export const clearFormData = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing form data from localStorage:', error);
  }
};

/**
 * Format relative time for display
 * @param timestamp ISO timestamp string
 * @returns Formatted relative time string (e.g., "2 minutes ago")
 */
export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const savedTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - savedTime.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}; 