import React from 'react';
import { Link } from 'wouter';
import { Button, ButtonProps } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES } from '@/constants/routes';

interface CreateThreadButtonProps extends ButtonProps {
  categoryId?: number;
  onThreadCreated?: () => void;
}

export function CreateThreadButton({ 
  categoryId,
  onThreadCreated,
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}: CreateThreadButtonProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  
  if (!isLoggedIn) {
    return (
      <Button 
        variant="outline"
        size={size}
        asChild
        className={className}
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
      size={size}
      className={className}
      asChild
      {...props}
    >
      <Link href={categoryId ? `/threads/create?categoryId=${categoryId}` : '/threads/create'}>
        <Plus className="h-4 w-4 mr-2" />
        New Thread
      </Link>
    </Button>
  );
} 