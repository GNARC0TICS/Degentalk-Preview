import React from 'react';
import { cn } from '@/utils/utils';

interface Red3DButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Red3DButton = React.forwardRef<HTMLButtonElement, Red3DButtonProps>(
  ({ className, size = 'md', children, ...props }, ref) => {
    const baseClasses = 'relative font-bold uppercase tracking-wider text-white transition-all duration-200 transform-gpu';
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base'
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          sizeClasses[size],
          'group',
          'hover:translate-y-0.5',
          className
        )}
        style={{
          background: 'linear-gradient(145deg, #dc2626, #b91c1c)',
          boxShadow: '0 4px 0 #7f1d1d, 0 6px 10px rgba(0,0,0,0.3)',
          borderRadius: '0.5rem',
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'translateY(4px)';
          e.currentTarget.style.boxShadow = '0 0 0 #7f1d1d, 0 2px 5px rgba(0,0,0,0.3)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 0 #7f1d1d, 0 6px 10px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 0 #7f1d1d, 0 6px 10px rgba(0,0,0,0.3)';
        }}
        {...props}
      >
        {/* Inner gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-lg" />
        
        {/* Glowing effect on hover */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
          style={{
            background: 'radial-gradient(circle at center, rgba(239,68,68,0.3) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        
        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {children}
        </span>
        
        {/* Side highlights for 3D effect */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-red-400/50 to-transparent rounded-l-lg" />
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent to-red-900/50 rounded-r-lg" />
      </button>
    );
  }
);

Red3DButton.displayName = 'Red3DButton';