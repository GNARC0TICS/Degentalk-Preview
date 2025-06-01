import { User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type UserBadgeProps = {
  user: Pick<User, 'level' | 'isVerified' | 'isBanned'>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
};

export function UserBadge({ user, className, size = 'md', showLevel = true }: UserBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-0.5',
  };

  if (user.isBanned) {
    return (
      <Badge 
        variant="destructive" 
        className={cn(sizeClasses[size], className)}
      >
        Banned
      </Badge>
    );
  }

  if (user.isVerified) {
    return (
      <Badge 
        variant="outline" 
        className={cn("border-blue-300 bg-blue-50 text-blue-800", sizeClasses[size], className)}
      >
        Verified
      </Badge>
    );
  }

  if (showLevel) {
    return (
      <Badge 
        variant="secondary"
        className={cn(sizeClasses[size], className)}
      >
        Level {user.level}
      </Badge>
    );
  }

  return null;
}
