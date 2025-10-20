import React from 'react';
import { motion } from 'framer-motion';
import { Music, Music2, Music3, Music4 } from 'lucide-react';

const FloatingMusicNotes = () => {
  const notes = [
    { Icon: Music, delay: 0, x: '10%', duration: 8 },
    { Icon: Music2, delay: 1, x: '30%', duration: 10 },
    { Icon: Music3, delay: 2, x: '60%', duration: 9 },
    { Icon: Music4, delay: 1.5, x: '80%', duration: 11 },
    { Icon: Music, delay: 3, x: '45%', duration: 7 },
  ];

  return (
    <div className="fixed inset-0 -z-5 pointer-events-none overflow-hidden">
      {notes.map((note, index) => (
        <motion.div
          key={index}
          className="absolute bottom-0"
          style={{ left: note.x }}
          initial={{ y: '100vh', opacity: 0 }}
          animate={{
            y: '-100vh',
            opacity: [0, 0.6, 0.4, 0],
          }}
          transition={{
            duration: note.duration,
            delay: note.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <note.Icon
            className="text-neon-purple/40"
            size={24 + Math.random() * 16}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingMusicNotes;
