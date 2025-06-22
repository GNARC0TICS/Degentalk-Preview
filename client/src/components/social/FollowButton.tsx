import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2, UserPlus, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
	userId: string;
	username: string;
	variant?: 'default' | 'outline' | 'ghost';
	size?: 'sm' | 'default' | 'lg';
	showText?: boolean;
	className?: string;
}

export function FollowButton({
	userId,
	username,
	variant = 'outline',
	size = 'default',
	showText = true,
	className
}: FollowButtonProps) {
	const { toast } = useToast();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [isHovered, setIsHovered] = useState(false);

	// Don't show follow button for self or if not authenticated
	if (!user || user.id === userId) {
		return null;
	}

	// Check if currently following
	const { data: followStatus, isLoading: statusLoading } = useQuery({
		queryKey: [`/api/follow-status/${userId}`],
		queryFn: async () => {
			return await apiRequest<{ isFollowing: boolean }>({
				url: `/api/follow-status/${userId}`,
				method: 'GET'
			});
		}
	});

	// Follow mutation
	const followMutation = useMutation({
		mutationFn: async () => {
			return await apiRequest({
				url: '/api/follow',
				method: 'POST',
				data: { userIdToFollow: userId }
			});
		},
		onSuccess: () => {
			toast({
				title: `You're now watching @${username} 👀`,
				description: `Added to your Whale Watch`,
				variant: 'default'
			});
			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: [`/api/follow-status/${userId}`] });
			queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/follow-counts`] });
			queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/following`] });
		},
		onError: (error: any) => {
			toast({
				title: 'Failed to follow',
				description: error.message || 'Something went wrong',
				variant: 'destructive'
			});
		}
	});

	// Unfollow mutation
	const unfollowMutation = useMutation({
		mutationFn: async () => {
			return await apiRequest({
				url: '/api/unfollow',
				method: 'DELETE',
				data: { userIdToUnfollow: userId }
			});
		},
		onSuccess: () => {
			toast({
				title: `Stopped watching @${username}`,
				description: `Removed from your Whale Watch`,
				variant: 'default'
			});
			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: [`/api/follow-status/${userId}`] });
			queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/follow-counts`] });
			queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/following`] });
		},
		onError: (error: any) => {
			toast({
				title: 'Failed to unfollow',
				description: error.message || 'Something went wrong',
				variant: 'destructive'
			});
		}
	});

	const isFollowing = followStatus?.isFollowing || false;
	const isLoading = statusLoading || followMutation.isPending || unfollowMutation.isPending;

	const handleClick = () => {
		if (isFollowing) {
			unfollowMutation.mutate();
		} else {
			followMutation.mutate();
		}
	};

	const getButtonContent = () => {
		if (isLoading) {
			return (
				<>
					<Loader2 className="h-4 w-4 animate-spin" />
					{showText && <span className="ml-2">Loading...</span>}
				</>
			);
		}

		if (isFollowing) {
			return (
				<>
					{isHovered ? (
						<>
							<EyeOff className="h-4 w-4" />
							{showText && <span className="ml-2">Unwatch</span>}
						</>
					) : (
						<>
							<UserCheck className="h-4 w-4" />
							{showText && <span className="ml-2">Watching</span>}
						</>
					)}
				</>
			);
		}

		return (
			<>
				<Eye className="h-4 w-4" />
				{showText && <span className="ml-2">Watch</span>}
			</>
		);
	};

	const getButtonVariant = () => {
		if (isFollowing && isHovered) {
			return 'destructive';
		}
		if (isFollowing) {
			return 'secondary';
		}
		return variant;
	};

	return (
		<Button
			variant={getButtonVariant()}
			size={size}
			onClick={handleClick}
			disabled={isLoading}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={cn(
				'transition-all duration-200',
				isFollowing && isHovered && 'border-red-700 text-red-400',
				className
			)}
			title={
				isFollowing
					? `Remove @${username} from your Whale Watch`
					: `Add @${username} to your Whale Watch`
			}
		>
			{getButtonContent()}
		</Button>
	);
}
