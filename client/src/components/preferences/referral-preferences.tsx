import React from 'react';
import type { User } from '@/types/compat/user';
import { useUserReferrals } from '@/features/users/hooks/useUserReferrals';
import { PreferencesCard } from './PreferencesCard';
import { PreferencesGroup } from './PreferencesGroup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Clipboard, Share2, Users, Link, User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface ReferralPreferencesProps {
	user: User;
}

export function ReferralPreferences({ user }: ReferralPreferencesProps) {
	const { referralStats, referralLink, isLoading, copyReferralLink, isCopied } = useUserReferrals();

	// Generate a direct referral link using the current user's username
	const directReferralLink = `https://degentalk.com/register?ref=${user.username}`;

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-2xl font-bold mb-2">Referral Program</h2>
				<p className="text-muted-foreground">Invite friends and track your referrals</p>
			</div>

			<PreferencesCard
				title="Your Referral Link"
				description="Share this link with friends to invite them to the platform"
			>
				<div className="flex flex-col space-y-4">
					<div className="flex flex-col md:flex-row gap-3">
						<Input
							value={isLoading ? 'Loading...' : referralLink || directReferralLink}
							readOnly
							className="flex-1 bg-zinc-800"
						/>
						<Button onClick={copyReferralLink} disabled={isLoading} className="whitespace-nowrap">
							<Clipboard className="mr-2 h-4 w-4" />
							{isCopied ? 'Copied!' : 'Copy Link'}
						</Button>
					</div>

					<div className="flex flex-wrap gap-2">
						<Button variant="outline" size="sm" disabled={isLoading}>
							<Share2 className="mr-2 h-4 w-4" />
							Share on Twitter
						</Button>
						<Button variant="outline" size="sm" disabled={isLoading}>
							<Share2 className="mr-2 h-4 w-4" />
							Share on Discord
						</Button>
					</div>
				</div>
			</PreferencesCard>

			{/* How You Joined Section */}
			{(referralStats?.referredBy || referralStats?.joinedVia) && (
				<PreferencesCard
					title="How You Joined"
					description="Information about how you found Degentalk"
				>
					<div className="space-y-4">
						{referralStats?.referredBy && (
							<div className="p-4 bg-zinc-800/50 rounded-lg">
								<div className="text-sm text-zinc-400 mb-2">You were referred by:</div>
								<div className="flex items-center gap-3">
									<Avatar className="h-10 w-10">
										<AvatarImage
											src={referralStats.referredBy.avatarUrl || undefined}
											alt={referralStats.referredBy.username}
										/>
										<AvatarFallback>
											{referralStats.referredBy.username.substring(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="font-medium">{referralStats.referredBy.username}</div>
									</div>
								</div>
							</div>
						)}

						{referralStats?.joinedVia && (
							<div className="p-4 bg-zinc-800/50 rounded-lg">
								<div className="text-sm text-zinc-400 mb-2">You joined via:</div>
								<div className="flex items-center gap-2">
									<Link className="h-5 w-5 text-emerald-500" />
									<div className="font-medium">{referralStats.joinedVia.name}</div>
								</div>
							</div>
						)}
					</div>
				</PreferencesCard>
			)}

			<PreferencesCard title="Referral Statistics" description="Track your referral performance">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-zinc-800 p-4 rounded-lg">
						<div className="text-sm text-zinc-400">Total Referrals</div>
						{isLoading ? (
							<Skeleton className="h-8 w-16 mt-1" />
						) : (
							<div className="text-2xl font-bold">{referralStats?.referralCount || 0}</div>
						)}
					</div>

					{/* Additional stats cards can be added here */}
				</div>

				<Separator className="my-6" />

				<div>
					<h3 className="text-sm font-medium mb-4 flex items-center">
						<Users className="mr-2 h-4 w-4" />
						Users You've Referred
					</h3>

					{isLoading ? (
						<div className="space-y-3">
							{[...Array(3)].map((_, i) => (
								<div key={i} className="flex items-center gap-3">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="space-y-1">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-24" />
									</div>
								</div>
							))}
						</div>
					) : referralStats?.referredUsers && referralStats.referredUsers.length > 0 ? (
						<div className="space-y-3">
							{referralStats.referredUsers.map((referredUser) => (
								<div
									key={referredUser.userId}
									className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg"
								>
									<Avatar className="h-10 w-10">
										<AvatarImage
											src={referredUser.avatarUrl || undefined}
											alt={referredUser.username}
										/>
										<AvatarFallback>
											{referredUser.username.substring(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="font-medium">{referredUser.username}</div>
										<div className="text-xs text-zinc-400">
											Joined{' '}
											{formatDistanceToNow(new Date(referredUser.joinedAt), { addSuffix: true })}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-zinc-500">
							<Users className="mx-auto h-12 w-12 opacity-20 mb-3" />
							<p>You haven't referred anyone yet</p>
							<p className="text-sm">Share your referral link to get started</p>
						</div>
					)}
				</div>
			</PreferencesCard>
		</div>
	);
}
