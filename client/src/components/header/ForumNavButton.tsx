import React, { useState } from 'react';
import { RoughNotation } from 'react-rough-notation';

interface ForumNavButtonProps {
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function ForumNavButton({
  isActive,
  onMouseEnter,
  onMouseLeave
}: ForumNavButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={`nav-item group px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed transition-all duration-200 ${
        isActive ? 'text-white nav-active' : 'text-zinc-300 hover:text-zinc-400'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <span className="relative z-10">
        <RoughNotation
          type="strike-through"
          color="#e55050"
          strokeWidth={3}
          iterations={2}
          animationDuration={300}
          show={isHovered}
        >
          Forum
        </RoughNotation>
      </span>
    </div>
  );
}