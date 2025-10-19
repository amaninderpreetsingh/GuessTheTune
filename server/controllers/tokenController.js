const express = require('express');
const router = express.Router();
const { verifySpotifyAuth } = require('../middleware/authMiddleware');

/**
 * Get the access token for the authenticated user
 * This allows the client to initialize the Spotify Web Playback SDK
 */
router.get('/token', verifySpotifyAuth, (req, res) => {
  try {
    const { access_token } = req.spotifyAuth;

    if (!access_token) {
      return res.status(401).json({ error: 'No access token found' });
    }

    // Return just the access token (not refresh token for security)
    res.json({ access_token });
  } catch (error) {
    console.error('Error retrieving token:', error);
    res.status(500).json({ error: 'Failed to retrieve token' });
  }
});

module.exports = router;
