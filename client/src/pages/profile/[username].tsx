import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent } from '@app/components/ui/tabs';
import { SiteFooter } from '@app/components/footer';
import ProfileSidebar from '@app/components/profile/ProfileSidebar';
import OverviewTab from '@app/components/profile/OverviewTab';
import InventoryTab from '@app/components/profile/InventoryTab';
import FriendsTab from '@app/components/profile/FriendsTab';
import WhaleWatchTab from '@app/components/profile/WhaleWatchTab';
import AchievementsTab from '@app/components/profile/AchievementsTab';
import { XPProfileSection } from '@app/components/profile/XPProfileSection';
import { CosmeticControlPanel } from '@app/components/profile/CosmeticControlPanel';
import { ProfileSkeleton } from '@app/components/profile/ProfileSkeleton';
import { ProfileDashboard } from '@app/components/profile/ProfileDashboard';
import { ProfileNavigation } from '@app/components/profile/ProfileNavigation';
import { SeoHead } from '@app/components/ui/seo-head';
import { ErrorDisplay } from '@app/components/ui/error-display';
import { LoadingSpinner } from '@app/components/ui/loader';
import BackToHomeButton from '@app/components/common/BackToHomeButton';
import { useAuth } from '@app/hooks/use-auth';
import { useUserInventory } from '@app/hooks/useUserInventory';
import { useProfileEngagement } from '@app/hooks/useProfileEngagement';
import type { ProfileData } from '@app/types/profile';
import { ProfileEditor } from '@app/components/profile/ProfileEditor';
import { Wide } from '@app/layout/primitives';
import { Home, Trophy, ShoppingBag, Users, Sparkles, Eye } from 'lucide-react';
import { generateMockProfile } from '@app/utils/dev/mockProfile';

const TAB_GRID_CLASSES =
	'flex overflow-x-auto gap-1 min-w-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-600';

export default function ProfilePage() {
	const { username } = useParams<{ username: string }>();
	const { user: currentUser } = useAuth();
	const isDev = import.meta.env.DEV;
	const [activeTab, setActiveTab] = useState('overview');
	const [isEditMode, setIsEditMode] = useState(false);
	const [previousTab, setPreviousTab] = useState<string | null>(null);

	const {
		data: profile,
		isLoading,
		isError,
		error
	} = useQuery<ProfileData>({
		queryKey: ['profile', username],
		queryFn: async () => {
			// 1. Try to fetch real profile from backend
			try {
				const res = await fetch(`/api/profile/${username}`);
				if (res.ok) {
					return res.json();
				}
				// If the profile is not found (404) we might be in dev without seed
				if (res.status !== 404) {
					throw new Error('Failed to fetch profile');
				}
			} catch (err) {
				if (!isDev) throw err; // in production surface the error
			}

			// 2. Fallback: generate mock data only during local dev for the seeded dev account
			if (isDev && username?.toLowerCase() === 'cryptoadmin') {
				return generateMockProfile(username);
			}

			// 3. If production and still here, throw not found
			throw new Error('Profile not found');
		}
	});

	const isOwnProfile = currentUser?.username === username;
	const { data: inventory = [], isLoading: inventoryLoading } = useUserInventory(
		isOwnProfile ? profile?.id : undefined
	);

	// Engagement tracking
	const engagement = useProfileEngagement(username || '');

	// Track tab changes
	const handleTabChange = (newTab: string) => {
		if (previousTab) {
			engagement.trackTabSwitch(previousTab, newTab);
		}
		setPreviousTab(activeTab);
		setActiveTab(newTab);
		engagement.trackAction('tab_switch', newTab);
	};

	// Track scroll depth
	useEffect(() => {
		const handleScroll = () => {
			const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
			const scrollDepth = window.scrollY / scrollHeight;
			engagement.trackScrollDepth(scrollDepth);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [engagement]);

	// Track initial page view
	useEffect(() => {
		if (profile) {
			engagement.trackEvent({
				type: 'view',
				target: 'profile_page',
				metadata: {
					profileId: profile.id,
					isOwnProfile,
					viewerRole: currentUser?.role || 'anonymous'
				}
			});
		}
	}, [profile, engagement, isOwnProfile, currentUser]);

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
							<div className="rounded-lg bg-zinc-800/70 backdrop-blur-sm shadow-xl border border-zinc-700/50 p-4 sm:p-6 flex flex-col">
								<Tabs
									value={activeTab}
									onValueChange={handleTabChange}
									className="w-full flex flex-col"
								>
									<ProfileNavigation
										activeTab={activeTab}
										onTabChange={handleTabChange}
										isOwnProfile={isOwnProfile}
										pendingFriendRequests={0} // TODO: Get from profile data
										unreadNotifications={0} // TODO: Get from profile data
										newAchievements={0} // TODO: Get from profile data
									/>

									<div className="flex-1 overflow-y-auto pr-2 min-h-0">
										<TabsContent
											value="overview"
											className="mt-0 focus-visible:outline-none focus-visible:ring-0"
										>
											{activeTab === 'overview' ? (
												<ProfileDashboard profile={profile} isOwnProfile={isOwnProfile} />
											) : (
												<OverviewTab profile={profile} />
											)}
										</TabsContent>
										<TabsContent
											value="achievements"
											className="mt-0 focus-visible:outline-none focus-visible:ring-0"
										>
											<AchievementsTab profile={profile} isOwnProfile={isOwnProfile} />
										</TabsContent>
										<TabsContent
											value="inventory"
											className="mt-0 focus-visible:outline-none focus-visible:ring-0"
										>
											<InventoryTab profile={profile} />
										</TabsContent>
										<TabsContent
											value="friends"
											className="mt-0 focus-visible:outline-none focus-visible:ring-0"
										>
											<FriendsTab profile={profile} />
										</TabsContent>
										<TabsContent
											value="whale-watch"
											className="mt-0 focus-visible:outline-none focus-visible:ring-0"
										>
											<WhaleWatchTab profile={profile} isOwnProfile={isOwnProfile} />
										</TabsContent>
										{isOwnProfile && (
											<>
												<TabsContent
													value="cosmetics"
													className="mt-0 focus-visible:outline-none focus-visible:ring-0"
												>
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
															canEdit={isOwnProfile}
															onEditProfile={() => setIsEditMode(true)}
														/>
													)}
												</TabsContent>
												<TabsContent
													value="notifications"
													className="mt-0 focus-visible:outline-none focus-visible:ring-0"
												>
													<div className="text-center py-8 text-zinc-400">
														Notifications tab coming soon...
													</div>
												</TabsContent>
											</>
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
