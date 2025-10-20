import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useGame } from '../context/GameContext';
import debounce from 'lodash.debounce';

const debouncedSearch = debounce(async (query, serverUrl, setSearchResults, setLoading, setError) => {
  if (!query) {
    setSearchResults([]);
    return;
  }

  setLoading(true);
  setError(null);
  try {
    const response = await axios.get(`${serverUrl}/api/search-tracks?query=${query}`, {
      withCredentials: true,
    });
    setSearchResults(response.data.tracks);
  } catch (err) {
    console.error('Error searching tracks:', err);
    setError('Failed to search for tracks. Please try again.');
  } finally {
    setLoading(false);
  }
}, 500);

const TrackSearch = ({ onTrackSelected }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { socket, roomCode } = useGame();

  const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://127.0.0.1:8080';

  useEffect(() => {
    debouncedSearch(searchTerm, serverUrl, setSearchResults, setLoading, setError);
  }, [searchTerm, serverUrl]);

  const handleSelectTrack = (track) => {
    if (socket && roomCode) {
      socket.emit('forceNextSong', { roomCode, track });
      onTrackSelected(); // Callback to close/clear search
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary-bg border-2 border-spotify-green rounded-lg p-4 mb-6"
    >
      <h3 className="text-xl font-bold mb-4">Search for a Song</h3>
      <input
        type="text"
        placeholder="Search by song title or artist..."
        className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading && <p className="text-spotify-green">Searching...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="max-h-60 overflow-y-auto custom-scrollbar">
        {searchResults.length > 0 ? (
          searchResults.map((track) => (
            <motion.div
              key={track.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center p-3 mb-2 bg-gray-800 rounded-lg cursor-pointer"
              onClick={() => handleSelectTrack(track)}
            >
              {track.imageUrl && (
                <img
                  src={track.imageUrl}
                  alt={track.name}
                  className="w-12 h-12 rounded-md mr-3 object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-white">{track.name}</p>
                <p className="text-sm text-secondary-text">{track.artist}</p>
              </div>
            </motion.div>
          ))
        ) : (
          !loading && searchTerm && <p className="text-secondary-text">No results found.</p>
        )}
      </div>
    </motion.div>
  );
};

export default TrackSearch;
