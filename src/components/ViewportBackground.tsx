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
      position: 'ellipse 1200px 900px at 50% 15%',
      colors: 'rgba(16,185,129,0.15) 0%, transparent 60%',
      opacity: 0.7
    },
    cyan: {
      position: 'ellipse 1000px 750px at 20% 85%', 
      colors: 'rgba(6,182,212,0.12) 0%, transparent 60%',
      opacity: 0.6
    },
    red: {
      position: 'ellipse 900px 650px at 80% 65%',
      colors: 'rgba(239,68,68,0.10) 0%, transparent 65%', 
      opacity: 0.5
    }
  }), []);

  return (
    <div className="absolute inset-0 w-full pointer-events-none" style={{ 
      height: '100dvh',
      minHeight: '100vh'
    }}>
      {/* Base black layer */}
      <div 
        className="absolute inset-0 w-full h-full" 
        style={{ backgroundColor: '#000000', minHeight: 'inherit' }} 
      />
      
      {/* Primary gradient layer */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-950 via-black to-zinc-950" style={{ minHeight: 'inherit' }} />
      
      {/* Colored gradient overlays - viewport positioned */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{
          background: `radial-gradient(${gradientConfig.emerald.position}, ${gradientConfig.emerald.colors})`,
          opacity: gradientConfig.emerald.opacity,
          minHeight: 'inherit'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: gradientConfig.emerald.opacity }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{
          background: `radial-gradient(${gradientConfig.cyan.position}, ${gradientConfig.cyan.colors})`,
          opacity: gradientConfig.cyan.opacity,
          minHeight: 'inherit'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: gradientConfig.cyan.opacity }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
      />
      
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{
          background: `radial-gradient(${gradientConfig.red.position}, ${gradientConfig.red.colors})`,
          opacity: gradientConfig.red.opacity,
          minHeight: 'inherit'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: gradientConfig.red.opacity }}
        transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
      />
      
      {/* Noise texture for premium finish */}
      <div 
        className="absolute inset-0 w-full h-full opacity-[0.015] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
          minHeight: 'inherit'
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