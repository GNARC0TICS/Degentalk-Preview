import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users } from 'lucide-react';
import { cn } from '@/utils/utils';

interface OnlineUsersDisplayProps {
  users: string[];
  title?: string;
  showAvatars?: boolean;
  showTextList?: boolean;
  maxAvatars?: number;
  theme?: 'modern' | 'classic';
  className?: string;
}

export function OnlineUsersDisplay({
  users,
  title = "Who's Online",
  showAvatars = true,
  showTextList = true,
  maxAvatars = 8,
  theme = 'modern',
  className
}: OnlineUsersDisplayProps) {
  if (!users || users.length === 0) {
    return null;
  }

  const isClassic = theme === 'classic';

  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <h4 className={cn(
          "text-xs font-semibold flex items-center gap-2",
          isClassic ? "text-zinc-300" : "text-zinc-300"
        )}>
          <Users className={cn(
            "w-3 h-3",
            isClassic ? "text-emerald-400" : "text-emerald-400"
          )} />
          {title} ({users.length} users active)
        </h4>
      )}

      {showAvatars && (
        <div className="flex -space-x-2">
          <TooltipProvider>
            {users.slice(0, maxAvatars).map((username, idx) => (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <Link
                    to={`/users/${username}`}
                    className="relative group"
                  >
                    <Avatar className={cn(
                      "border-2 transition-transform group-hover:scale-110 group-hover:z-10",
                      isClassic ? "w-6 h-6 border-zinc-800" : "w-8 h-8 border-zinc-900"
                    )}>
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} />
                      <AvatarFallback className={cn(
                        "text-xs",
                        isClassic ? "bg-zinc-700 text-[10px]" : "bg-zinc-700"
                      )}>
                        {username[0]}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <div className={cn(
                      "absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border",
                      isClassic ? "border-zinc-800" : "border-zinc-900"
                    )} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{username}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            {users.length > maxAvatars && (
              <div className={cn(
                "rounded-full border-2 flex items-center justify-center",
                isClassic ? "w-6 h-6 bg-zinc-700 border-zinc-800" : "w-8 h-8 bg-zinc-700 border-zinc-900"
              )}>
                <span className={cn(
                  "text-zinc-400",
                  isClassic ? "text-[10px]" : "text-xs"
                )}>
                  +{users.length - maxAvatars}
                </span>
              </div>
            )}
          </TooltipProvider>
        </div>
      )}

      {showTextList && (
        <div className={cn(
          "text-xs",
          isClassic ? "mybb-online-list" : "text-zinc-400"
        )}>
          {users.map((username, idx) => (
            <span key={idx}>
              <Link
                to={`/users/${username}`}
                className={cn(
                  "hover:underline",
                  isClassic ? "mybb-username" : "text-emerald-400 hover:text-emerald-300"
                )}
              >
                {username}
              </Link>
              {idx < users.length - 1 && <span className="text-zinc-500">, </span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}