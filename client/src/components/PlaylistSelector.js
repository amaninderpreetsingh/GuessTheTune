import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const PlaylistSelector = ({ onPlaylistSelected, selectedPlaylist }) => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFetchingTracks, setIsFetchingTracks] = useState(false);

  const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://127.0.0.1:8080';

  const fetchPlaylists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await axios.get(`${serverUrl}/api/playlists`, {
        withCredentials: true,
      });

      setPlaylists(response.data.playlists);
    } catch (err) {
      console.error('Error fetching playlists:', err);

      if (err.response?.data?.needsRefresh) {
        setError('Session expired. Please refresh the page and login again.');
      } else {
        setError('Failed to load playlists. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [serverUrl]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handlePlaylistClick = async (playlist) => {
    if (isFetchingTracks || selectedPlaylist?.id === playlist.id) {
      return;
    }

    try {
      setIsFetchingTracks(true);
      setError('');

      const response = await axios.get(
        `${serverUrl}/api/playlist-tracks/${playlist.id}`,
        {
          withCredentials: true,
        }
      );

      const tracks = response.data.tracks;

      if (tracks.length === 0) {
        setError('This playlist has no tracks. Please select another.');
        return;
      }

      onPlaylistSelected(playlist, tracks);
    } catch (err) {
      console.error('Error fetching playlist tracks:', err);
      setError('Failed to load playlist tracks. Please try again.');
    } finally {
      setIsFetchingTracks(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card text-center py-16">
        <div className="text-4xl mb-4">🎵</div>
        <p className="text-secondary-text">Loading your playlists...</p>
      </div>
    );
  }

  if (error && playlists.length === 0) {
    return (
      <div className="card text-center py-16">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-red-400 mb-4">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchPlaylists}
          className="btn-secondary"
        >
          Try Again
        </motion.button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Select a Playlist</h2>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3 text-sm mb-4"
        >
          {error}
        </motion.div>
      )}

      {selectedPlaylist && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-spotify-green bg-opacity-20 border border-spotify-green rounded-lg p-4 mb-6"
        >
          <p className="text-sm text-spotify-green mb-1">Selected Playlist</p>
          <p className="font-bold">{selectedPlaylist.name}</p>
          <p className="text-sm text-secondary-text">
            {selectedPlaylist.trackCount} tracks
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
        <AnimatePresence>
          {playlists.map((playlist, index) => (
            <motion.button
              key={playlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePlaylistClick(playlist)}
              disabled={isFetchingTracks}
              className={`text-left p-4 rounded-lg transition-all ${
                selectedPlaylist?.id === playlist.id
                  ? 'bg-spotify-green bg-opacity-20 border-2 border-spotify-green'
                  : 'bg-primary-bg hover:bg-gray-800 border-2 border-transparent'
              } ${isFetchingTracks ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex gap-3">
                {playlist.imageUrl ? (
                  <img
                    src={playlist.imageUrl}
                    alt={playlist.name}
                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-secondary-bg flex items-center justify-center flex-shrink-0">
                    🎵
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{playlist.name}</p>
                  <p className="text-sm text-secondary-text">
                    {playlist.trackCount} tracks
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {playlists.length === 0 && !error && (
        <p className="text-center text-secondary-text py-8">
          No playlists found. Create some playlists on Spotify first!
        </p>
      )}
    </div>
  );
};

export default PlaylistSelector;
