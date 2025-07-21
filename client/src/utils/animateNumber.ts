import { useEffect, useRef, useState } from 'react';

export interface AnimateNumberOptions {
  duration?: number;
  ease?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  decimals?: number;
  format?: (value: number) => string;
}

export function animateNumber(
  from: number,
  to: number,
  onUpdate: (value: number) => void,
  options: AnimateNumberOptions = {}
): () => void {
  const { duration = 1000, ease = 'easeOut', decimals = 0 } = options;
  const startTime = Date.now();
  let animationId: number;

  const easeFunction = (t: number): number => {
    switch (ease) {
      case 'linear':
        return t;
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return t * (2 - t);
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default:
        return t;
    }
  };

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeFunction(progress);
    const currentValue = from + (to - from) * easedProgress;
    
    onUpdate(parseFloat(currentValue.toFixed(decimals)));

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    }
  };

  animationId = requestAnimationFrame(animate);

  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}

export function useAnimatedNumber(
  targetValue: number,
  options: AnimateNumberOptions = {}
): number {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const previousValue = useRef(targetValue);

  useEffect(() => {
    if (previousValue.current !== targetValue) {
      const cancel = animateNumber(
        previousValue.current,
        targetValue,
        setDisplayValue,
        options
      );
      previousValue.current = targetValue;
      return cancel;
    }
  }, [targetValue, options.duration, options.ease, options.decimals]);

  return displayValue;
}