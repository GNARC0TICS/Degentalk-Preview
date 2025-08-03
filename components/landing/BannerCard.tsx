import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface BannerCardProps {
  title: string;
  description: string;
  icon?: string;
  image?: string;
  color: string;
}

export function BannerCard({ title, description, icon, image, color }: BannerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2"
    >
      <Card className={`
        relative overflow-hidden aspect-[16/9] md:aspect-[9/5]
        border border-zinc-800 hover:border-zinc-400
        transition-all duration-300 cursor-pointer group
        bg-black
      `}>
        {/* Background Image positioned lower to create black space at top */}
        {image && (
          <div className="absolute inset-x-0 bottom-0 h-[70%] md:h-[75%] bg-zinc-900">
            <Image 
              src={image} 
              alt={`${title} - Degentalk crypto forum feature`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-center"
              priority={false}
              loading="lazy"
              quality={90}
            />
            {/* Gradient overlay that fades to black at the top */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-black/60 to-black" />
          </div>
        )}
        
        {/* If no image, use color background with gradient overlay */}
        {!image && (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${color}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </>
        )}
        
        <div className="relative z-10 flex flex-col justify-start h-full">
          {/* Content in the black space at top - no background needed */}
          <div className="px-4 py-3 md:px-6 md:py-4">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 drop-shadow-lg">{title}</h3>
            <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed line-clamp-3 md:line-clamp-none drop-shadow-md italic">
              {description}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}