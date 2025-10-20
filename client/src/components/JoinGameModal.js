import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, UserCircle2, Hash, LogIn, Loader2, AlertCircle } from 'lucide-react';
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20 }}
          className="card-glass max-w-md w-full relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 -z-10" />

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-display font-bold gradient-text">Join a Game</h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-secondary-text hover:text-neon-pink transition-colors p-1 rounded-lg hover:bg-white/10"
              disabled={isJoining}
            >
              <X size={24} />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-neon-purple">
                <UserCircle2 size={18} />
                Display Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="input-field w-full pl-4"
                  maxLength={20}
                  disabled={isJoining}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-neon-pink">
                <Hash size={18} />
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
                className="input-field w-full uppercase text-center text-3xl font-bold tracking-[0.5em] font-display"
                maxLength={4}
                disabled={isJoining}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </motion.div>
            )}

            <motion.button
              whileHover={!isJoining ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isJoining ? { scale: 0.98 } : {}}
              type="submit"
              className="btn-primary w-full text-lg py-4 relative overflow-hidden"
              disabled={isJoining}
            >
              {isJoining ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Joining...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn size={20} />
                  <span>Join Game</span>
                </span>
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
