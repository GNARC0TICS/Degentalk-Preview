import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import './BrowseTopicsLink.css';

interface BrowseTopicsLinkProps {
  variant?: 'pill' | 'shimmer';
  className?: string;
}

export function BrowseTopicsLink({ variant = 'pill', className = '' }: BrowseTopicsLinkProps) {
  if (variant === 'shimmer') {
    return (
      <Link to="/forums">
        <motion.div
          className={`browse-topics-shimmer ${className}`}
          whileHover={{ x: 5 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <span className="browse-topics-shimmer-text">Browse our topics</span>
          <ArrowRight className="browse-topics-shimmer-arrow" />
          <div className="browse-topics-shimmer-effect" />
        </motion.div>
      </Link>
    );
  }

  // Default pill variant
  return (
    <Link to="/forums">
      <motion.div
        className={`browse-topics-pill ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        <div className="browse-topics-pill-glow" />
        <div className="browse-topics-pill-content">
          <span>Browse our topics</span>
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
    </Link>
  );
}