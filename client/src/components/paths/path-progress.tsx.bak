import React from "react";
import { Progress } from "@/components/ui/progress";
import { availablePaths, getPathDefinition } from "@shared/path-config";
import { cn } from "@/lib/utils";

// Icons from Lucide React
import * as LucideIcons from "lucide-react";

// Path level thresholds
const XP_LEVELS = {
  NOVICE: 100, 
  APPRENTICE: 250,
  ADEPT: 500,
  EXPERT: 1000,
  MASTER: 2000,
};

// Maximum XP for progress bar display (scaled proportionally if higher)
const MAX_DISPLAY_XP = 2000;

interface PathProgressProps {
  pathId: string;
  xp: number;
  isDominant?: boolean;
  className?: string;
}

/**
 * Calculate the level name based on XP amount
 */
function getPathLevel(xp: number): string {
  if (xp >= XP_LEVELS.MASTER) return "Master";
  if (xp >= XP_LEVELS.EXPERT) return "Expert";
  if (xp >= XP_LEVELS.ADEPT) return "Adept";
  if (xp >= XP_LEVELS.APPRENTICE) return "Apprentice";
  if (xp >= XP_LEVELS.NOVICE) return "Novice";
  return "Beginner";
}

/**
 * Get the percentage for the progress bar (scaled if XP > MAX_DISPLAY_XP)
 */
function getProgressPercentage(xp: number): number {
  if (xp <= 0) return 0;
  return Math.min(100, Math.floor((xp / MAX_DISPLAY_XP) * 100));
}

const PathProgress: React.FC<PathProgressProps> = ({ 
  pathId, 
  xp,
  isDominant = false,
  className = ""
}) => {
  const pathDef = getPathDefinition(pathId);
  
  // If path definition not found, don't render
  if (!pathDef) return null;
  
  // Get the appropriate Lucide icon
  const IconComponent = 
    (pathDef.icon && typeof pathDef.icon === 'string' && pathDef.icon in LucideIcons)
      ? (LucideIcons as any)[pathDef.icon]
      : LucideIcons.HelpCircle;
  
  // Calculate path level and progress
  const level = getPathLevel(xp);
  const progress = getProgressPercentage(xp);
  
  return (
    <div className={cn(
      "flex flex-col p-3 rounded-md border",
      isDominant ? "bg-muted/50 border-primary" : "",
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded bg-muted", pathDef.color)}>
          <IconComponent className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h4 className="font-medium">{pathDef.name}</h4>
            {isDominant && (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                Dominant
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{level}</p>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>{pathDef.description}</span>
          <span className="font-medium">{xp} XP</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};

export { PathProgress, getPathLevel, getProgressPercentage };