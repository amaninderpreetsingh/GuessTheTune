import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Sparkles } from 'lucide-react';

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
        relative w-72 h-72 mx-auto rounded-full
        bg-gradient-to-br from-neon-purple via-neon-pink to-neon-orange
        font-bold text-3xl
        transition-all duration-300
        ${
          !disabled
            ? 'shadow-glow-multi hover:shadow-glow-purple cursor-pointer'
            : 'opacity-40 cursor-not-allowed grayscale'
        }
      `}
    >
      {/* Rotating glow ring */}
      {!disabled && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #8B5CF6, #EC4899, #F97316, #8B5CF6)',
              filter: 'blur(20px)',
              opacity: 0.6,
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Pulse rings */}
          {[0, 0.3, 0.6].map((delay, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-4 border-white/50"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.8, 0, 0.8],
              }}
              transition={{
                duration: 2,
                delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </>
      )}

      {/* Button content */}
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
        className="relative z-10 flex flex-col items-center justify-center h-full bg-gradient-to-br from-neon-purple/90 to-neon-pink/90 rounded-full backdrop-blur-sm"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          <Bell className="text-white mb-3" size={64} strokeWidth={2.5} />
        </motion.div>
        <span className="text-white drop-shadow-lg">I Know It!</span>

        {/* Sparkles */}
        {!disabled && (
          <>
            {[-45, 45].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: [0, Math.cos((angle * Math.PI) / 180) * 100],
                  y: [0, Math.sin((angle * Math.PI) / 180) * 100],
                  opacity: [1, 0],
                  scale: [0, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <Sparkles className="text-neon-yellow" size={20} />
              </motion.div>
            ))}
          </>
        )}
      </motion.div>
    </motion.button>
  );
};

export default BuzzButton;
