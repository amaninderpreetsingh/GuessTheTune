const axios = require('axios');

/**
 * Exchanges authorization code for access and refresh tokens
 * @param {string} code - Authorization code from Spotify
 * @returns {Promise<Object>} Token data including access_token and refresh_token
 */
async function exchangeCodeForTokens(code) {
  const tokenUrl = 'https://accounts.spotify.com/api/token';

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  });

  const authHeader = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in,
      token_type: response.data.token_type,
    };
  } catch (error) {
    throw new Error('Failed to exchange authorization code');
  }
}

/**
 * Refreshes the access token using the refresh token
 * @param {string} refreshToken - Refresh token from initial auth
 * @returns {Promise<Object>} New token data
 */
async function refreshAccessToken(refreshToken) {
  const tokenUrl = 'https://accounts.spotify.com/api/token';

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const authHeader = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return {
      access_token: response.data.access_token,
      refresh_token: refreshToken, // Keep the same refresh token
      expires_in: response.data.expires_in,
      token_type: response.data.token_type,
    };
  } catch (error) {
    throw new Error('Failed to refresh access token');
  }
}

/**
 * Fetches user's Spotify playlists
 * @param {string} accessToken - Valid Spotify access token
 * @returns {Promise<Array>} Array of playlist objects
 */
async function getUserPlaylists(accessToken) {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      params: {
        limit: 50,
      },
    });

    return response.data.items.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      imageUrl: playlist.images[0]?.url || null,
      trackCount: playlist.tracks.total,
    }));
  } catch (error) {
    throw new Error('Failed to fetch playlists');
  }
}

/**
 * Fetches all tracks from a specific playlist
 * @param {string} accessToken - Valid Spotify access token
 * @param {string} playlistId - Spotify playlist ID
 * @returns {Promise<Array>} Array of track objects
 */
async function getPlaylistTracks(accessToken, playlistId) {
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params: {
          limit: 100,
        },
      }
    );

    return response.data.items
      .filter(item => item.track && item.track.uri) // Filter out null tracks
      .map(item => ({
        id: item.track.id,
        uri: item.track.uri,
        name: item.track.name,
        artist: item.track.artists.map(a => a.name).join(', '),
        album: item.track.album.name,
        imageUrl: item.track.album.images[0]?.url || null,
        duration: item.track.duration_ms,
      }));
  } catch (error) {
    throw new Error('Failed to fetch playlist tracks');
  }
}

module.exports = {
  exchangeCodeForTokens,
  refreshAccessToken,
  getUserPlaylists,
  getPlaylistTracks,
};
