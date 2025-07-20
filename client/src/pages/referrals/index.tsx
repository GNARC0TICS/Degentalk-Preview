import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/utils/queryClient';
import { Wide } from '@/layout/primitives/Wide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth';
import { Users, Link2, Copy, CheckCircle, Gift, TrendingUp, Star, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { type UserId } from '@shared/types/ids';

interface ReferralStats {
	totalReferrals: number;
	activeReferrals: number;
	totalEarnings: number;
	currentTierMultiplier: number;
	nextTierThreshold?: number;
}

interface ReferralCode {
	id: string;
	code: string;
	usageCount: number;
	maxUses?: number;
	isActive: boolean;
	createdAt: string;
	expiresAt?: string;
}

interface Referral {
	id: string;
	referredUserId: string;
	referredUsername: string;
	status: 'active' | 'inactive';
	joinedAt: string;
	totalEarnings: number;
	level: number;
}

function ReferralsPage() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [copiedCode, setCopiedCode] = useState<string | null>(null);

	// Fetch referral stats
	const {
		data: stats,
		isLoading: statsLoading,
		error: statsError
	} = useQuery<ReferralStats>({
		queryKey: ['referrals', 'stats'],
		queryFn: async () => {
			const res = await apiRequest({ url: '/api/referrals/stats', method: 'GET' });
			return res.json();
		},
		enabled: !!user
	});

	// Fetch referral codes
	const { data: codes, isLoading: codesLoading } = useQuery<ReferralCode[]>({
		queryKey: ['referrals', 'codes'],
		queryFn: async () => {
			const res = await apiRequest({ url: '/api/referrals/codes', method: 'GET' });
			return res.json();
		},
		enabled: !!user
	});

	// Fetch referrals list
	const { data: referrals, isLoading: referralsLoading } = useQuery<Referral[]>({
		queryKey: ['referrals', 'list'],
		queryFn: async () => {
			const res = await apiRequest({ url: '/api/referrals/list', method: 'GET' });
			return res.json();
		},
		enabled: !!user
	});

	// Create new referral code
	const createCodeMutation = useMutation({
		mutationFn: async () => {
			const res = await apiRequest({
				url: '/api/referrals/codes',
				method: 'POST'
			});
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['referrals', 'codes'] });
			toast.success('New referral code created!');
		},
		onError: () => {
			toast.error('Failed to create referral code');
		}
	});

	// Copy referral link to clipboard
	const copyReferralLink = async (code: string) => {
		const referralLink = `${window.location.origin}/invite/${code}`;
		try {
			await navigator.clipboard.writeText(referralLink);
			setCopiedCode(code);
			toast.success('Referral link copied to clipboard!');
			setTimeout(() => setCopiedCode(null), 2000);
		} catch (err) {
			toast.error('Failed to copy link');
		}
	};

	if (!user) {
		return (
			<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
				<Card className="max-w-md mx-auto">
					<CardHeader>
						<CardTitle>Authentication Required</CardTitle>
						<CardDescription>Please log in to access your referrals.</CardDescription>
					</CardHeader>
				</Card>
			</Wide>
		);
	}

	return (
		<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
			<div className="max-w-4xl mx-auto space-y-8">
				{/* Header */}
				<div className="text-center">
					<h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
						<Link2 className="h-8 w-8 text-emerald-500" />
						Referral Program
					</h1>
					<p className="text-zinc-400">
						Invite friends and earn rewards together! Build your network and climb the leaderboards.
					</p>
				</div>

				{/* Stats Overview */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<Users className="h-5 w-5 text-blue-500" />
								<div>
									<p className="text-sm text-zinc-400">Total Referrals</p>
									{statsLoading ? (
										<Skeleton className="h-6 w-8" />
									) : (
										<p className="text-xl font-bold">{stats?.totalReferrals || 0}</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<TrendingUp className="h-5 w-5 text-emerald-500" />
								<div>
									<p className="text-sm text-zinc-400">Active Referrals</p>
									{statsLoading ? (
										<Skeleton className="h-6 w-8" />
									) : (
										<p className="text-xl font-bold">{stats?.activeReferrals || 0}</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<Gift className="h-5 w-5 text-purple-500" />
								<div>
									<p className="text-sm text-zinc-400">Total Earnings</p>
									{statsLoading ? (
										<Skeleton className="h-6 w-12" />
									) : (
										<p className="text-xl font-bold">{stats?.totalEarnings || 0} DGT</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<Star className="h-5 w-5 text-yellow-500" />
								<div>
									<p className="text-sm text-zinc-400">Tier Multiplier</p>
									{statsLoading ? (
										<Skeleton className="h-6 w-8" />
									) : (
										<p className="text-xl font-bold">{stats?.currentTierMultiplier || 1.0}x</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Referral Codes */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<Link2 className="h-5 w-5" />
									Your Referral Codes
								</CardTitle>
								<CardDescription>
									Share these links with friends to earn rewards when they join
								</CardDescription>
							</div>
							<Button
								onClick={() => createCodeMutation.mutate()}
								disabled={createCodeMutation.isPending}
								size="sm"
							>
								Create New Code
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{codesLoading ? (
							<div className="space-y-3">
								{[1, 2, 3].map((i) => (
									<Skeleton key={i} className="h-16 w-full" />
								))}
							</div>
						) : codes && codes.length > 0 ? (
							<div className="space-y-3">
								{codes.map((code) => (
									<div
										key={code.id}
										className="flex items-center justify-between p-4 border border-zinc-700 rounded-lg bg-zinc-800/30"
									>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<code className="text-emerald-400 font-mono text-lg">{code.code}</code>
												<Badge variant={code.isActive ? 'default' : 'secondary'}>
													{code.isActive ? 'Active' : 'Inactive'}
												</Badge>
											</div>
											<div className="text-sm text-zinc-400 space-x-4">
												<span>
													Uses: {code.usageCount}
													{code.maxUses ? `/${code.maxUses}` : ''}
												</span>
												<span>Created: {new Date(code.createdAt).toLocaleDateString()}</span>
												{code.expiresAt && (
													<span>Expires: {new Date(code.expiresAt).toLocaleDateString()}</span>
												)}
											</div>
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() => copyReferralLink(code.code)}
											className="flex items-center gap-2"
										>
											{copiedCode === code.code ? (
												<>
													<CheckCircle className="h-4 w-4" />
													Copied!
												</>
											) : (
												<>
													<Copy className="h-4 w-4" />
													Copy Link
												</>
											)}
										</Button>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8">
								<Link2 className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
								<p className="text-zinc-400 mb-4">No referral codes yet</p>
								<Button
									onClick={() => createCodeMutation.mutate()}
									disabled={createCodeMutation.isPending}
								>
									Create Your First Code
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Referrals List */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Your Referrals
						</CardTitle>
						<CardDescription>Friends you've invited and their activity status</CardDescription>
					</CardHeader>
					<CardContent>
						{referralsLoading ? (
							<div className="space-y-3">
								{[1, 2, 3].map((i) => (
									<Skeleton key={i} className="h-12 w-full" />
								))}
							</div>
						) : referrals && referrals.length > 0 ? (
							<div className="space-y-3">
								{referrals.map((referral) => (
									<div
										key={referral.id}
										className="flex items-center justify-between p-3 border border-zinc-700 rounded-lg"
									>
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 bg-emerald-800 rounded-full flex items-center justify-center">
												<span className="text-sm font-semibold text-emerald-200">
													{referral.referredUsername.substring(0, 2).toUpperCase()}
												</span>
											</div>
											<div>
												<p className="font-medium">{referral.referredUsername}</p>
												<p className="text-sm text-zinc-400">
													Joined {new Date(referral.joinedAt).toLocaleDateString()} • Level{' '}
													{referral.level}
												</p>
											</div>
										</div>
										<div className="text-right">
											<Badge variant={referral.status === 'active' ? 'default' : 'secondary'}>
												{referral.status}
											</Badge>
											<p className="text-sm text-zinc-400 mt-1">
												Earned: {referral.totalEarnings} DGT
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8">
								<Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
								<p className="text-zinc-400 mb-2">No referrals yet</p>
								<p className="text-sm text-zinc-500">
									Share your referral codes to start building your network!
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Program Info */}
				<Card>
					<CardHeader>
						<CardTitle>How It Works</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="text-center p-4">
								<div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
									<Link2 className="h-6 w-6 text-blue-500" />
								</div>
								<h3 className="font-semibold mb-2">1. Share Your Link</h3>
								<p className="text-sm text-zinc-400">
									Copy and share your unique referral link with friends
								</p>
							</div>
							<div className="text-center p-4">
								<div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
									<Users className="h-6 w-6 text-emerald-500" />
								</div>
								<h3 className="font-semibold mb-2">2. Friends Join</h3>
								<p className="text-sm text-zinc-400">
									When they sign up using your link, they become your referral
								</p>
							</div>
							<div className="text-center p-4">
								<div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
									<Gift className="h-6 w-6 text-purple-500" />
								</div>
								<h3 className="font-semibold mb-2">3. Earn Rewards</h3>
								<p className="text-sm text-zinc-400">
									Get DGT tokens based on their activity and achievements
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</Wide>
	);
}

// Export as protected route
export default function ProtectedReferralsPage() {
	return (
		<ProtectedRoute>
			<ReferralsPage />
		</ProtectedRoute>
	);
}
