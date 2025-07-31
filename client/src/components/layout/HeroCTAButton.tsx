import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import './HeroCTAButton.css';

interface HeroCTAButtonProps {
  onClick: () => void;
  className?: string;
}

export function HeroCTAButton({ onClick, className = '' }: HeroCTAButtonProps) {
  return (
    <motion.button
      className={`hero-cta-button ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated glow effect - inside button but behind content */}
      <div className="hero-cta-glow" />
      
      {/* Main button content */}
      <div className="hero-cta-content">
        {/* Shimmer effect */}
        <div className="hero-cta-shimmer" />
        
        {/* Icon and text */}
        <Users className="hero-cta-icon" />
        <span className="hero-cta-text">Join Community</span>
        
        {/* Pulse rings for attention */}
        <div className="hero-cta-pulse-ring" />
        <div className="hero-cta-pulse-ring hero-cta-pulse-ring-2" />
      </div>
      
      {/* Border gradient */}
      <div className="hero-cta-border" />
    </motion.button>
  );
}