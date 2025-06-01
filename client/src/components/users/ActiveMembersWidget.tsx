import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Activity, ArrowRight } from 'lucide-react';

export interface ActiveUser {
  id: number | string;
  name: string;
  avatar: string | null;
  lastActive: string;
}

export interface ActiveMembersWidgetProps {
  users: ActiveUser[];
  title?: string;
  description?: string;
  className?: string;
  limit?: number;
  viewAllLink?: string;
  isLoading?: boolean;
}

/**
 * ActiveMembersWidget - Displays a list of currently active users
 * 
 * A reusable component that shows users who are active on the platform
 * with their avatars, names and last active status
 */
export function ActiveMembersWidget({
  users,
  title = "Active Members",
  description = "Members active in the last 30 minutes",
  className = "",
  limit = 5,
  viewAllLink = "/users",
  isLoading = false
}: ActiveMembersWidgetProps) {
  // Limit the number of users displayed
  const displayedUsers = users.slice(0, limit);
  
  return (
    <Card className={`bg-zinc-900/70 border border-zinc-800 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Users className="h-5 w-5 mr-2 text-zinc-400" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-zinc-500">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 text-center text-zinc-500">Loading active members...</div>
        ) : displayedUsers.length > 0 ? (
          <div className="divide-y divide-zinc-800/70">
            {displayedUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={user.avatar || ''} alt={user.name} />
                    <AvatarFallback className="bg-zinc-800 text-zinc-300">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.lastActive}</p>
                  </div>
                </div>
                <Activity className="h-4 w-4 text-zinc-400" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-zinc-500">No active members at the moment</div>
        )}
      </CardContent>
      <CardFooter className="bg-zinc-900/90 p-3 border-t border-zinc-800">
        <Link href={viewAllLink} className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center w-full justify-center">
          View All Members 
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}

export default ActiveMembersWidget; 