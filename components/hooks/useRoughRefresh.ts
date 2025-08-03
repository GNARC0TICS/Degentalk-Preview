import { useState, useEffect } from 'react';

/**
 * Hook that forces react-rough-notation to re-measure and re-render
 * on viewport changes (resize, orientation change, font load).
 * This prevents misaligned annotations when text reflows.
 */
export function useRoughRefresh() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleReflow = () => {
      // Hide annotations immediately
      setShow(false);
      // Re-show on next frame to force re-measurement
      requestAnimationFrame(() => setShow(true));
    };

    // Initial show after mount
    handleReflow();

    // Re-measure on viewport changes
    window.addEventListener('resize', handleReflow);
    window.addEventListener('orientationchange', handleReflow);
    
    // Also handle font loading which can change text metrics
    if ('fonts' in document) {
      document.fonts.addEventListener('loadingdone', handleReflow);
    }

    return () => {
      window.removeEventListener('resize', handleReflow);
      window.removeEventListener('orientationchange', handleReflow);
      if ('fonts' in document) {
        document.fonts.removeEventListener('loadingdone', handleReflow);
      }
    };
  }, []);

  return show;
}