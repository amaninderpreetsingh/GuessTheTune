/**
 * Authentication storage utility
 * Handles storing and retrieving Spotify auth tokens in localStorage
 * This approach works better than cookies for cross-origin requests on mobile Safari
 */

const AUTH_STORAGE_KEY = 'spotify_auth';

/**
 * Store authentication data in localStorage
 */
export const setAuthData = (authData) => {
  try {
    const authWithTimestamp = {
      ...authData,
      issued_at: Date.now(),
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authWithTimestamp));
    return true;
  } catch (error) {
    console.error('Failed to store auth data:', error);
    return false;
  }
};

/**
 * Get authentication data from localStorage
 */
export const getAuthData = () => {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to retrieve auth data:', error);
    return null;
  }
};

/**
 * Get the access token (for use in API requests)
 */
export const getAccessToken = () => {
  const authData = getAuthData();
  return authData?.access_token || null;
};

/**
 * Check if the access token is expired
 */
export const isTokenExpired = () => {
  const authData = getAuthData();
  if (!authData || !authData.issued_at) {
    return true;
  }

  const now = Date.now();
  const expiresIn = (authData.expires_in || 3600) * 1000; // Convert to milliseconds
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

  return (now - authData.issued_at) >= (expiresIn - bufferTime);
};

/**
 * Clear authentication data (logout)
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear auth data:', error);
    return false;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const authData = getAuthData();
  return !!authData && !!authData.access_token && !!authData.refresh_token;
};
