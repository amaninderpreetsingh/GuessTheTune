import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { setAuthData } from '../utils/authStorage';

const LobbyPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    socket,
    setIsHost,
    setRoomCode,
    roomCode,
    players,
    setPlayers,
  } = useGame();

  const [displayName, setDisplayName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState('');

  const isHost = searchParams.get('host') === 'true';

  // Extract and store auth tokens from URL (after Spotify OAuth redirect)
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const expiresIn = searchParams.get('expires_in');
    const tokenType = searchParams.get('token_type');

    if (accessToken && refreshToken) {
      // Store tokens in localStorage
      const authData = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: parseInt(expiresIn) || 3600,
        token_type: tokenType || 'Bearer',
      };

      setAuthData(authData);
      console.log('Auth tokens stored in localStorage');

      // Clean up URL by removing token parameters (for security)
      const newSearchParams = new URLSearchParams();
      if (isHost) {
        newSearchParams.set('host', 'true');
      }
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, isHost]);

  useEffect(() => {
    if (isHost) {
      setIsHost(true);
    }
  }, [isHost, setIsHost]);

  useEffect(() => {
    if (!socket) return;

    // Connect socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Listen for room created event
    socket.on('roomCreated', ({ roomCode, room }) => {
      setRoomCode(roomCode);
      setPlayers(room.players);
      setShowNameInput(false);
      setIsCreatingRoom(false);
    });

    // Listen for player joined event
    socket.on('playerJoined', ({ room }) => {
      setPlayers(room.players);
    });

    // Listen for player left event
    socket.on('playerLeft', ({ room }) => {
      setPlayers(room.players);
    });

    // Listen for errors
    socket.on('error', ({ message }) => {
      setError(message || 'An error occurred');
      setIsCreatingRoom(false);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('error');
    };
  }, [socket, setRoomCode, setPlayers]);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Please enter your display name');
      return;
    }

    if (!socket) {
      setError('Connection not ready. Please try again.');
      return;
    }

    setIsCreatingRoom(true);

    socket.emit('createRoom', {
      displayName: displayName.trim(),
      isHost: true,
    });
  };

  const handleStartGame = () => {
    // Navigate to playlist selection
    navigate(`/room/${roomCode}`);
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    // Could add a toast notification here
  };

  // Show name input form for host
  if (showNameInput && isHost) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-md w-full"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome, Host!</h1>
          <p className="text-secondary-text mb-6">
            Enter your display name to create a room
          </p>

          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="input-field w-full"
                maxLength={20}
                disabled={isCreatingRoom}
                autoFocus
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={!isCreatingRoom ? { scale: 1.02 } : {}}
              whileTap={!isCreatingRoom ? { scale: 0.98 } : {}}
              type="submit"
              className="btn-primary w-full"
              disabled={isCreatingRoom}
            >
              {isCreatingRoom ? 'Creating Room...' : 'Create Room'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Show lobby with room code and players
  if (roomCode) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Waiting for Players...
            </h1>
            <p className="text-secondary-text">
              Share the room code with your friends to get started
            </p>
          </div>

          {/* Room Code Display */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="card mb-8 text-center"
          >
            <p className="text-secondary-text mb-2">Room Code</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-6xl md:text-7xl font-bold tracking-widest text-spotify-green">
                {roomCode}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCopyRoomCode}
                className="p-3 bg-secondary-bg hover:bg-gray-700 rounded-lg transition-colors"
                title="Copy room code"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {/* Players List */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Players ({players.length})
            </h2>
            <div className="space-y-3">
              {players.map((player, index) => (
                <motion.div
                  key={player.socketId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 bg-primary-bg p-4 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-spotify-green flex items-center justify-center font-bold">
                    {player.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{player.displayName}</p>
                    {player.isHost && (
                      <p className="text-sm text-spotify-green">Host</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Start Game Button (Host Only) */}
          {isHost && players.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartGame}
                className="btn-primary text-lg px-12 py-4"
              >
                Start Game
              </motion.button>
              <p className="text-secondary-text text-sm mt-4">
                Minimum 2 players required
              </p>
            </motion.div>
          )}

          {isHost && players.length < 2 && (
            <p className="text-center text-secondary-text">
              Waiting for at least one more player to join...
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // Fallback loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🎵</div>
        <p className="text-secondary-text">Loading...</p>
      </div>
    </div>
  );
};

export default LobbyPage;
