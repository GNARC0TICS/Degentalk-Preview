import React from 'react';
import { cn } from '@/lib/utils';

interface StickyRegionProps extends React.HTMLAttributes<HTMLDivElement> {
  top?: number; // top offset in px
}

export const StickyRegion: React.FC<StickyRegionProps> = ({ children, className = '', top = 80, ...props }) => {
  return (
    <div
      {...props}
      className={cn('sticky', className)}
      style={{ top, ...props.style }}
    >
      {children}
    </div>
  );
}; 