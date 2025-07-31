import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { BannerCard } from './BannerCard';
import Autoplay from 'embla-carousel-autoplay';

export function BannerCarousel() {
  const plugin = React.useMemo(
    () => [Autoplay({ delay: 5000, stopOnInteraction: true })],
    []
  );

  // Hardcoded banner data - no external dependencies!
  const banners = [
    {
      title: "Crypto Casino",
      description: "High stakes crypto gambling discussion",
      icon: "🎰",
      color: "from-yellow-600/20 to-orange-600/20",
      stats: { users: 420, threads: 69, trending: true }
    },
    {
      title: "Shitcoin Alley",
      description: "The wild west of crypto moonshots",
      icon: "🚀",
      color: "from-purple-600/20 to-pink-600/20",
      stats: { users: 1337, threads: 420, trending: true }
    },
    {
      title: "General Discussion",
      description: "Everything crypto and beyond",
      icon: "💬",
      color: "from-blue-600/20 to-cyan-600/20",
      stats: { users: 888, threads: 234 }
    },
    {
      title: "Trading Analysis",
      description: "Technical analysis and trading strategies",
      icon: "📈",
      color: "from-green-600/20 to-emerald-600/20",
      stats: { users: 555, threads: 123, trending: true }
    }
  ];

  return (
    <div className="w-full overflow-hidden bg-gradient-to-b from-zinc-900/50 to-transparent">
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
            {banners.map((banner, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <BannerCard {...banner} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </div>
  );
}