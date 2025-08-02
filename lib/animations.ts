// Simple no-op animation utilities and hook placeholders
import { useRef } from 'react';
export const animate = () => {};
export const fadeIn = () => {};
export const fadeOut = () => {};

export function useHoverAnimation(_opts: { scale?: number } = {}) {
  return useRef<HTMLElement | null>(null);
}

export function useScrollAnimation() {
  return useRef<HTMLElement | null>(null);
}

export function useInitialAnimation() {
  return useRef<HTMLElement | null>(null);
}