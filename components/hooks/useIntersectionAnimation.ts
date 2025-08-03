import { useEffect, useRef, useState } from 'react';

interface UseIntersectionAnimationOptions {
  /**
   * The root margin for the observer (default: '0px')
   */
  rootMargin?: string;
  /**
   * The threshold at which to trigger (default: 0.1)
   */
  threshold?: number | number[];
  /**
   * Whether to trigger only once (default: true)
   */
  triggerOnce?: boolean;
  /**
   * Optional delay before triggering animation (in ms)
   */
  delay?: number;
}

/**
 * Hook that uses Intersection Observer to trigger animations when elements enter viewport.
 * More performant than setTimeout-based approaches.
 */
export function useIntersectionAnimation<T extends HTMLElement>(
  options: UseIntersectionAnimationOptions = {}
) {
  const {
    rootMargin = '0px',
    threshold = 0.1,
    triggerOnce = true,
    delay = 0
  } = options;

  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || (triggerOnce && hasAnimated)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => {
                setIsInView(true);
                if (triggerOnce) {
                  setHasAnimated(true);
                  observer.unobserve(element);
                }
              }, delay);
            } else {
              setIsInView(true);
              if (triggerOnce) {
                setHasAnimated(true);
                observer.unobserve(element);
              }
            }
          } else if (!triggerOnce) {
            setIsInView(false);
          }
        });
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, triggerOnce, delay, hasAnimated]);

  return { ref, isInView };
}