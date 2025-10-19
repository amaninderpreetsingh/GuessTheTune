const express = require('express');
const router = express.Router();
const spotifyService = require('../services/spotifyService');
const { verifySpotifyAuth } = require('../middleware/authMiddleware');

/**
 * Get user's Spotify playlists
 * Requires authentication
 */
router.get('/playlists', verifySpotifyAuth, async (req, res) => {
  try {
    const { access_token } = req.spotifyAuth;
    const playlists = await spotifyService.getUserPlaylists(access_token);

    res.json({ playlists });
  } catch (error) {
    console.error('Error fetching playlists:', error);

    // If token expired, suggest refresh
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Token expired', needsRefresh: true });
    }

    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

/**
 * Get tracks from a specific playlist
 * Requires authentication
 */
router.get('/playlist-tracks/:playlistId', verifySpotifyAuth, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { access_token } = req.spotifyAuth;

    const tracks = await spotifyService.getPlaylistTracks(access_token, playlistId);

    res.json({ tracks });
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);

    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Token expired', needsRefresh: true });
    }

    res.status(500).json({ error: 'Failed to fetch playlist tracks' });
  }
});

module.exports = router;
