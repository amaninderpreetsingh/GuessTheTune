import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const WinnerModal = ({ winner, players, onClose }) => {
  const navigate = useNavigate();

  const handlePlayAgain = () => {
    navigate('/');
  };

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 15 }}
          className="card max-w-2xl w-full"
        >
          {/* Confetti/Celebration Animation */}
          <div className="text-center mb-8">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-8xl mb-4"
            >
              🏆
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              We Have a Winner!
            </h1>
            <p className="text-3xl font-bold text-spotify-green">
              {winner.displayName}
            </p>
            <p className="text-secondary-text mt-2">
              {winner.score} points
            </p>
          </div>

          {/* Leaderboard */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-center">Final Scores</h2>
            <div className="space-y-2">
              {sortedPlayers.map((player, index) => (
                <motion.div
                  key={player.socketId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    player.socketId === winner.socketId
                      ? 'bg-spotify-green bg-opacity-20 border-2 border-spotify-green'
                      : 'bg-primary-bg'
                  }`}
                >
                  <div className="text-2xl font-bold w-8 text-center">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{player.displayName}</p>
                    {player.isHost && (
                      <p className="text-xs text-spotify-green">Host</p>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-spotify-green">
                    {player.score}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlayAgain}
              className="btn-primary flex-1"
            >
              Back to Home
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WinnerModal;
