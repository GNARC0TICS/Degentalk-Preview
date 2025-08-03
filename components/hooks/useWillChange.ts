import { useEffect, useRef } from 'react';

/**
 * Hook that manages will-change property for performance optimization.
 * Sets will-change before animation and removes it after completion to free memory.
 */
export function useWillChange<T extends HTMLElement>(
  isAnimating: boolean,
  properties: string = 'transform, opacity',
  delay: number = 500
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (isAnimating) {
      // Set will-change when animation starts
      element.style.willChange = properties;
    } else {
      // Remove will-change after animation completes
      const timer = setTimeout(() => {
        if (element) {
          element.style.willChange = 'auto';
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isAnimating, properties, delay]);

  return ref;
}