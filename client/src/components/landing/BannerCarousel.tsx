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

  // Banner data with custom WebP images
  const banners = [
    {
      title: "Rain Events",
      description: "Catch the crypto rain and share the wealth",
      image: "/banners/RainEvents.png.webp",
      color: "from-blue-600/20 to-cyan-600/20",
      stats: { users: 1337, threads: 420, trending: true }
    },
    {
      title: "Premium Shop",
      description: "Level up your profile with premium items",
      image: "/banners/Shop2.webp",
      color: "from-green-600/20 to-emerald-600/20",
      stats: { users: 555, threads: 123 }
    },
    {
      title: "Live Shoutbox",
      description: "Real-time chaos and unfiltered discussion",
      image: "/banners/Shoutbox.webp",
      color: "from-red-600/20 to-pink-600/20",
      stats: { users: 3210, threads: 999, trending: true }
    },
    {
      title: "Unhinged Mode",
      description: "Where the real degens come to play",
      image: "/banners/Unhinged.webp",
      color: "from-purple-600/20 to-indigo-600/20",
      stats: { users: 666, threads: 69, trending: true }
    },
    {
      title: "User Roles",
      description: "Climb the ranks and earn your badges",
      image: "/banners/UserRoles.webp",
      color: "from-indigo-600/20 to-purple-600/20",
      stats: { users: 1500, threads: 450 }
    },
    {
      title: "XP System",
      description: "Level up and unlock exclusive features",
      image: "/banners/XP.webp",
      color: "from-emerald-600/20 to-green-600/20",
      stats: { users: 2100, threads: 678, trending: true }
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