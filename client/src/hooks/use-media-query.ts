import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Ensure window is defined (for SSR compatibility, though less critical in Vite client-side)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    
    // Set the initial state
    setMatches(mediaQueryList.matches);

    // Listener for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    // Using addEventListener for modern browsers, with a fallback for older ones if needed
    // However, given the project's likely modern stack, addEventListener should be fine.
    try {
        mediaQueryList.addEventListener('change', handleChange);
    } catch (e) {
        // Fallback for older browsers
        mediaQueryList.addListener(handleChange);
    }


    // Cleanup listener on component unmount
    return () => {
      try {
        mediaQueryList.removeEventListener('change', handleChange);
      } catch (e) {
        mediaQueryList.removeListener(handleChange);
      }
    };
  }, [query]); // Re-run effect if query changes

  return matches;
}

/**
 * Convenience hook for mobile detection. By default it checks for viewport widths
 * at or below 768 px, but you can override the media query if needed.
 *
 * Example:
 *   const isMobile = useMobileDetector();
 *   const isTablet = useMobileDetector('(max-width: 1024px)');
 */
export function useMobileDetector(query: string = '(max-width: 768px)'): boolean {
  return useMediaQuery(query);
}
