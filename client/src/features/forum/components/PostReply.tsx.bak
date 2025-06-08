import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, CornerUpRight, Flag, Check, Coins } from 'lucide-react';
import { PostWithUser } from '@shared/types';
import LevelBadge from './LevelBadge';

interface PostReplyProps {
  post: PostWithUser;
  isThreadOwner?: boolean;
  onLike?: (postId: number, hasLiked: boolean) => void;
  onMarkSolution?: (postId: number) => void;
  onReply?: (postId: number) => void;
  onTip?: (postId: number) => void;
  isSolution?: boolean;
  currentUserId?: number;
}

export function PostReply({
  post,
  isThreadOwner = false,
  onLike,
  onMarkSolution,
  onReply,
  onTip,
  isSolution = false,
  currentUserId
}: PostReplyProps) {
  const isOwn = post.userId === currentUserId;
  const hasLiked = post.hasLiked || false;
  
  return (
    <Card className={`mb-4 ${isSolution ? 'border-green-500 border-2' : ''}`}>
      <CardHeader className="py-3 px-4 flex flex-row items-start space-x-3 space-y-0">
        <Link href={`/profile/${post.user.username}`}>
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={post.user.avatarUrl || ''} alt={post.user.username} />
            <AvatarFallback>{post.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1 flex flex-col sm:flex-row sm:justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Link href={`/profile/${post.user.username}`}>
                <span className="font-semibold hover:underline cursor-pointer">{post.user.username}</span>
              </Link>
              <LevelBadge level={post.user.level} />
              {post.user.isAdmin && <Badge variant="destructive">Admin</Badge>}
              {post.user.isModerator && !post.user.isAdmin && <Badge variant="default">Mod</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              {post.isEdited && <span className="ml-2 italic">(edited)</span>}
            </p>
          </div>
          
          {isSolution && (
            <Badge variant="success" className="ml-auto flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              Solution
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="py-2 px-4">
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
        />
      </CardContent>
      
      <CardFooter className="px-4 py-2 flex flex-wrap gap-2 justify-between border-t">
        <div className="flex space-x-2">
          <Button 
            variant={hasLiked ? "default" : "ghost"} 
            size="sm"
            className="text-xs h-8"
            onClick={() => onLike && onLike(post.id, hasLiked)}
          >
            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
            {post.likesCount || 0}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8"
            onClick={() => onReply && onReply(post.id)}
          >
            <CornerUpRight className="h-3.5 w-3.5 mr-1" />
            Reply
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8"
            onClick={() => onTip && onTip(post.id)}
          >
            <Coins className="h-3.5 w-3.5 mr-1" />
            Tip
          </Button>
        </div>
        
        <div className="flex space-x-2">
          {isThreadOwner && !isSolution && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => onMarkSolution && onMarkSolution(post.id)}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Mark as Solution
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8"
          >
            <Flag className="h-3.5 w-3.5 mr-1" />
            Report
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 