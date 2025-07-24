import React from 'react';
import { cn } from '@app/utils/utils';

interface RadarLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const RadarLoader: React.FC<RadarLoaderProps> = ({ 
  size = 'md', 
  className,
  text = 'Scanning...'
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        {/* Radar background circles */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 rounded-full border border-emerald-500/20" />
          <div className="absolute inset-2 rounded-full border border-emerald-500/15" />
          <div className="absolute inset-4 rounded-full border border-emerald-500/10" />
          <div className="absolute inset-6 rounded-full border border-emerald-500/5" />
        </div>
        
        {/* Radar sweep */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-emerald-500/20 to-emerald-500/40" 
              style={{ 
                clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%)',
                filter: 'blur(2px)'
              }}
            />
          </div>
        </div>
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
        </div>
        
        {/* Blinking dots (detected items) */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
          <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Pulse effect */}
        <div className="absolute inset-0 rounded-full animate-pulse-ring" />
      </div>
      
      {/* Loading text */}
      <div className={cn('text-emerald-400 font-medium', textSizeClasses[size])}>
        <span className="inline-flex items-center gap-2">
          <span className="relative">
            <span className="absolute inset-0 bg-emerald-400 blur-md opacity-50 animate-pulse" />
            <span className="relative">{text}</span>
          </span>
          {/* Signal bars animation */}
          <span className="inline-flex gap-0.5">
            <span className="w-1 h-3 bg-emerald-400 rounded-full animate-signal-bar" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-4 bg-emerald-400 rounded-full animate-signal-bar" style={{ animationDelay: '200ms' }} />
            <span className="w-1 h-5 bg-emerald-400 rounded-full animate-signal-bar" style={{ animationDelay: '400ms' }} />
          </span>
        </span>
      </div>
      
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-out infinite;
          border: 2px solid currentColor;
          color: rgb(16 185 129 / 0.5);
        }
        
        @keyframes signal-bar {
          0%, 100% {
            opacity: 0.3;
            transform: scaleY(0.5);
          }
          50% {
            opacity: 1;
            transform: scaleY(1);
          }
        }
        
        .animate-signal-bar {
          animation: signal-bar 1.5s ease-in-out infinite;
          transform-origin: bottom;
        }
      `}</style>
    </div>
  );
};