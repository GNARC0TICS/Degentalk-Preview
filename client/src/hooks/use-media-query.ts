import { useState, useEffect } from 'react';

// Mobile/tablet detection using media queries
export const useMobileDetector = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      // Standard mobile breakpoint (up to 768px)
      const mobileQuery = window.matchMedia('(max-width: 768px)');
      setIsMobile(mobileQuery.matches);
    };
    
    // Check on first render
    checkIfMobile();
    
    // Setup window resize listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
};

// Custom hook for arbitrary media queries
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const updateMatches = () => {
      setMatches(mediaQuery.matches);
    };
    
    // Check initially
    updateMatches();
    
    // Add listener for changes
    mediaQuery.addEventListener('change', updateMatches);
    
    // Clean up
    return () => mediaQuery.removeEventListener('change', updateMatches);
  }, [query]);

  return matches;
};