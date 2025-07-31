import React, { useState } from 'react';
import { RoughNotation } from 'react-rough-notation';

interface ForumNavButtonProps {
  isActive: boolean;
}

export function ForumNavButton({ isActive }: ForumNavButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`nav-item group px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed transition-all duration-200 ${
        isActive ? 'text-white nav-active' : 'text-zinc-500'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <RoughNotation
        type="crossed-off"
        show={isHovered}
        color="#e55050"
        strokeWidth={4}
        iterations={2}
        animationDuration={300}
      >
        <span className="inline-block">Forum</span>
      </RoughNotation>
    </div>
  );
}