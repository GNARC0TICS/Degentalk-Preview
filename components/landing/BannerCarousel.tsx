'use client';

import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { BannerCard } from './BannerCard';
import { BannerSkeleton } from '@/components/ui/skeleton';

export function BannerCarousel() {
  const [autoplay, setAutoplay] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load autoplay plugin only on client side
  React.useEffect(() => {
    import('embla-carousel-autoplay').then((AutoplayModule) => {
      const Autoplay = AutoplayModule.default;
      setAutoplay([Autoplay({ delay: 5000, stopOnInteraction: true })]);
      // Simulate loading time for images
      setTimeout(() => setIsLoading(false), 100);
    });
  }, []);

  // Banner data with custom WebP images
  const banners = [
    {
      title: "Rain Events",
      description: "Join spontaneous $DGT rain events where whales shower the community. Set your umbrellas, compete in mini-games, and watch the chat explode as tokens fall from the sky.",
      image: "/banners/RainEvents.png.webp",
      color: "from-blue-600/20 to-cyan-600/20"
    },
    {
      title: "Cosmetic Shop",
      description: "Spend your hard-earned $DGT on legendary titles, username flair, custom emojis, XP boosts, profile bling, and VIP passes. Stand out from the crowd with exclusive cosmetics.",
      image: "/banners/Shop2.webp",
      color: "from-green-600/20 to-emerald-600/20"
    },
    {
      title: "Live Shoutbox",
      description: "The heartbeat of Degentalk. Real-time chat where deals are made, tips are shared, and legends are born. Join live events, mini-games, and establish your degen identity.",
      image: "/banners/Shoutbox.webp",
      color: "from-red-600/20 to-pink-600/20"
    },
    {
      title: "Unhinged Mode",
      description: "Toggle the chaos. No filters, no censorship, pure degeneracy. Enable profanity and NSFW content for the full Degentalk experience. Not for the faint of heart.",
      image: "/banners/Unhinged.webp",
      color: "from-purple-600/20 to-indigo-600/20"
    },
    {
      title: "User Roles",
      description: "Rise through the ranks from Degen to VIP to Moderator and beyond. Each role unlocks new powers: moderate threads, manage campaigns, run events, or join the dev team.",
      image: "/banners/UserRoles.webp",
      color: "from-indigo-600/20 to-purple-600/20"
    },
    {
      title: "XP System",
      description: "Every post, thread, reply, and daily login earns XP. Level up to unlock perks, build reputation, gain privileges, and earn $DGT rewards. The grind never stops.",
      image: "/banners/XP.webp",
      color: "from-emerald-600/20 to-green-600/20"
    }
  ];

  return (
    <div className="w-full overflow-hidden banner-carousel-section">
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex gap-4">
            <div className="w-full md:w-1/2">
              <BannerSkeleton />
            </div>
            <div className="hidden md:block w-1/2">
              <BannerSkeleton />
            </div>
          </div>
        ) : (
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            plugins={autoplay}
            className="w-full"
          >
            <CarouselContent>
              {banners.map((banner, index) => (
                <CarouselItem key={index} className="pl-4 basis-full md:basis-1/2">
                  <BannerCard {...banner} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        )}
      </div>
    </div>
  );
}