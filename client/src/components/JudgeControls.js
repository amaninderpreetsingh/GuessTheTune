import React from 'react';
import { motion } from 'framer-motion';

const JudgeControls = ({ guesser, onJudgment }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary-bg border-2 border-spotify-green rounded-lg p-6"
    >
      <div className="mb-6">
        <div className="text-4xl mb-2">⚖️</div>
        <p className="text-xl font-bold mb-2">You're the Judge!</p>
        <p className="text-secondary-text">
          Did <span className="text-spotify-green font-semibold">{guesser.displayName}</span> guess correctly?
        </p>
      </div>

      <div className="flex gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onJudgment(true)}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg transition-colors"
        >
          ✅ Correct
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onJudgment(false)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg transition-colors"
        >
          ❌ Incorrect
        </motion.button>
      </div>
    </motion.div>
  );
};

export default JudgeControls;
