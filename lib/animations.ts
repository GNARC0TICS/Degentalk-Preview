// Simple no-op animation utilities and hook placeholders
import { useRef } from 'react';
export const animate = () => {};
export const fadeIn = () => {};
export const fadeOut = () => {};

export function useHoverAnimation(_opts: { scale?: number } = {}) {
  return useRef<HTMLElement | null>(null);
}

export function useScrollAnimation(_animation: string = 'fadeInUp', _options: Record<string, any> = {}) {
  return useRef<HTMLElement | null>(null);
}

export function useInitialAnimation(_delay: number = 0, _options: Record<string, any> = {}) {
  return useRef<HTMLElement | null>(null);
}