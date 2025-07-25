import React from 'react';
import './RadarLoader.css';

interface RadarLoaderProps {
  size?: number;
  speed?: number;
  color?: string;
  className?: string;
}

const RadarLoader: React.FC<RadarLoaderProps> = ({ 
  size = 150,
  speed = 2,
  color = 'seagreen',
  className = ''
}) => {
  return (
    <div className={`radar-loader-wrapper ${className}`}>
      <div 
        className="loader"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          '--radar-color': color,
          '--animation-speed': `${speed}s`
        } as React.CSSProperties}
      >
        <span />
      </div>
    </div>
  );
}

export default RadarLoader;