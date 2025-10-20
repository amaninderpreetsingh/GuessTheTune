import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Trophy, Medal, Star, Users } from 'lucide-react';

const PlayerList = ({ players = [] }) => {
  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  const getRankBadge = (index) => {
    if (index === 0 && players.length > 1) return { Icon: Crown, color: 'text-neon-yellow', glow: 'shadow-glow-green' };
    if (index === 1) return { Icon: Trophy, color: 'text-gray-300', glow: 'shadow-glow-blue' };
    if (index === 2) return { Icon: Medal, color: 'text-neon-orange', glow: 'shadow-glow-pink' };
    return null;
  };

  const getAvatarGradient = (index) => {
    const gradients = [
      'from-neon-purple to-neon-pink',
      'from-neon-blue to-neon-cyan',
      'from-neon-pink to-neon-orange',
      'from-spotify-green to-neon-cyan',
      'from-neon-orange to-neon-yellow',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="card-glass sticky top-8"
    >
      <h2 className="text-2xl font-display font-bold mb-6 gradient-text">
        Players ({players.length})
      </h2>
      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {sortedPlayers.map((player, index) => {
          const rankBadge = getRankBadge(index);
          const score = player.score || 0;
          const progress = (score / 10) * 100;

          return (
            <motion.div
              key={player.socketId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className={`
                relative bg-gradient-to-r from-secondary-bg/60 to-secondary-bg/40
                backdrop-blur-sm p-4 rounded-xl border border-white/10
                hover:border-white/30 transition-all duration-300
                ${rankBadge ? rankBadge.glow : ''}
              `}
            >
              {/* Rank number */}
              <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-sm font-bold shadow-glow-purple">
                {index + 1}
              </div>

              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient(index)} flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg`}>
                  {player.displayName.charAt(0).toUpperCase()}

                  {/* Rank badge overlay */}
                  {rankBadge && (
                    <div className="absolute -top-1 -right-1 bg-primary-bg rounded-full p-1">
                      <rankBadge.Icon className={rankBadge.color} size={14} />
                    </div>
                  )}
                </div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold truncate">{player.displayName}</p>
                    {player.isHost && (
                      <span className="flex items-center gap-1 text-xs bg-spotify-green/20 text-spotify-green px-2 py-0.5 rounded-full border border-spotify-green/30">
                        <Star size={10} fill="currentColor" />
                        Host
                      </span>
                    )}
                  </div>

                  {/* Score and progress */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold gradient-text">
                      {score} pts
                    </span>
                    <div className="flex-1 h-2 bg-primary-bg/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-neon-purple to-neon-pink rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {players.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-secondary-text text-center py-12"
          >
            <Users className="mx-auto mb-3 text-neon-purple/50" size={48} />
            <p>Waiting for players...</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PlayerList;
