import React from 'react';
import { cn } from '@/lib/utils';

interface WideProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Wide
 * A simple wrapper that centres content using our global container specs but allows
 * it to grow to the full container width (1440-1760-1920 depending on breakpoint).
 * Usage:
 *   <Wide>
 *     <CardGrid />
 *   </Wide>
 */
export const Wide: React.FC<WideProps> = ({ as: Component = 'div', className = '', ...props }) => {
  return (
    <Component {...props} className={cn('container w-full', className)} />
  );
}; 