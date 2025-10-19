import React from 'react';
import { motion } from 'framer-motion';

const PlayerList = ({ players = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="card sticky top-8"
    >
      <h2 className="text-xl font-bold mb-4">Players ({players.length})</h2>
      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {players.map((player, index) => (
          <motion.div
            key={player.socketId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-primary-bg p-3 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-spotify-green flex items-center justify-center font-bold flex-shrink-0">
                {player.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{player.displayName}</p>
                <div className="flex items-center gap-2">
                  {player.isHost && (
                    <span className="text-xs text-spotify-green">Host</span>
                  )}
                  <span className="text-sm text-secondary-text">
                    {player.score || 0} pts
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {players.length === 0 && (
          <p className="text-secondary-text text-center py-8">
            No players yet
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default PlayerList;
