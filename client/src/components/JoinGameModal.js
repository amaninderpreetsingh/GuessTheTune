import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const JoinGameModal = ({ onClose }) => {
  const [displayName, setDisplayName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const navigate = useNavigate();
  const { socket, setDisplayName: setGlobalDisplayName, setRoomCode: setGlobalRoomCode } = useGame();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!displayName.trim()) {
      setError('Please enter your display name');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    if (roomCode.trim().length !== 4) {
      setError('Room code must be 4 letters');
      return;
    }

    if (!socket) {
      setError('Connection not ready. Please try again.');
      return;
    }

    setIsJoining(true);

    // Connect socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Set up event listeners
    socket.once('playerJoined', ({ room }) => {
      setGlobalDisplayName(displayName.trim());
      setGlobalRoomCode(roomCode.trim().toUpperCase());
      navigate(`/room/${roomCode.trim().toUpperCase()}`);
    });

    socket.once('roomNotFound', () => {
      setError('Room not found. Please check the code and try again.');
      setIsJoining(false);
    });

    socket.once('error', ({ message }) => {
      setError(message || 'Failed to join room');
      setIsJoining(false);
    });

    // Emit join room event
    socket.emit('joinRoom', {
      roomCode: roomCode.trim().toUpperCase(),
      displayName: displayName.trim(),
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="card max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Join a Game</h2>
            <button
              onClick={onClose}
              className="text-secondary-text hover:text-primary-text transition-colors text-2xl"
              disabled={isJoining}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={isJoining}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
                className="input-field w-full uppercase text-center text-2xl tracking-widest"
                maxLength={4}
                disabled={isJoining}
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
              whileHover={!isJoining ? { scale: 1.02 } : {}}
              whileTap={!isJoining ? { scale: 0.98 } : {}}
              type="submit"
              className="btn-primary w-full"
              disabled={isJoining}
            >
              {isJoining ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Joining...
                </span>
              ) : (
                'Join Game'
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export default JoinGameModal;
