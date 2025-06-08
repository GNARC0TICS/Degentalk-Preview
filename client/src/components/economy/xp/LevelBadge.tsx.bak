import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type LevelBadgeProps = {
  level: number;
  showTooltip?: boolean;
  className?: string;
  size?: "xs" | "sm" | "md";
};

/**
 * Compact component to display a user's level next to their username
 * 
 * @param level - User's current level
 * @param showTooltip - Whether to show a tooltip with more info on hover
 * @param className - Additional class names
 * @param size - Size variant of the badge
 */
export function LevelBadge({
  level,
  showTooltip = true,
  className,
  size = "sm",
}: LevelBadgeProps) {
  // Get level title based on level
  const getLevelTitle = (level: number): string => {
    if (level < 5) return "Newcomer";
    if (level < 10) return "Explorer";
    if (level < 15) return "Regular";
    if (level < 25) return "Forum Enjoyer";
    if (level < 40) return "Forum Veteran";
    if (level < 60) return "Forum Expert";
    if (level < 80) return "Forum Master";
    return "Forum Legend";
  };

  // Get badge color based on level
  const getBadgeColors = () => {
    if (level < 10) return "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30";
    if (level < 25) return "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border-cyan-500/30";
    if (level < 50) return "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/30";
    return "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/30";
  };

  // Get size-related classes
  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "text-[10px] px-1 py-0.5 rounded";
      case "sm":
        return "text-xs px-1.5 py-0.5 rounded";
      case "md":
        return "text-sm px-2 py-1 rounded-md";
      default:
        return "text-xs px-1.5 py-0.5 rounded";
    }
  };

  // Get icon size classes
  const getIconSizeClasses = () => {
    switch (size) {
      case "xs":
        return "h-2.5 w-2.5 mr-0.5";
      case "sm":
        return "h-3 w-3 mr-0.5";
      case "md":
        return "h-3.5 w-3.5 mr-1";
      default:
        return "h-3 w-3 mr-0.5";
    }
  };

  const badgeContent = (
    <div
      className={cn(
        "inline-flex items-center font-medium border",
        getBadgeColors(),
        getSizeClasses(),
        className
      )}
    >
      <Sparkles className={getIconSizeClasses()} />
      {level}
    </div>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="p-2">
          <div className="text-center">
            <p className="font-semibold">Level {level}</p>
            <p className="text-xs text-zinc-400">{getLevelTitle(level)}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 