import React from 'react';
import { motion } from 'framer-motion';

export function RainAnimation() {
  const coinCount = 20;
  const coins = Array.from({ length: coinCount }, (_, i) => i);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {coins.map((i) => {
        const delay = Math.random() * 2;
        const duration = 3 + Math.random() * 2;
        const startX = Math.random() * 100;
        const drift = (Math.random() - 0.5) * 40;

        return (
          <motion.div
            key={i}
            className="absolute text-4xl"
            initial={{ 
              x: `${startX}vw`,
              y: '-10vh',
              rotate: 0,
              opacity: 1 
            }}
            animate={{ 
              x: `${startX + drift}vw`,
              y: '110vh',
              rotate: 360,
              opacity: [1, 1, 0.8, 0] 
            }}
            transition={{
              delay,
              duration,
              ease: 'linear',
              opacity: {
                times: [0, 0.7, 0.9, 1],
                duration
              }
            }}
          >
            💰
          </motion.div>
        );
      })}
      
      {/* Central splash effect */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2, 2.5], opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <div className="text-6xl font-bold text-yellow-400 text-center">
          <div>🌧️</div>
          <div className="text-2xl mt-2">IT'S RAINING DGT!</div>
        </div>
      </motion.div>
    </div>
  );
}