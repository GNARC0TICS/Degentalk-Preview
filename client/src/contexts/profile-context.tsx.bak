import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useParams } from 'wouter';

export interface ProfileContextProps {
  /** Whether the currently viewed profile belongs to the logged-in user */
  isOwnProfile: boolean;
  /** Whether the profile is being viewed in edit mode */
  isEditMode: boolean;
  /** Toggle edit mode */
  toggleEditMode: () => void;
  /** The username of the profile being viewed */
  viewedUsername: string | null;
  /** Current profile visibility mode */
  viewMode: 'public' | 'private';
}

const ProfileContext = createContext<ProfileContextProps | undefined>(undefined);

export interface ProfileProviderProps {
  children: React.ReactNode;
  /** Override the viewed username (optional) */
  username?: string;
}

export function ProfileProvider({ children, username: overrideUsername }: ProfileProviderProps) {
  const { user } = useAuth();
  const params = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Get username from params or override
  const viewedUsername = overrideUsername || params.username || user?.username || null;
  
  // Determine if viewing own profile
  const isOwnProfile = !!user && !!viewedUsername && user.username === viewedUsername;
  
  // Set view mode based on ownership
  const viewMode = isOwnProfile ? 'private' : 'public';
  
  // Reset edit mode when changing profiles
  useEffect(() => {
    setIsEditMode(false);
  }, [viewedUsername]);
  
  // Toggle edit mode (only allowed on own profile)
  const toggleEditMode = () => {
    if (isOwnProfile) {
      setIsEditMode(prev => !prev);
    }
  };
  
  const value: ProfileContextProps = {
    isOwnProfile,
    isEditMode,
    toggleEditMode,
    viewedUsername,
    viewMode,
  };
  
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextProps {
  const context = useContext(ProfileContext);
  
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  
  return context;
}
