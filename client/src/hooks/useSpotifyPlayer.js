import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook for Spotify Web Playback SDK
 * Only initializes for the host
 */
const useSpotifyPlayer = (isHost) => {
  const [player, setPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [error, setError] = useState(null);

  const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://127.0.0.1:8080';

  useEffect(() => {
    // Only initialize for host
    if (!isHost) {
      return;
    }

    let spotifyPlayer = null;

    async function initializePlayer() {
      // Get access token from server
      try {
        const response = await axios.get(`${serverUrl}/api/token`, {
          withCredentials: true,
        });

        const token = response.data.access_token;

        if (!token) {
          setError('No access token available');
          console.error('No Spotify access token available');
          return;
        }

        if (!window.Spotify || !window.Spotify.Player) {
          console.error('Spotify Player not available yet');
          return;
        }

        console.log('Initializing Spotify Player with token...');

        spotifyPlayer = new window.Spotify.Player({
        name: 'GuessTheTune Player',
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 0.5,
      });

      // Error handling
      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Initialization Error:', message);
        setError(message);
      });

      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Authentication Error:', message);
        setError(message);
      });

      spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('Account Error:', message);
        setError(message);
      });

      spotifyPlayer.addListener('playback_error', ({ message }) => {
        console.error('Playback Error:', message);
      });

      // Ready
      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Spotify Player Ready with Device ID:', device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      // Not Ready
      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline:', device_id);
        setIsReady(false);
      });

      // Connect to the player
      spotifyPlayer.connect().then((success) => {
        if (success) {
          console.log('Spotify Player connected successfully');
        } else {
          console.error('Spotify Player connection failed');
          setError('Failed to connect to Spotify');
        }
      });

        setPlayer(spotifyPlayer);
      } catch (err) {
        console.error('Error fetching access token:', err);
        setError('Failed to get Spotify access token. Please try logging in again.');
      }
    }

    // Define the callback globally (Spotify SDK looks for this)
    if (!window.onSpotifyWebPlaybackSDKReady) {
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('Spotify SDK Ready');
        initializePlayer();
      };
    }

    // Check if SDK is already loaded
    if (window.Spotify && window.Spotify.Player) {
      console.log('Spotify SDK already loaded, initializing...');
      initializePlayer();
    }

    // Cleanup
    return () => {
      if (spotifyPlayer) {
        spotifyPlayer.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, serverUrl]);

  return {
    player,
    isReady,
    deviceId,
    error,
  };
};

export default useSpotifyPlayer;
