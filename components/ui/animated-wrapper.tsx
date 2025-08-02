'use client';

import React, { forwardRef, useRef, ReactNode } from 'react';
import { useScrollAnimation, useInitialAnimation } from '@/lib/animations';

interface AnimatedWrapperProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'scaleIn' | 'slideInLeft' | 'slideInRight';
  delay?: number;
  threshold?: number;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Unified animation wrapper component that replaces Framer Motion
 * Uses GSAP under the hood for better performance
 */
export const AnimatedWrapper = forwardRef<HTMLElement, AnimatedWrapperProps>(
  ({ children, className = '', animation = 'fadeInUp', delay = 0, threshold = 0.1, as: Component = 'div' }, forwardedRef) => {
    const animationRef = useScrollAnimation(animation, { threshold });
    
    // Combine refs using callback ref
    const ref = React.useCallback((el: HTMLElement | null) => {
      // Update animation ref
      if (el && animationRef.current !== el) {
        (animationRef as React.MutableRefObject<HTMLElement | null>).current = el;
      }
      
      // Update forwarded ref
      if (forwardedRef) {
        if (typeof forwardedRef === 'function') {
          forwardedRef(el);
        } else {
          (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = el;
        }
      }
    }, [forwardedRef, animationRef]);

    return React.createElement(Component, {
      ref,
      className,
      style: { opacity: 0 },
      children
    });
  }
);

AnimatedWrapper.displayName = 'AnimatedWrapper';

/**
 * Initial load animation wrapper
 * Animates content on first render without scroll trigger
 */
export const InitialAnimatedWrapper = forwardRef<HTMLElement, AnimatedWrapperProps>(
  ({ children, className = '', as: Component = 'div' }, forwardedRef) => {
    const animationRef = useInitialAnimation();
    
    // Combine refs using callback ref
    const ref = React.useCallback((el: HTMLElement | null) => {
      // Update animation ref
      if (el && animationRef.current !== el) {
        (animationRef as React.MutableRefObject<HTMLElement | null>).current = el;
      }
      
      // Update forwarded ref
      if (forwardedRef) {
        if (typeof forwardedRef === 'function') {
          forwardedRef(el);
        } else {
          (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = el;
        }
      }
    }, [forwardedRef, animationRef]);

    return React.createElement(Component, {
      ref,
      className,
      style: { opacity: 0 },
      children
    });
  }
);

InitialAnimatedWrapper.displayName = 'InitialAnimatedWrapper';