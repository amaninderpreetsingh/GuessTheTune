const express = require('express');
const router = express.Router();
const axios = require('axios');
const { verifySpotifyAuth } = require('../middleware/authMiddleware');

/**
 * Start playback on a specific device with given tracks
 */
router.put('/play', verifySpotifyAuth, async (req, res) => {
  try {
    const { access_token } = req.spotifyAuth;
    const { device_id, uris, position_ms = 0 } = req.body;

    if (!device_id) {
      return res.status(400).json({ error: 'device_id is required' });
    }

    if (!uris || !Array.isArray(uris) || uris.length === 0) {
      return res.status(400).json({ error: 'uris array is required' });
    }

    console.log('Starting playback on device:', device_id);
    console.log('Number of tracks:', uris.length);

    // First, transfer playback to this device
    try {
      await axios.put(
        'https://api.spotify.com/v1/me/player',
        {
          device_ids: [device_id],
          play: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Playback transferred to device');
    } catch (transferError) {
      console.log('Transfer playback error (may be ok):', transferError.response?.status);
    }

    // Then start playback with the tracks
    await axios.put(
      `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
      {
        uris,
        position_ms,
      },
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Playback started successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error starting playback:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);

    const errorMessage = error.response?.data?.error?.message || 'Failed to start playback';
    res.status(error.response?.status || 500).json({
      error: errorMessage,
      details: error.response?.data
    });
  }
});

/**
 * Pause playback
 */
router.put('/pause', verifySpotifyAuth, async (req, res) => {
  try {
    const { access_token } = req.spotifyAuth;
    const { device_id } = req.body;

    await axios.put(
      'https://api.spotify.com/v1/me/player/pause',
      {},
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
        params: {
          device_id,
        },
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error pausing playback:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to pause playback' });
  }
});

/**
 * Resume playback
 */
router.put('/resume', verifySpotifyAuth, async (req, res) => {
  try {
    const { access_token } = req.spotifyAuth;
    const { device_id } = req.body;

    await axios.put(
      'https://api.spotify.com/v1/me/player/play',
      {},
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
        params: {
          device_id,
        },
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error resuming playback:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to resume playback' });
  }
});

module.exports = router;
