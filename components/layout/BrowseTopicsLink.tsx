'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import './BrowseTopicsLink.css';

interface BrowseTopicsLinkProps {
  variant?: 'pill' | 'shimmer';
  className?: string;
}

export function BrowseTopicsLink({ variant = 'pill', className = '' }: BrowseTopicsLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const featuresSection = document.querySelector('.banner-carousel-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  if (variant === 'shimmer') {
    return (
      <motion.div
        className={`browse-topics-shimmer ${className}`}
        whileHover={{ scale: 1.05 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <span className="browse-topics-shimmer-text">Explore Our Features</span>
        <ArrowRight className="browse-topics-shimmer-arrow" />
        <div className="browse-topics-shimmer-effect" />
      </motion.div>
    );
  }

  // Default pill variant
  return (
    <motion.div
      className={`browse-topics-pill ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.8 }}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="browse-topics-pill-glow" />
      <div className="browse-topics-pill-content">
        <span>Explore Our Features</span>
        <motion.div
          className="browse-topics-pill-arrow"
          animate={{ x: 0 }}
          whileHover={{ x: 3 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowRight className="w-4 h-4" />
        </motion.div>
      </div>
    </motion.div>
  );
}