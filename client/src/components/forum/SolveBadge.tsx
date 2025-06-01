import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface SolveBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SolveBadge({ size = 'md', className = '' }: SolveBadgeProps) {
  // Determine size classes
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-1.5',
    md: 'text-sm py-0.5 px-2',
    lg: 'text-base py-1 px-3',
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  return (
    <Badge 
      className={`bg-emerald-900/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700 font-medium flex items-center gap-1 ${sizeClasses[size]} ${className}`}
    >
      <CheckCircle className={iconSizes[size]} />
      <span>Solved</span>
    </Badge>
  );
}

export default SolveBadge; 