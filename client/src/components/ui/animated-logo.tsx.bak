import React from 'react';

export function AnimatedLogo({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="shimmer" gradientTransform="rotate(15)">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="10%" stopColor="rgba(255,255,255,0)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="90%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            from="-1 0"
            to="1 0"
            dur="2s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>

      <image 
        href="/images/Dgen.PNG" 
        width="100%" 
        height="100%" 
        preserveAspectRatio="xMidYMid meet"
      />

      <rect
        width="100%"
        height="100%"
        fill="url(#shimmer)"
        style={{
          mixBlendMode: 'overlay'
        }}
      />
    </svg>
  );
}