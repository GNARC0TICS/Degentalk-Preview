import { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Viewport-Based Background System
 * Provides seamless gradients across all sections without boundary cutoffs
 */
export function ViewportBackground() {
  // Static gradient configuration for performance
  const gradientConfig = useMemo(() => ({
    emerald: {
      position: 'ellipse 800px 600px at 50% 20%',
      colors: 'rgba(16,185,129,0.15) 0%, transparent 60%',
      opacity: 0.7
    },
    cyan: {
      position: 'ellipse 700px 500px at 20% 80%', 
      colors: 'rgba(6,182,212,0.12) 0%, transparent 60%',
      opacity: 0.6
    },
    red: {
      position: 'ellipse 600px 400px at 80% 60%',
      colors: 'rgba(239,68,68,0.10) 0%, transparent 65%', 
      opacity: 0.5
    }
  }), []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Base black layer */}
      <div 
        className="absolute inset-0" 
        style={{ backgroundColor: '#000000' }} 
      />
      
      {/* Primary gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-950" />
      
      {/* Colored gradient overlays - viewport positioned */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(${gradientConfig.emerald.position}, ${gradientConfig.emerald.colors})`,
          opacity: gradientConfig.emerald.opacity
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: gradientConfig.emerald.opacity }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(${gradientConfig.cyan.position}, ${gradientConfig.cyan.colors})`,
          opacity: gradientConfig.cyan.opacity
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: gradientConfig.cyan.opacity }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
      />
      
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(${gradientConfig.red.position}, ${gradientConfig.red.colors})`,
          opacity: gradientConfig.red.opacity
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: gradientConfig.red.opacity }}
        transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
      />
      
      {/* Noise texture for premium finish */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px'
        }}
      />
    </div>
  );
}

/**
 * Section Background Component
 * Provides section-specific background overlays while maintaining viewport gradients
 */
interface SectionBackgroundProps {
  variant?: 'transparent' | 'fade-down' | 'fade-up' | 'solid';
  intensity?: number;
  children: React.ReactNode;
  className?: string;
}

export function SectionBackground({ 
  variant = 'transparent', 
  intensity = 0.8,
  children, 
  className = '' 
}: SectionBackgroundProps) {
  const backgroundStyles = {
    transparent: '',
    'fade-down': `bg-gradient-to-b from-black/0 via-black/${Math.round(intensity * 20)} to-black/${Math.round(intensity * 40)}`,
    'fade-up': `bg-gradient-to-t from-black/0 via-black/${Math.round(intensity * 20)} to-black/${Math.round(intensity * 40)}`,
    'solid': `bg-black/${Math.round(intensity * 100)}`
  };

  return (
    <div className={`relative ${className}`}>
      {variant !== 'transparent' && (
        <div className={`absolute inset-0 ${backgroundStyles[variant]} pointer-events-none`} />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}