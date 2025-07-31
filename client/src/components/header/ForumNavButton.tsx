import React, { useEffect, useState } from 'react';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import gsap from 'gsap';

interface ForumNavButtonProps {
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children: React.ReactNode;
  navPath: string;
  defaultPath: string;
  navRef: (el: SVGPathElement | null) => void;
}

export function ForumNavButton({
  isActive,
  onMouseEnter,
  onMouseLeave,
  children,
  navPath,
  defaultPath,
  navRef
}: ForumNavButtonProps) {
  const [showAnnotations, setShowAnnotations] = useState(false);

  useEffect(() => {
    // Delay showing annotations for a nice effect
    const timer = setTimeout(() => {
      setShowAnnotations(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Add a fun shake animation when clicked
    const element = e.currentTarget;
    gsap.to(element, {
      x: '+=3',
      duration: 0.1,
      yoyo: true,
      repeat: 5,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set(element, { x: 0 });
      }
    });
  };

  return (
    <div
      className={`nav-item group px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed transition-all duration-200 ${
        isActive ? 'text-white nav-active' : 'text-zinc-300 hover:text-zinc-400'
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
    >
      <RoughNotationGroup show={showAnnotations}>
        <span className="relative z-10">
          <RoughNotation
            type="strike-through"
            color="#e55050"
            strokeWidth={2}
            iterations={2}
            animationDuration={800}
            show={showAnnotations}
          >
            Forum
          </RoughNotation>
        </span>
        
        {/* "Soon" annotation with arrow */}
        <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 z-20">
          <RoughNotation
            type="underline"
            color="#10b981"
            strokeWidth={1}
            padding={[2, 4]}
            iterations={1}
            animationDuration={600}
            animationDelay={800}
            show={showAnnotations}
          >
            <span className="text-emerald-400 text-xs font-handwritten whitespace-nowrap">
              soon™
            </span>
          </RoughNotation>
          
          {/* Hand-drawn arrow pointing up */}
          <svg
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-3 text-emerald-400"
            viewBox="0 0 20 15"
            fill="none"
            style={{ opacity: showAnnotations ? 1 : 0, transition: 'opacity 0.3s ease-in-out 1.4s' }}
          >
            <path
              d="M10 2 Q9 5 8 8 M10 2 Q11 5 12 8 M6 6 Q10 2 14 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </RoughNotationGroup>
      
      {/* Keep the original SVG underline for consistency */}
      <svg
        className="underline-svg w-full opacity-30"
        viewBox="0 0 70 20"
        fill="none"
        preserveAspectRatio="none"
        style={{ overflow: 'visible' }}
      >
        <path
          ref={navRef}
          className="nav-underline"
          d={navPath || defaultPath}
          stroke="#6b7280"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 4"
        />
      </svg>
    </div>
  );
}