import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface ForumButtonXProps {
  isActive: boolean;
}

export function ForumButtonX({ isActive }: ForumButtonXProps) {
  const [isHovered, setIsHovered] = useState(false);
  const line1Ref = useRef<SVGPathElement>(null);
  const line2Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (line1Ref.current && line2Ref.current) {
      const line1Length = line1Ref.current.getTotalLength();
      const line2Length = line2Ref.current.getTotalLength();

      // Set initial state
      gsap.set(line1Ref.current, {
        strokeDasharray: line1Length,
        strokeDashoffset: line1Length,
        opacity: 0
      });
      gsap.set(line2Ref.current, {
        strokeDasharray: line2Length,
        strokeDashoffset: line2Length,
        opacity: 0
      });
    }
  }, []);

  useEffect(() => {
    if (line1Ref.current && line2Ref.current) {
      const line1Length = line1Ref.current.getTotalLength();
      const line2Length = line2Ref.current.getTotalLength();

      if (isHovered) {
        // Animate X in
        gsap.to(line1Ref.current, {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
        gsap.to(line2Ref.current, {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 0.3,
          delay: 0.1,
          ease: 'power2.out'
        });
      } else {
        // Animate X out
        gsap.to(line1Ref.current, {
          strokeDashoffset: line1Length,
          opacity: 0,
          duration: 0.2,
          ease: 'power1.in'
        });
        gsap.to(line2Ref.current, {
          strokeDashoffset: line2Length,
          opacity: 0,
          duration: 0.2,
          ease: 'power1.in'
        });
      }
    }
  }, [isHovered]);

  return (
    <div
      className={`nav-item group px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed transition-all duration-200 ${
        isActive ? 'text-white nav-active' : 'text-zinc-500 hover:text-zinc-600'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => e.preventDefault()}
    >
      <span className="relative z-10">Forum</span>
      {/* SVG X mark */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 70 20"
        fill="none"
        style={{ overflow: 'visible' }}
      >
        {/* First diagonal line */}
        <path
          ref={line1Ref}
          d="M8 3 L62 17"
          stroke="#dc2626"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Second diagonal line */}
        <path
          ref={line2Ref}
          d="M8 17 L62 3"
          stroke="#dc2626"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}