'use client';

import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { BannerCard } from './BannerCard-optimized';

export function BannerCarousel() {
  const [autoplay, setAutoplay] = React.useState<any[]>([]);

  // Load autoplay plugin only on client side
  React.useEffect(() => {
    import('embla-carousel-autoplay').then((AutoplayModule) => {
      const Autoplay = AutoplayModule.default;
      setAutoplay([Autoplay({ delay: 5000, stopOnInteraction: true })]);
    });
  }, []);

  // Banner data with custom WebP images
  const banners = [
    {
      title: "Rain Events",
      description: "Catch the crypto rain and share the wealth with the community",
      image: "/banners/RainEvents.png.webp",
      color: "from-blue-600/20 to-cyan-600/20"
    },
    {
      title: "Premium Shop",
      description: "Level up your profile with exclusive items and cosmetics",
      image: "/banners/Shop2.webp",
      color: "from-green-600/20 to-emerald-600/20"
    },
    {
      title: "Live Shoutbox",
      description: "Real-time chaos and unfiltered discussion 24/7",
      image: "/banners/Shoutbox.webp",
      color: "from-red-600/20 to-pink-600/20"
    },
    {
      title: "Unhinged Mode",
      description: "Where the real degens come to play without limits",
      image: "/banners/Unhinged.webp",
      color: "from-purple-600/20 to-indigo-600/20"
    },
    {
      title: "User Roles",
      description: "Climb the ranks and earn exclusive badges and privileges",
      image: "/banners/UserRoles.webp",
      color: "from-indigo-600/20 to-purple-600/20"
    },
    {
      title: "XP System",
      description: "Level up through participation and unlock new features",
      image: "/banners/XP.webp",
      color: "from-emerald-600/20 to-green-600/20"
    }
  ];

  return (
    <div className="w-full overflow-hidden banner-carousel-section">
      <div className="px-4 py-4">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={autoplay}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {banners.map((banner, index) => (
              <CarouselItem key={index} className="pl-4 basis-full md:basis-1/2">
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