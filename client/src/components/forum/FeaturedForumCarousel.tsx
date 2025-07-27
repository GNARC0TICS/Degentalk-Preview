import React from 'react';
import { cn } from '@/utils/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ConfigurableFeaturedForumCard, type ConfigurableFeaturedForumCardProps } from './ConfigurableFeaturedForumCard';
import Autoplay from 'embla-carousel-autoplay';

interface FeaturedForumCarouselProps {
  forums: ConfigurableFeaturedForumCardProps['forum'][];
  autoRotateMs?: number;
  className?: string;
}

export function FeaturedForumCarousel({ 
  forums, 
  autoRotateMs = 5000,
  className 
}: FeaturedForumCarouselProps) {
  const plugin = React.useMemo(
    () => autoRotateMs > 0 ? [Autoplay({ delay: autoRotateMs, stopOnInteraction: true })] : [],
    [autoRotateMs]
  );

  if (!forums || forums.length === 0) {
    return null;
  }

  // If only one forum, don't use carousel
  if (forums.length === 1) {
    return (
      <div className={cn('w-full px-4 py-6', className)}>
        <ConfigurableFeaturedForumCard forum={forums[0]} />
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-hidden', className)}>
      <div className="px-4 py-4">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={plugin}
          className="w-full"
        >
        <CarouselContent className="-ml-4">
          {forums.map((forum, index) => (
            <CarouselItem key={forum.slug || index} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <ConfigurableFeaturedForumCard forum={forum} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {forums.length > 3 && (
          <>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </>
        )}
      </Carousel>
      </div>
    </div>
  );
}

export default FeaturedForumCarousel;