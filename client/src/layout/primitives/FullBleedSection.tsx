import React from 'react';
import { cn } from '@/lib/utils';

interface FullBleedSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** optional class applied to the background container */
  backgroundClassName?: string;
}

/**
 * FullBleedSection
 * Breaks the background out to the edges of the viewport while still
 * centre-aligning inner content with our container.
 *
 * Internally it renders two divs:
 *   1. A background wrapper using negative margins calculated to offset the container padding.
 *   2. A child `.container` that holds actual content.
 */
export const FullBleedSection: React.FC<FullBleedSectionProps> = ({
  children,
  className = '',
  backgroundClassName = '',
  ...props
}) => {
  return (
    <section {...props} className={cn('relative w-full', className)}>
      <div
        className={cn(
          // Use calc so it always matches container side padding (1rem)
          'w-screen relative left-[calc(-50vw+50%)]',
          backgroundClassName
        )}
      >
        <div className="container mx-auto">{children}</div>
      </div>
    </section>
  );
}; 