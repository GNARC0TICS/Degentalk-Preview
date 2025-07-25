import React from 'react';
import './GridBackground.css';

interface GridBackgroundProps {
  gap?: string;
  lineWidth?: string;
  lineColor?: string;
  backgroundColor?: string;
  className?: string;
}

const GridBackground: React.FC<GridBackgroundProps> = ({ 
  gap = '5em',
  lineWidth = '1px',
  lineColor = 'rgba(255, 255, 255, 0.2)',
  backgroundColor = '#000000',
  className = ''
}) => {
  return (
    <div className={`grid-background-wrapper ${className}`}>
      <div 
        className="grid-container" 
        style={{
          '--gap': gap,
          '--line': lineWidth,
          '--color': lineColor,
          backgroundColor
        } as React.CSSProperties}
      />
    </div>
  );
}

export default GridBackground;