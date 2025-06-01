// ARCHIVED: This file has been migrated to /client/src/features/forum/components/CreateThreadButton.tsx
// See refactor-tracker.md for migration details.
import React from 'react';
import { Link } from 'wouter';
import { Button, ButtonProps } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface CreateThreadButtonProps extends ButtonProps {
  categoryId?: number;
  onThreadCreated?: () => void;
}

export function CreateThreadButton({ 
  categoryId,
  onThreadCreated,
  className = '',
  variant = 'default',
  ...props
}: CreateThreadButtonProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  
  if (!isLoggedIn) {
    return (
      <Button 
        variant="outline"
        asChild
        className={`${className}`}
        {...props}
      >
        <Link href="/auth?redirect_to=forum">
          <Plus className="h-4 w-4 mr-2" />
          Sign in to Post
        </Link>
      </Button>
    );
  }
  
  return (
    <Button 
      variant={variant}
      className={`${className}`}
      asChild
      {...props}
    >
      <Link href={`/threads/create${categoryId ? `?categoryId=${categoryId}` : ''}`}>
        <Plus className="h-4 w-4 mr-2" />
        New Thread
      </Link>
    </Button>
  );
}