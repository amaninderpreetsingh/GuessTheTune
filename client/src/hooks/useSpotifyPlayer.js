import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [actualDeviceId, setActualDeviceId] = useState(null); // Actual ID from Spotify API
  const actualDeviceIdRef = useRef(null); // Ref for immediate access without state update delay

  const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://127.0.0.1:8080';
  const DEVICE_NAME = 'GuessTheTune Player';

  // Helper function to get access token from server
  const getAccessToken = useCallback(async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/token`, {
        withCredentials: true,
      });
      return response.data.access_token;
    } catch (err) {
      console.error('Error fetching access token:', err);
      return null;
    }
  }, [serverUrl]);

  useEffect(() => {
    // Only initialize for host
    if (!isHost) {
      return;
    }

    let spotifyPlayer = null;

    async function initializePlayer() {
      // Get access token from server
      try {
        const token = await getAccessToken();

        if (!token) {
          setError('No access token available');
          console.error('No Spotify access token available');
          return;
        }

        if (!window.Spotify || !window.Spotify.Player) {
          console.error('Spotify Player not available yet');
          return;
        }

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
        setDeviceId(device_id);
        setIsReady(true);
      });

      // Not Ready
      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        setIsReady(false);
      });

      // Connect to the player
      spotifyPlayer.connect().then((success) => {
        if (!success) {
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
        initializePlayer();
      };
    }

    // Check if SDK is already loaded
    if (window.Spotify && window.Spotify.Player) {
      initializePlayer();
    }

    // Cleanup
    return () => {
      if (spotifyPlayer) {
        spotifyPlayer.disconnect();
      }
    };
  }, [isHost, getAccessToken]);

  // Helper function to verify player is ready with retry logic
  const verifyPlayerReady = useCallback(async () => {
    if (!player || !isReady || !deviceId) {
      return { ready: false, error: 'Player not initialized' };
    }

    const MAX_RETRIES = 5;
    const RETRY_DELAYS = [500, 1000, 2000, 4000, 8000]; // Exponential backoff

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Poll Spotify Web API to check if device is registered
        const token = await getAccessToken();
        if (!token) {
          console.error('No access token available for device verification');
          if (attempt < MAX_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
          }
          continue;
        }

        const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Search by device name instead of ID (SDK sometimes reports wrong ID)
          const ourDevice = data.devices.find(d => d.name === DEVICE_NAME);

          if (ourDevice) {
            // Always store the actual device ID from the API (it's more reliable than SDK's)
            // Use both state and ref - ref for immediate access, state for triggering re-renders
            setActualDeviceId(ourDevice.id);
            actualDeviceIdRef.current = ourDevice.id;

            return { ready: true, error: null, deviceId: ourDevice.id };
          }
        } else {
          console.error(`API returned ${response.status}: ${response.statusText}`);
        }

        // Device not ready yet - wait before retrying
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
        }
      } catch (err) {
        console.error(`Verification attempt ${attempt + 1} failed:`, err);

        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
        }
      }
    }

    return { ready: false, error: 'Device not ready after 5 attempts' };
  }, [player, isReady, deviceId, getAccessToken]);

  // Helper function to start playback using SDK
  const startPlayback = useCallback(async (uris, verifiedDeviceId) => {
    if (!player || !isReady) {
      console.error('Player not ready');
      return false;
    }

    // Use the verified device ID from the API if available, otherwise fallback to other IDs
    // Use ref for actualDeviceId as it updates immediately without waiting for state
    const targetDeviceId = verifiedDeviceId || actualDeviceIdRef.current || actualDeviceId || deviceId;

    if (!targetDeviceId) {
      console.error('No device ID available');
      return false;
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        console.error('No access token');
        return false;
      }

      // Use Spotify Web API to start playback on this device
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${targetDeviceId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: uris,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Playback error:', errorData);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error starting playback:', err);
      return false;
    }
  }, [player, isReady, deviceId, actualDeviceId, getAccessToken]);

  // Wrapper for next track with readiness check
  const nextTrack = useCallback(async () => {
    if (!player || !isReady) {
      console.error('Player not ready for next track');
      return false;
    }

    try {
      await player.nextTrack();
      return true;
    } catch (err) {
      console.error('Error skipping track:', err);
      return false;
    }
  }, [player, isReady]);

  // Wrapper for pause with readiness check
  const pausePlayback = useCallback(async () => {
    if (!player || !isReady) {
      console.error('Player not ready to pause');
      return false;
    }

    try {
      await player.pause();
      return true;
    } catch (err) {
      console.error('Error pausing:', err);
      return false;
    }
  }, [player, isReady]);

  // Wrapper for resume/toggle with readiness check
  const resumePlayback = useCallback(async () => {
    if (!player || !isReady) {
      console.error('Player not ready to resume');
      return false;
    }

    try {
      await player.resume();
      return true;
    } catch (err) {
      console.error('Error resuming:', err);
      return false;
    }
  }, [player, isReady]);

  return {
    player,
    isReady,
    deviceId: actualDeviceId || deviceId, // Expose the actualDeviceId if available, otherwise SDK's
    error,
    startPlayback,
    verifyPlayerReady,
    nextTrack,
    pausePlayback,
    resumePlayback,
  };
};

export default useSpotifyPlayer;