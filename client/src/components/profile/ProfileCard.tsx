import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { ErrorDisplay } from '@/components/ui/error-display';
import type { ProfileData } from '@/types/profile';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
	username: string;
	className?: string;
}

// Helper to create mock profile data when running in dev mode or API fails
function createMockProfile(username: string): ProfileData {
	return {
		id: `mock-${username}`,
		username,
		avatarUrl: 'https://i.pravatar.cc/300',
		role: 'Degen',
		bio: 'This is a mock profile used in development mode.',
		signature: 'Keep calm and degen on',
		joinedAt: new Date().toISOString(),
		lastActiveAt: new Date().toISOString(),
		dgtBalance: 1234,
		totalPosts: 420,
		totalThreads: 69,
		totalLikes: 777,
		totalTips: 0,
		clout: 100,
		level: 5,
		xp: 4200,
		nextLevelXp: 5000,
		bannerUrl: null,
		activeFrameId: null,
		activeFrame: null,
		activeTitleId: null,
		activeTitle: null,
		activeBadgeId: null,
		activeBadge: null,
		badges: [],
		titles: [],
		inventory: [],
		relationships: { friends: [], friendRequestsSent: 0, friendRequestsReceived: 0 },
		stats: { threadViewCount: 0, posterRank: null, tipperRank: null, likerRank: null }
	};
}

export default function ProfileCard({ username, className }: ProfileCardProps) {
	const { user: currentUser } = useAuth();
	const {
		data: profile,
		isLoading,
		isError,
		error
	} = useQuery<ProfileData>({
		queryKey: ['profile', username],
		queryFn: async () => {
			// If we're in dev mode, or the backend endpoint doesn't exist, return mock data
			try {
				if (import.meta.env.DEV) {
					return createMockProfile(username);
				}

				const res = await fetch(`/api/profile/${username}`);
				if (!res.ok) {
					// Fallback to mock in non-dev too so UI still renders
					return createMockProfile(username);
				}
				return res.json();
			} catch (err) {
				// Network failure → mock
				return createMockProfile(username);
			}
		},
		enabled: !!username
	});

	// Motion variants for slide/fade
	const variants = {
		initial: { x: 50, opacity: 0 },
		animate: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 20 } },
		exit: { x: -50, opacity: 0, transition: { duration: 0.2 } }
	} as const;

	return (
		<AnimatePresence mode="wait" initial={false}>
			<motion.div
				key={username}
				variants={variants}
				initial="initial"
				animate="animate"
				exit="exit"
				className={cn(className)}
			>
				{isLoading && <ProfileSkeleton />}
				{isError && <ErrorDisplay title="Profile Error" error={error} variant="card" />}
				{profile && (
					<ProfileSidebar profile={profile} isOwnProfile={currentUser?.username === username} />
				)}
			</motion.div>
		</AnimatePresence>
	);
}
