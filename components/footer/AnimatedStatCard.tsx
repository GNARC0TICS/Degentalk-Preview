import React from 'react';
import { motion } from 'framer-motion';
import { Users, Smartphone, HandCoins } from 'lucide-react';
import './AnimatedStatCard.css';

interface AnimatedStatCardProps {
  value: string | number;
  label: string;
  sublabel?: string;
  variant?: 'online' | 'posts' | 'tips';
  display?: 'card' | 'pill';
  className?: string;
}

export function AnimatedStatCard({ 
  value, 
  label, 
  sublabel,
  variant = 'online',
  display = 'card',
  className = '' 
}: AnimatedStatCardProps) {
  // Variant-specific styles
  const variantStyles = {
    online: {
      gradient: 'radial-gradient(circle 160px at 0% 0%, #10b981, #0c0d0d)',
      cardGradient: 'radial-gradient(circle 200px at 0% 0%, #065f46, #0c0d0d)',
      pillGradient: 'radial-gradient(circle 120px at 50% 50%, #10b98133, transparent)',
      pillBg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 95, 70, 0.05) 100%)',
      rayColor: '#34d399',
      textGradient: 'linear-gradient(45deg, #064e3b 4%, #10b981, #064e3b)',
      dotColor: '#10b981',
      topLineGradient: 'linear-gradient(90deg, #10b981 30%, #1d1f1f 70%)',
      leftLineGradient: 'linear-gradient(180deg, #10b981 30%, #222424 70%)',
    },
    posts: {
      gradient: 'radial-gradient(circle 160px at 0% 0%, #a855f7, #0c0d0d)',
      cardGradient: 'radial-gradient(circle 200px at 0% 0%, #581c87, #0c0d0d)',
      pillGradient: 'radial-gradient(circle 120px at 50% 50%, #a855f733, transparent)',
      pillBg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(88, 28, 135, 0.05) 100%)',
      rayColor: '#c084fc',
      textGradient: 'linear-gradient(45deg, #3b0764 4%, #a855f7, #3b0764)',
      dotColor: '#a855f7',
      topLineGradient: 'linear-gradient(90deg, #a855f7 30%, #1d1f1f 70%)',
      leftLineGradient: 'linear-gradient(180deg, #a855f7 30%, #222424 70%)',
    },
    tips: {
      gradient: 'radial-gradient(circle 160px at 0% 0%, #f59e0b, #0c0d0d)',
      cardGradient: 'radial-gradient(circle 200px at 0% 0%, #92400e, #0c0d0d)',
      pillGradient: 'radial-gradient(circle 120px at 50% 50%, #f59e0b33, transparent)',
      pillBg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(146, 64, 14, 0.05) 100%)',
      rayColor: '#fbbf24',
      textGradient: 'linear-gradient(45deg, #451a03 4%, #f59e0b, #451a03)',
      dotColor: '#f59e0b',
      topLineGradient: 'linear-gradient(90deg, #f59e0b 30%, #1d1f1f 70%)',
      leftLineGradient: 'linear-gradient(180deg, #f59e0b 30%, #222424 70%)',
    }
  };

  const styles = variantStyles[variant];
  
  // Icon mapping
  const icons = {
    online: Users,
    posts: Smartphone,
    tips: HandCoins
  };
  
  const Icon = icons[variant];

  // Render pill variant
  if (display === 'pill') {
    return (
      <motion.div 
        className={`animated-stat-pill ${variant} ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.05 }}
      >
        <div className="pill-glow" style={{ background: styles.pillGradient }}></div>
        <div className="pill-content" style={{ background: styles.pillBg }}>
          <div className="pill-shimmer"></div>
          <Icon className="pill-icon" style={{ color: styles.dotColor }} />
          <span className="pill-value" style={{ backgroundImage: styles.textGradient }}>{value}</span>
          <span className="pill-label font-display uppercase tracking-wide">{label}</span>
        </div>
      </motion.div>
    );
  }

  // Original card variant
  return (
    <motion.div 
      className={`animated-stat-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="stat-outer" style={{ background: styles.gradient }}>
        <div className="stat-dot" style={{ backgroundColor: styles.dotColor, boxShadow: `0 0 10px ${styles.dotColor}` }}></div>
        <div className="stat-card" style={{ background: styles.cardGradient }}>
          <div className="stat-ray" style={{ backgroundColor: styles.rayColor, opacity: 0.3, boxShadow: `0 0 50px ${styles.rayColor}` }}></div>
          <div className="stat-text" style={{ backgroundImage: styles.textGradient }}>{value}</div>
          <div className="stat-label">{label}</div>
          {sublabel && <div className="stat-sublabel">{sublabel}</div>}
          <div className="stat-line stat-topl" style={{ background: styles.topLineGradient }}></div>
          <div className="stat-line stat-leftl" style={{ background: styles.leftLineGradient }}></div>
          <div className="stat-line stat-bottoml"></div>
          <div className="stat-line stat-rightl"></div>
        </div>
      </div>
    </motion.div>
  );
}