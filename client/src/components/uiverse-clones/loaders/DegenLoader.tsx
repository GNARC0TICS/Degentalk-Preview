import React from 'react';
import { cn } from '@/utils/utils';
// import { useUiverseConfig } from '@/contexts/UiverseConfigContext';

interface DegenLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  context?: string; // For context-specific text
}

export const DegenLoader: React.FC<DegenLoaderProps> = ({ 
  size = 'md', 
  className,
  text = 'Loading...',
  context
}) => {
  // const { config, userLevel } = useUiverseConfig();
  // const loaderConfig = config.loaderMessages.degenLoader;
  
  // Determine text based on context, user level, or fallback
  const displayText = text;
  const cryptoSymbol = '$'; // Default for now
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
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
        {/* Outer spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-spin" 
          style={{ animationDuration: '3s' }}
        />
        
        {/* Inner counter-spinning ring */}
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-cyan-500 border-r-emerald-500 animate-spin" 
          style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
        />
        
        {/* Center crypto symbol with pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <span className="text-emerald-400 font-bold animate-pulse" 
              style={{ 
                fontSize: size === 'sm' ? '1rem' : size === 'md' ? '1.5rem' : '2.5rem',
                textShadow: '0 0 20px rgba(16,185,129,0.8)'
              }}
            >
              {cryptoSymbol}
            </span>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-emerald-400/30 blur-xl animate-pulse" />
          </div>
        </div>
        
        {/* Orbiting coins */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
          <div className="absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-full h-full bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
          </div>
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDelay: '1.3s' }}>
          <div className="absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-full h-full bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
          </div>
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDelay: '2.6s' }}>
          <div className="absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-full h-full bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
          </div>
        </div>
      </div>
      
      {/* Loading text with typewriter effect */}
      <div className={cn('text-emerald-400 font-medium', textSizeClasses[size])}>
        <span className="inline-flex items-center gap-1">
          {displayText}
          <span className="inline-flex gap-0.5">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
          </span>
        </span>
      </div>
    </div>
  );
};