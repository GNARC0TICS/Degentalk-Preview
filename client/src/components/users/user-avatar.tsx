import { User } from "@db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  user: Pick<User, 'username' | 'avatarUrl'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const fallbackSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };

  // Get initials from username
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };
  
  // Default avatar path
  const defaultAvatarPath = "/images/ART/defaultavatar.png";

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={user.avatarUrl || defaultAvatarPath} alt={user.username} />
      <AvatarFallback className={fallbackSize[size]}>
        {getInitials(user.username)}
      </AvatarFallback>
    </Avatar>
  );
}
