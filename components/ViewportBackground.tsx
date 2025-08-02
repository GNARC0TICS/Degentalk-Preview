import React from 'react';
import { cn } from '@/lib/utils';

interface SectionBackgroundProps {
  variant?: 'solid' | 'gradient';
  intensity?: number;
  className?: string;
  children: React.ReactNode;
}

export function SectionBackground({ 
  variant = 'solid',
  intensity = 0.15,
  className,
  children 
}: SectionBackgroundProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        variant === 'solid' && "bg-zinc-950",
        variant === 'gradient' && "bg-gradient-to-b from-zinc-900 to-zinc-950",
        className
      )}
      style={{
        backgroundColor: variant === 'solid' ? `rgba(0, 0, 0, ${1 - intensity})` : undefined
      }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/20 to-zinc-950/50 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}