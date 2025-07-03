/**
 * Centralized Animation Configuration System
 * Single source of truth for all site animations with performance optimization
 */

import { Variants, Transition } from 'framer-motion';

// Performance-first animation presets
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3, 
  slow: 0.5,
  disabled: 0
} as const;

export const EASING = {
  easeOut: [0.4, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.6, 1],
  spring: { type: 'spring', damping: 25, stiffness: 120 }
} as const;

// Base transition configurations
export const createTransition = (
  duration: keyof typeof ANIMATION_DURATION = 'normal',
  delay = 0
): Transition => ({
  duration: ANIMATION_DURATION[duration],
  delay,
  ease: EASING.easeOut
});

// Core animation variants
export const slideUp: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export const slideDown: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const scaleIn: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1 }
};

// Performance-optimized text animation (no transforms)
export const textFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

// Stagger configurations
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// Hover effects (minimal for performance)
export const hoverScale = {
  scale: 1.02,
  transition: createTransition('fast')
};

export const hoverSlide = {
  x: 5,
  transition: createTransition('fast')
};

// Animation configuration based on user preferences
export interface AnimationConfig {
  prefersReducedMotion: boolean;
  enableHeavyAnimations: boolean;
}

export const getOptimizedAnimation = (
  animation: Variants | any,
  config: AnimationConfig
) => {
  if (config.prefersReducedMotion) {
    return {
      initial: {},
      animate: {},
      transition: { duration: 0 }
    };
  }

  return {
    variants: animation,
    initial: 'hidden',
    animate: 'visible',
    transition: createTransition()
  };
};

// Lazy loading animation helpers
export const lazyFadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-20px' },
  transition: createTransition('normal')
};

export const lazySlideUp = {
  initial: { y: 30, opacity: 0 },
  whileInView: { y: 0, opacity: 1 },
  viewport: { once: true, margin: '-20px' },
  transition: createTransition('normal')
};

// Quote animation (optimized for frequent changes)
export const quoteTransition: Variants = {
  enter: {
    opacity: 1,
    transition: createTransition('fast')
  },
  exit: {
    opacity: 0,
    transition: createTransition('fast')
  }
};

// Background animation toggles for performance
export const createBackgroundConfig = (enableHeavy: boolean) => ({
  gradientAnimation: enableHeavy,
  blurEffects: enableHeavy,
  patternOverlay: enableHeavy
});

// Container animations for sections  
export const sectionAnimation = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: createTransition('normal')
};

// Navigation animations
export const navItemAnimation = (delay = 0) => ({
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  transition: createTransition('normal', delay)
});

// Mobile navigation animations (ultra-optimized)
export const hamburgerLine: Variants = {
  closed: { 
    rotate: 0, 
    y: 0, 
    opacity: 1, 
    scaleX: 1,
    transition: createTransition('fast')
  },
  open: { 
    transition: createTransition('fast')
  }
};

// Individual line animations for hamburger
export const hamburgerTopLine: Variants = {
  ...hamburgerLine,
  open: {
    rotate: 45,
    y: 6,
    x: 3,
    transition: createTransition('fast')
  }
};

export const hamburgerMiddleLine: Variants = {
  ...hamburgerLine,
  open: {
    opacity: 0,
    scaleX: 0,
    transition: createTransition('fast')
  }
};

export const hamburgerBottomLine: Variants = {
  ...hamburgerLine,
  open: {
    rotate: -45,
    y: -6,
    x: 3,
    transition: createTransition('fast')
  }
};

// Mobile menu dropdown animations
export const mobileMenuContainer: Variants = {
  closed: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: createTransition('fast')
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...createTransition('normal'),
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const mobileMenuItem: Variants = {
  closed: {
    opacity: 0,
    x: -20,
    transition: createTransition('fast')
  },
  open: {
    opacity: 1,
    x: 0,
    transition: createTransition('fast')
  }
};

// Export default configuration
export const defaultAnimationConfig: AnimationConfig = {
  prefersReducedMotion: false,
  enableHeavyAnimations: true
};