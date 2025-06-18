import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarFrameProps {
  avatarUrl: string;
  frame?: {
    imageUrl: string;
    rarityColor?: string;
  } | null;
  size?: number; // px
  className?: string;
}

export const AvatarFrame: React.FC<AvatarFrameProps> = ({ avatarUrl, frame, size = 48, className }) => {
  return (
    <div
      className={cn('relative inline-block', className)}
      style={{ width: size, height: size }}
    >
      {/* Avatar image */}
      <img
        src={avatarUrl}
        alt="avatar"
        className="rounded-full w-full h-full object-cover"
      />

      {/* Frame overlay */}
      {frame && (
        <img
          src={frame.imageUrl}
          alt="frame"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={frame.rarityColor ? { boxShadow: `0 0 0 2px ${frame.rarityColor}` } : undefined}
        />
      )}
    </div>
  );
}; 