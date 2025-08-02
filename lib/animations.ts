// Simple no-op animation utilities and hook placeholders
import { useRef } from 'react';
export const animate = () => {};
export const fadeIn = () => {};
export const fadeOut = () => {};

export function useHoverAnimation(_opts: { scale?: number } = {}) {
  // Return a ref that does nothing; real animation can be added later
  return useRef<HTMLElement | null>(null);
}