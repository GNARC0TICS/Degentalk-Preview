import { useState, useEffect } from 'react';
import { AnimationConfig } from '@/lib/animations';

/**
 * Enhanced hook for motion and performance preferences
 * Detects reduced motion, device performance, and network conditions
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Desktop detection hook for animation gating
 * Returns true for screens >= breakpoint (default 768px)
 */
export function useIsDesktop(breakpoint: number = 768): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`);
    setIsDesktop(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [breakpoint]);

  return isDesktop;
}

/**
 * Performance-aware animation configuration
 * Automatically reduces animations on lower-end devices and mobile
 */
export function useAnimationConfig(): AnimationConfig {
  const prefersReducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const [enableHeavyAnimations, setEnableHeavyAnimations] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect low-end devices
    const isLowEnd = (() => {
      // Check CPU cores (rough performance indicator)
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;
      
      // Check device memory (if available)
      const deviceMemory = (navigator as any).deviceMemory || 4;
      
      // Check connection (if available)
      const connection = (navigator as any).connection;
      const isSlowConnection = connection && (
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' ||
        connection.saveData
      );

      return hardwareConcurrency <= 2 || deviceMemory <= 2 || isSlowConnection;
    })();

    setEnableHeavyAnimations(!isLowEnd);
  }, []);

  return {
    prefersReducedMotion,
    enableHeavyAnimations: enableHeavyAnimations && !prefersReducedMotion && isDesktop
  };
}

/**
 * Simplified animation config helper (legacy support)
 */
export function getAnimationConfig(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      initial: {},
      animate: {},
      transition: { duration: 0 },
      whileHover: {},
      whileTap: {}
    };
  }
  return null;
}