import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SiteFooter } from '@/components/footer';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import OverviewTab from '@/components/profile/OverviewTab';
import InventoryTab from '@/components/profile/InventoryTab';
import FriendsTab from '@/components/profile/FriendsTab';
import WhaleWatchTab from '@/components/profile/WhaleWatchTab';
import { XPProfileSection } from '@/components/profile/XPProfileSection';
import { CosmeticControlPanel } from '@/components/profile/CosmeticControlPanel';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { SeoHead } from '@/components/ui/SeoHead';
import { ErrorDisplay } from '@/components/ui/error-display';
import { LoadingSpinner } from '@/components/ui/loader';
import BackToHomeButton from '@/components/common/BackToHomeButton';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useUserInventory } from '@/hooks/useUserInventory';
import { Home, Trophy, ShoppingBag, Users, Sparkles, Eye } from 'lucide-react';
import type { ProfileData } from '@/types/profile';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { Wide } from '@/layout/primitives';

// TEMP: mock data helper for dev mode
function getMockProfileData(username: string): ProfileData {
	return {
		id: 'mock-user',
		username,
		avatarUrl: 'https://i.pravatar.cc/300',
		role: 'Developer',
		bio: 'Mock user bio',
		signature: 'Mock signature',
		joinedAt: new Date().toISOString(),
		lastActiveAt: new Date().toISOString(),
		dgtBalance: 0,
		totalPosts: 0,
		totalThreads: 0,
		totalLikes: 0,
		totalTips: 0,
		clout: 0,
		level: 1,
		xp: 0,
		nextLevelXp: 100,
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

export default function ProfilePage() {
	const { username } = useParams<{ username: string }>();
	const { user: currentUser } = useAuth();
	const isDev = import.meta.env.DEV;
	const [activeTab, setActiveTab] = useState('overview');
	const [isEditMode, setIsEditMode] = useState(false);

	const {
		data: profile,
		isLoading,
		isError,
		error
	} = useQuery<ProfileData>({
		queryKey: ['profile', username],
		queryFn: async () => {
			if (isDev && (username?.toLowerCase() === 'devuser' || username?.toLowerCase() === 'dev')) {
				return getMockProfileData(username);
			}
			const res = await fetch(`/api/profile/${username}`);
			if (!res.ok) throw new Error('Failed to fetch profile');
			return res.json();
		}
	});

	const isOwnProfile = currentUser?.username === username;
	const { data: inventory = [], isLoading: inventoryLoading } = useUserInventory(
		isOwnProfile ? profile?.id : undefined
	);

	if (isLoading) {
		return (
			<div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-900 to-black">
				<ProfileSkeleton />
				<SiteFooter />
			</div>
		);
	}

	if (isError || !profile) {
		return (
			<div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-900 to-black">
				<Wide className="p-4 flex-1">
					<ErrorDisplay title="Profile Error" error={error} variant="card" />
				</Wide>
				<SiteFooter />
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-screen">
			<SeoHead
				title={`${profile.username}'s Profile`}
				description={`Profile of ${profile.username}`}
			/>

			<main className="flex-1 py-8 relative">
				<div
					className="absolute inset-0 -z-10"
					style={{
						backgroundImage: "url('/images/profile-background.png')",
						backgroundSize: 'cover',
						backgroundPosition: 'center'
					}}
				>
					<div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 to-black/90" />
				</div>

				<Wide className="px-4">
					<BackToHomeButton />
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
						<div className="col-span-1">
							<aside className="sticky top-8">
								<ProfileSidebar profile={profile} isOwnProfile={isOwnProfile} />
							</aside>
						</div>
						<div className="col-span-1 lg:col-span-3">
							<div className="rounded-lg bg-zinc-800/70 backdrop-blur-sm shadow-xl border border-zinc-700/50 p-4 sm:p-6 flex flex-col h-[calc(100vh-8rem)]">
								<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
									<TabsList
										className={`flex overflow-x-auto gap-1 md:grid md:grid-cols-3 lg:${isOwnProfile ? 'grid-cols-6' : 'grid-cols-5'} mb-4 bg-black/40 backdrop-blur-sm`}
									>
										<TabsTrigger
											value="overview"
											className="flex items-center justify-center text-xs sm:text-sm data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 px-2 py-3"
										>
											<Home className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
											<span className="hidden sm:inline">Overview</span>
											<span className="sm:hidden">Home</span>
										</TabsTrigger>
										<TabsTrigger
											value="achievements"
											className="flex items-center justify-center text-xs sm:text-sm data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400 px-2 py-3"
										>
											<Trophy className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
											<span className="hidden sm:inline">Achievements</span>
											<span className="sm:hidden">XP</span>
										</TabsTrigger>
										<TabsTrigger
											value="inventory"
											className="flex items-center justify-center text-xs sm:text-sm data-[state=active]:bg-zinc-600/20 data-[state=active]:text-zinc-300 px-2 py-3"
										>
											<ShoppingBag className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
											<span className="hidden sm:inline">Inventory</span>
											<span className="sm:hidden">Items</span>
										</TabsTrigger>
										<TabsTrigger
											value="friends"
											className="flex items-center justify-center text-xs sm:text-sm data-[state=active]:bg-zinc-600/20 data-[state=active]:text-zinc-300 px-2 py-3"
										>
											<Users className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
											<span className="hidden sm:inline">Friends</span>
											<span className="sm:hidden">Friends</span>
										</TabsTrigger>
										<TabsTrigger
											value="whale-watch"
											className="flex items-center justify-center text-xs sm:text-sm data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 px-2 py-3"
										>
											<Eye className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
											<span className="hidden sm:inline">Whale Watch</span>
											<span className="sm:hidden">Watch</span>
										</TabsTrigger>
										{isOwnProfile && (
											<TabsTrigger
												value="cosmetics"
												className="flex items-center justify-center text-xs sm:text-sm data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400 px-2 py-3"
											>
												<Sparkles className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
												<span className="hidden sm:inline">Cosmetics</span>
												<span className="sm:hidden">Style</span>
											</TabsTrigger>
										)}
									</TabsList>

									<div className="flex-1 overflow-y-auto pr-2">
										<TabsContent value="overview">
											<OverviewTab profile={profile} />
										</TabsContent>
										<TabsContent value="achievements">
											<XPProfileSection userId={profile.id} />
										</TabsContent>
										<TabsContent value="inventory">
											<InventoryTab profile={profile} />
										</TabsContent>
										<TabsContent value="friends">
											<FriendsTab profile={profile} />
										</TabsContent>
										<TabsContent value="whale-watch">
											<WhaleWatchTab profile={profile} isOwnProfile={isOwnProfile} />
										</TabsContent>
										{isOwnProfile && (
											<TabsContent value="cosmetics">
												{inventoryLoading ? (
													<LoadingSpinner size="lg" />
												) : (
													<CosmeticControlPanel
														userId={profile.id}
														username={profile.username}
														avatarUrl={profile.avatarUrl}
														inventory={inventory.map((i) => ({
															id: i.id,
															userId: i.userId,
															productId: i.productId,
															equipped: i.equipped,
															purchasedAt: i.purchasedAt,
															product: i.product
														}))}
														activeFrame={profile.activeFrame}
														activeTitle={profile.activeTitle}
														activeBadge={profile.activeBadge}
														onEditProfile={() => setIsEditMode(true)}
													/>
												)}
											</TabsContent>
										)}
									</div>
								</Tabs>
							</div>
						</div>
					</div>
				</Wide>
			</main>

			<SiteFooter />

			{isEditMode && (
				<ProfileEditor
					profile={{
						id: profile.id,
						username: profile.username,
						bio: profile.bio,
						signature: profile.signature,
						avatarUrl: profile.avatarUrl,
						bannerUrl: profile.bannerUrl,
						website: null,
						discord: null,
						twitter: null,
						location: null
					}}
					onClose={() => setIsEditMode(false)}
				/>
			)}
		</div>
	);
}
