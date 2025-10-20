import React, { useState } from 'react';
import { motion } from 'framer-motion';
import JoinGameModal from '../components/JoinGameModal';

const HomePage = () => {
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleHostGame = () => {
    // Redirect to Spotify login
    window.location.href = process.env.REACT_APP_SERVER_URL
      ? `${process.env.REACT_APP_SERVER_URL}/auth/login`
      : 'http://127.0.0.1:8080/auth/login';
  };

  const handleJoinGame = () => {
    setShowJoinModal(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl w-full"
      >
        {/* Logo/Title */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-spotify-green to-green-400 bg-clip-text text-transparent">
            GuessTheTune
          </h1>
          <p className="text-secondary-text text-lg md:text-xl">
            A real-time social music trivia game
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-4 mb-12"
        >
          <FeatureCard
            icon="🎵"
            title="Your Music"
            description="Play with your Spotify playlists"
            delay={0.5}
          />
          <FeatureCard
            icon="⚡"
            title="Real-time"
            description="Race to buzz in first"
            delay={0.6}
          />
          <FeatureCard
            icon="👥"
            title="Multiplayer"
            description="Play with friends"
            delay={0.7}
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleHostGame}
            className="btn-primary w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2"
          >
            <span className="text-2xl">🎤</span>
            <span>Host a Game</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleJoinGame}
            className="btn-secondary w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2"
          >
            <span className="text-2xl">🎮</span>
            <span>Join a Game</span>
          </motion.button>
        </motion.div>

        {/* How to Play */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold mb-6">How to Play</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Step number="1" text="Host creates a room with their Spotify playlist" />
            <Step number="2" text="Players join with a room code" />
            <Step number="3" text="Buzz in and guess the song title" />
            <Step number="4" text="First to 10 points wins!" />
          </div>
        </motion.div>
      </motion.div>

      {/* Join Game Modal */}
      {showJoinModal && (
        <JoinGameModal onClose={() => setShowJoinModal(false)} />
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card hover:bg-gray-700 transition-colors"
  >
    <div className="text-4xl mb-2">{icon}</div>
    <h3 className="font-semibold mb-1">{title}</h3>
    <p className="text-secondary-text text-sm">{description}</p>
  </motion.div>
);

const Step = ({ number, text }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-12 h-12 rounded-full bg-spotify-green flex items-center justify-center font-bold text-xl mb-3">
      {number}
    </div>
    <p className="text-secondary-text text-sm">{text}</p>
  </div>
);

export default HomePage;
