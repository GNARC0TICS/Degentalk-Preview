import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sparkles, ChevronRight } from 'lucide-react';
import './HeroCTAButtonAlt.css';

interface HeroCTAButtonAltProps {
  onClick: () => void;
  className?: string;
  variant?: 'neon' | 'aurora' | 'matrix';
}

export function HeroCTAButtonAlt({ onClick, className = '', variant = 'aurora' }: HeroCTAButtonAltProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={`hero-cta-alt ${variant} ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background layers */}
      <div className="hero-cta-alt-bg">
        <div className="hero-cta-alt-gradient" />
        <div className="hero-cta-alt-glow" />
        {variant === 'aurora' && <div className="hero-cta-alt-aurora" />}
        {variant === 'matrix' && <div className="hero-cta-alt-matrix" />}
      </div>

      {/* Main content */}
      <div className="hero-cta-alt-content">
        {/* Animated icon */}
        <div className="hero-cta-alt-icon-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={isHovered ? 'sparkles' : 'users'}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              {isHovered ? (
                <Sparkles className="hero-cta-alt-icon" />
              ) : (
                <Users className="hero-cta-alt-icon" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text with gradient */}
        <span className="hero-cta-alt-text">
          <span className="hero-cta-alt-text-main">Join Community</span>
          <span className="hero-cta-alt-text-sub">
            <AnimatePresence mode="wait">
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  Start your journey
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </span>

        {/* Arrow indicator */}
        <motion.div
          className="hero-cta-alt-arrow"
          animate={{ x: isHovered ? 5 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.div>
      </div>

      {/* Premium effects */}
      <div className="hero-cta-alt-effects">
        {/* Scanning line effect */}
        <div className="hero-cta-alt-scan" />
        
        {/* Corner accents */}
        <div className="hero-cta-alt-corner hero-cta-alt-corner-tl" />
        <div className="hero-cta-alt-corner hero-cta-alt-corner-tr" />
        <div className="hero-cta-alt-corner hero-cta-alt-corner-bl" />
        <div className="hero-cta-alt-corner hero-cta-alt-corner-br" />
      </div>
    </motion.button>
  );
}