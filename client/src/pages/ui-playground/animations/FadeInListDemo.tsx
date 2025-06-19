import React from 'react';
import { motion } from 'framer-motion';

const items = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'];

export const FadeInListDemo: React.FC = () => (
  <ul>
    {items.map((item, i) => (
      <motion.li
        key={item}
        className="text-zinc-300"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.08, duration: 0.4 }}
      >
        {item}
      </motion.li>
    ))}
  </ul>
);

export default FadeInListDemo; 