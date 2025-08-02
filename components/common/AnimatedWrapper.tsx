'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedWrapperProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'scaleIn' | 'slideInLeft' | 'slideInRight';
  delay?: number;
  duration?: number;
  className?: string;
  whileHover?: { scale?: number; x?: number; y?: number };
  onClick?: () => void;
}

export function AnimatedWrapper({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 0.6,
  className = '',
  whileHover,
  onClick
}: AnimatedWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const animations: Record<string, gsap.TweenVars> = {
      fadeIn: { opacity: 0 },
      fadeInUp: { opacity: 0, y: 20 },
      fadeInDown: { opacity: 0, y: -20 },
      scaleIn: { opacity: 0, scale: 0.9 },
      slideInLeft: { opacity: 0, x: -50 },
      slideInRight: { opacity: 0, x: 50 }
    };

    gsap.fromTo(
      ref.current,
      animations[animation],
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration,
        delay,
        ease: 'power2.out'
      }
    );
  }, [animation, delay, duration]);

  useEffect(() => {
    if (!ref.current || !whileHover) return;

    const element = ref.current;
    
    const handleMouseEnter = () => {
      gsap.to(element, {
        scale: whileHover.scale || 1,
        x: whileHover.x || 0,
        y: whileHover.y || 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        x: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [whileHover]);

  return (
    <div ref={ref} className={className} onClick={onClick}>
      {children}
    </div>
  );
}