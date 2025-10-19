import React from 'react';
import { motion } from 'framer-motion';

const BuzzButton = ({ onClick, disabled = false }) => {
  return (
    <motion.button
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-64 h-64 mx-auto rounded-full
        bg-gradient-to-br from-spotify-green to-green-600
        shadow-2xl
        font-bold text-2xl
        transition-all duration-200
        ${
          !disabled
            ? 'hover:shadow-spotify-green hover:shadow-xl cursor-pointer'
            : 'opacity-50 cursor-not-allowed'
        }
      `}
      style={{
        boxShadow: !disabled
          ? '0 0 40px rgba(29, 185, 84, 0.5)'
          : '0 0 20px rgba(29, 185, 84, 0.2)',
      }}
    >
      <motion.div
        animate={
          !disabled
            ? {
                scale: [1, 1.05, 1],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="flex flex-col items-center justify-center h-full"
      >
        <span className="text-5xl mb-2">🔔</span>
        <span>I Know It!</span>
      </motion.div>

      {/* Pulse animation ring */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-spotify-green"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  );
};

export default BuzzButton;
