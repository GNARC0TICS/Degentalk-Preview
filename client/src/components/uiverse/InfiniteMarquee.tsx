import React from 'react';
import './InfiniteMarquee.css';

interface InfiniteMarqueeProps {
  title?: string;
  items?: string[];
  speed?: number;
  className?: string;
}

const InfiniteMarquee: React.FC<InfiniteMarqueeProps> = ({ 
  title = 'Infinite Marquee',
  items = [
    '🔥 Item 1',
    '✨ Item 2', 
    '🚀 Item 3',
    '🌟 Item 4',
    '🎉 Item 5'
  ],
  speed = 15,
  className = ''
}) => {
  return (
    <div className={`infinite-marquee-wrapper ${className}`}>
      <div className="marquee">
        <div className="marquee_header">{title}</div>
        <div 
          className="marquee__inner"
          style={{ 
            animationDuration: `${speed}s` 
          }}
        >
          <div className="marquee__group">
            {items.map((item, index) => (
              <span key={index}>{item}</span>
            ))}
          </div>
          <div className="marquee__group">
            {items.map((item, index) => (
              <span key={index}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfiniteMarquee;