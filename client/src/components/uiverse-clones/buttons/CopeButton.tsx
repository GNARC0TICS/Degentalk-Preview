import React from 'react';
import { cn } from '@/utils/utils';

interface CopeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const CopeButton = React.forwardRef<HTMLButtonElement, CopeButtonProps>(
  ({ className, size = 'md', children, ...props }, ref) => {
    const baseClasses = 'relative overflow-hidden font-medium transition-all duration-300 transform hover:scale-95 active:scale-90 bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-300';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs rounded-md',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-xl'
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          sizeClasses[size],
          'group',
          className
        )}
        {...props}
      >
        {/* Sad wave effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        
        {/* Drooping corners effect */}
        <div className="absolute inset-0 rounded-inherit opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-zinc-600 rounded-tl-lg transform group-hover:translate-y-1 group-hover:-translate-x-1 transition-transform duration-300" />
          <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-zinc-600 rounded-tr-lg transform group-hover:translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
        
        {/* Button content with subtle droop animation */}
        <span className="relative z-10 flex items-center justify-center gap-2 group-hover:translate-y-0.5 transition-transform duration-300">
          <span className="text-zinc-500 group-hover:text-zinc-400">
            (╥﹏╥)
          </span>
          {children}
        </span>
        
        {/* Subtle shadow that grows on hover */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-0 group-hover:opacity-100 group-hover:h-1 blur-sm transition-all duration-300" />
      </button>
    );
  }
);

CopeButton.displayName = 'CopeButton';