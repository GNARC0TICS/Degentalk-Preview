import React from 'react';
import { cn } from '@app/utils/utils';
import './pump-button.css';

interface PumpButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'pump' | 'dump' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  children: React.ReactNode;
}

export const PumpButton = React.forwardRef<HTMLButtonElement, PumpButtonProps>(
  ({ className, variant = 'pump', size = 'md', pulse = true, children, ...props }, ref) => {
    const baseClasses = 'relative overflow-hidden font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95';
    
    const variantClasses = {
      pump: 'bg-gradient-to-r from-emerald-500 to-green-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.8)]',
      dump: 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]',
      neutral: 'bg-gradient-to-r from-zinc-700 to-zinc-600 text-white shadow-[0_0_20px_rgba(113,113,122,0.3)] hover:shadow-[0_0_30px_rgba(113,113,122,0.5)]'
    };
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-xs rounded-lg',
      md: 'px-6 py-3 text-sm rounded-xl',
      lg: 'px-8 py-4 text-base rounded-2xl'
    };
    
    const pulseAnimation = pulse && variant === 'pump' ? 'animate-pulse' : '';
    
    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          pulseAnimation,
          'group',
          className
        )}
        {...props}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        
        {/* Ripple effect container */}
        <div className="absolute inset-0 rounded-inherit">
          <div className="absolute inset-0 rounded-inherit animate-ping opacity-30 bg-current" />
        </div>
        
        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {variant === 'pump' && (
            <svg className="w-4 h-4 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {variant === 'dump' && (
            <svg className="w-4 h-4 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {children}
        </span>
        
        {/* Energy particles (only for pump variant) */}
        {variant === 'pump' && (
          <>
            <div className="absolute top-0 left-1/4 w-1 h-1 bg-emerald-300 rounded-full animate-float-up opacity-0" />
            <div className="absolute top-0 left-1/2 w-1 h-1 bg-green-300 rounded-full animate-float-up opacity-0 animation-delay-200" />
            <div className="absolute top-0 left-3/4 w-1 h-1 bg-emerald-300 rounded-full animate-float-up opacity-0 animation-delay-400" />
          </>
        )}
      </button>
    );
  }
);

PumpButton.displayName = 'PumpButton';