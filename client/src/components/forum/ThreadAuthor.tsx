import React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LevelBadge } from "@/components/economy/xp/LevelBadge";

type ThreadAuthorProps = {
  username: string;
  avatarUrl?: string;
  level: number;
  title?: {
    name: string;
    color: string;
  };
  isVerified?: boolean;
  isModerator?: boolean;
  isAdmin?: boolean;
  size?: "sm" | "md" | "lg";
  showLevelBadge?: boolean;
  className?: string;
};

/**
 * Component to display thread author information with their level badge
 */
export function ThreadAuthor({
  username,
  avatarUrl,
  level,
  title,
  isVerified = false,
  isModerator = false,
  isAdmin = false,
  size = "md",
  showLevelBadge = true,
  className,
}: ThreadAuthorProps) {
  // Get avatar size class based on size prop
  const getAvatarSizeClass = () => {
    switch (size) {
      case "sm":
        return "h-6 w-6";
      case "md":
        return "h-8 w-8";
      case "lg":
        return "h-10 w-10";
      default:
        return "h-8 w-8";
    }
  };

  // Get username size class based on size prop
  const getUsernameSizeClass = () => {
    switch (size) {
      case "sm":
        return "text-xs";
      case "md":
        return "text-sm";
      case "lg":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  // Get level badge size based on size prop
  const getLevelBadgeSize = () => {
    switch (size) {
      case "sm":
        return "xs";
      case "md":
        return "sm";
      case "lg":
        return "md";
      default:
        return "sm";
    }
  };

  // Get title color class based on title color
  const getTitleColorClass = (color: string) => {
    switch (color) {
      case "emerald":
        return "text-emerald-400";
      case "cyan":
        return "text-cyan-400";
      case "blue":
        return "text-blue-400";
      case "purple":
        return "text-purple-400";
      case "amber":
        return "text-amber-400";
      case "red":
        return "text-red-400";
      case "pink":
        return "text-pink-400";
      case "orange":
        return "text-orange-400";
      default:
        return "text-zinc-400";
    }
  };

  return (
    <div className={cn("flex items-center", className)}>
      <Link href={`/profile/${username}`} className="flex items-center group">
        <Avatar className={cn("mr-2", getAvatarSizeClass())}>
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback>
            {username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-medium group-hover:text-primary transition-colors",
                getUsernameSizeClass(),
                isAdmin
                  ? "text-red-400"
                  : isModerator
                  ? "text-blue-400"
                  : "text-zinc-100"
              )}
            >
              {username}
            </span>

            {/* Level Badge */}
            {showLevelBadge && (
              <LevelBadge 
                level={level} 
                size={getLevelBadgeSize() as "xs" | "sm" | "md"} 
              />
            )}

            {/* Verification Badge */}
            {isVerified && (
              <svg
                className="h-3.5 w-3.5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          {/* User Title */}
          {title && (
            <span
              className={cn(
                "text-xs font-medium",
                getTitleColorClass(title.color)
              )}
            >
              {title.name}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
} 