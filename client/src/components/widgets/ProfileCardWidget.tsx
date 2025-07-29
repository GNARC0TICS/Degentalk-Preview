import React from 'react';
import { ProfileCard } from '@/components/shared/ProfileCard';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

/**
 * Widget wrapper for ProfileCard that handles authentication
 */
export default function ProfileCardWidget() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6 text-center">
          <LogIn className="h-8 w-8 mx-auto mb-3 text-zinc-500" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Sign in to view your profile and stats
          </p>
          <Button 
            onClick={() => navigate('/login')}
            className="w-full"
            variant="default"
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <ProfileCard username={user.username} variant="sidebar" />;
}