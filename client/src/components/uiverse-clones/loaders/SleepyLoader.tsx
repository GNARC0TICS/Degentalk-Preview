import React, { useState, useEffect } from 'react';
import { cn } from '@app/utils/utils';

interface SleepyLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  messages?: string[];
}

const defaultMessages = [
  "This is taking a while...",
  "Still working on it...",
  "Maybe grab a coffee? ☕",
  "Almost there... probably...",
  "Zzz... oh, still loading!",
  "Have you tried turning it off and on again?",
  "Loading harder...",
  "My bad, this is slow today...",
  "🐌 Snail mode activated",
  "Worth the wait, I promise!"
];

export const SleepyLoader: React.FC<SleepyLoaderProps> = ({ 
  size = 'md', 
  className,
  messages = defaultMessages
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isYawning, setIsYawning] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [messages.length]);
  
  useEffect(() => {
    const yawnInterval = setInterval(() => {
      setIsYawning(true);
      setTimeout(() => setIsYawning(false), 2000);
    }, 8000);
    
    return () => clearInterval(yawnInterval);
  }, []);
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };
  
  const faceSizeClasses = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-6xl'
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        {/* Sleepy face container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn('transition-all duration-500', faceSizeClasses[size], isYawning ? 'scale-110' : 'scale-100')}>
            {/* Face */}
            <div className="relative">
              {/* Base emoji */}
              <span className="block animate-pulse" style={{ animationDuration: '3s' }}>
                {isYawning ? '🥱' : '😴'}
              </span>
              
              {/* Floating Z's */}
              <div className="absolute -right-4 -top-2">
                <span className="absolute text-lg text-zinc-400 animate-float-away" style={{ animationDelay: '0s' }}>z</span>
                <span className="absolute text-sm text-zinc-500 animate-float-away" style={{ animationDelay: '1s' }}>z</span>
                <span className="absolute text-xs text-zinc-600 animate-float-away" style={{ animationDelay: '2s' }}>z</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress ring */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-zinc-800"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * 0.25}`}
            className="text-emerald-500/50 animate-slow-spin"
            style={{ animationDuration: '4s' }}
          />
        </svg>
      </div>
      
      {/* Messages */}
      <div className={cn('text-zinc-400 text-center max-w-xs', textSizeClasses[size])}>
        <p className="transition-opacity duration-500">
          {messages[messageIndex]}
        </p>
      </div>
      
      <style>{`
        @keyframes float-away {
          0% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translate(20px, -30px) scale(1);
            opacity: 0;
          }
        }
        
        .animate-float-away {
          animation: float-away 3s ease-out infinite;
        }
        
        @keyframes slow-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-slow-spin {
          animation: slow-spin 4s linear infinite;
        }
      `}</style>
    </div>
  );
};