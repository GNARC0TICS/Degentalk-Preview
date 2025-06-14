import React from 'react';
import { Switch, Route, Redirect, useLocation, useParams } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { ForumStructureProvider } from '@/contexts/ForumStructureContext';
import AdminLayout from './pages/admin/admin-layout';
import { ModLayout } from './components/mod/mod-layout';
import { SiteHeader } from '@/components/layout/site-header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import WalletPage from './pages/wallet';

// Pages
import HomePage from './pages/home';
import ForumsPage from './pages/forums';
// Import forum system pages
import ForumBySlugPage from './pages/forums/[forum_slug].tsx';
import ForumSearchPage from './pages/forums/search.tsx'; // Import the new search page
import ZoneBySlugPage from './pages/zones/[slug].tsx'; // Added import for Zone page
import ThreadPage from './pages/threads/[thread_slug].tsx';
import CreateThreadPage from './pages/threads/create.tsx';
import ShopPage from './pages/shop';
import NotFoundPage from './pages/not-found';
import LeaderboardPage from './pages/leaderboard';
import DegenIndexPage from './pages/degen-index';
import AuthPage from './pages/auth';

// Admin Pages
import AdminDashboardPage from "./pages/admin/index.tsx";
import AdminUsersPage from "./pages/admin/users.tsx";
import AdminUserEdit from "./pages/admin/edit-user.tsx";
import UserXpAdjustmentPage from "./pages/admin/xp/adjust.tsx";
import BadgeManagementPage from "./pages/admin/xp/badges.tsx";
import LevelManagementPage from "./pages/admin/xp/levels.tsx";
import XpSettingsPage from "./pages/admin/xp/settings.tsx";
import TitleManagementPage from "./pages/admin/xp/titles.tsx";
import AdminThreadsPage from "./pages/admin/threads.tsx";
import AdminTreasuryPage from "./pages/admin/treasury.tsx";
import AdminWalletsPage from "./pages/admin/wallets/index.tsx";
import AdminTransactionsPage from "./pages/admin/transactions/index.tsx";
import AdminStatsPage from "./pages/admin/stats/index.tsx";
import AdminReportsPage from "./pages/admin/reports.tsx";
import AdminAnnouncementsPage from "./pages/admin/announcements/index.tsx";
import AdminCategoriesPage from "./pages/admin/categories.tsx";
import AdminPrefixesPage from "./pages/admin/prefixes.tsx";
import PlatformSettingsPage from "./pages/admin/platform-settings.tsx";
import TagConfigPage from "./pages/admin/config/tags.tsx";
import XpConfigPage from "./pages/admin/config/xp.tsx";
import ZoneConfigPage from "./pages/admin/config/zones.tsx";
import AdminDgtPackagesPage from "./pages/admin/dgt-packages.tsx";
import TipRainSettingsPage from "./pages/admin/tip-rain-settings.tsx";
import CooldownSettingsPage from "./pages/admin/cooldowns.tsx";

// Shop Pages
import DgtPurchasePage from './pages/shop-management/dgt-purchase';
import PurchaseSuccessPage from './pages/shop-management/purchase-success';

// Mod Pages
import ModDashboardPage from './pages/mod/index';
import ModShoutboxPage from './pages/mod/shoutbox';
import ModUsersPage from './pages/mod/users';

// Import user profile page and whispers page
import ProfilePage from './pages/profile/[username]';
import WhispersPage from './pages/whispers';

// Define admin pages using lazy loading
const AdminEmojisPage = React.lazy(() => import('./pages/admin/emojis'));
const AdminUserGroupsPage = React.lazy(() => import('./pages/admin/user-groups'));

// Import Dev Role Switcher
import { DevRoleSwitcher } from '@/components/dev/dev-role-switcher';

// Import Preferences Page
import PreferencesPage from './pages/preferences/index';

// Permission wrapper for mod routes
function RequireMod({ children }: { children: React.ReactNode }) {
	// Always allow access without permission checks
	// This enables unrestricted navigation to moderator routes
	return <>{children}</>;
}

function App() {
	// Use location to conditionally show SiteHeader
	const [location] = useLocation();
	const isAdminRoute = location.startsWith('/admin');
	const isModRoute = location.startsWith('/mod');
	const isAuthRoute = location === '/auth';

	return (
		<ForumStructureProvider>
			<div className="min-h-screen bg-black text-white flex flex-col">
				{/* Only show SiteHeader on non-admin, non-mod, and non-auth routes */}
				{!isAdminRoute && !isModRoute && !isAuthRoute && <SiteHeader />}
				<React.Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
					<Switch>
						{/* Auth Routes */}
						<Route path="/auth" component={AuthPage} />

					{/* Protected Main Routes */}
					<ProtectedRoute path="/" component={HomePage} />

					{/* Forum Structure Routes */}
					{/* Forum Structure Routes */}
					{/* Forum Structure Routes */}
					{/* Updated path to match singular '/forum/:slug' */}
					<ProtectedRoute path="/forums/:slug" component={ForumBySlugPage} />
					{/* The /forum route might be for a general forum listing page if needed */}
					<ProtectedRoute path="/forums" component={ForumsPage} />
					{/* Search Page Route */}
					<ProtectedRoute path="/forums/search" component={ForumSearchPage} />
					
					{/* Zone Page Route */}
					<ProtectedRoute path="/zones/:slug" component={ZoneBySlugPage} />

					{/* Thread Routes */}
					<ProtectedRoute path="/threads/create" component={CreateThreadPage} />
					<ProtectedRoute path="/threads/:thread_slug" component={ThreadPage} />

					{/* Other Routes */}
					<ProtectedRoute path="/shop" component={ShopPage} />
					<ProtectedRoute path="/shop/dgt-purchase" component={DgtPurchasePage} />
					<ProtectedRoute path="/shop/purchase-success" component={PurchaseSuccessPage} />
					<ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
					<ProtectedRoute path="/degen-index" component={DegenIndexPage} />
					<ProtectedRoute path="/wallet" component={WalletPage} />
					<ProtectedRoute path="/profile/:username?" component={ProfilePage} />
					<ProtectedRoute path="/whispers" component={WhispersPage} />
					<ProtectedRoute path="/preferences" component={PreferencesPage} />

					{/* Admin Routes */}
					<Route
						path="/admin"
						component={() => {
							return (
								<AdminLayout>
									<div>
										<AdminDashboardPage />
									</div>
								</AdminLayout>
							);
						}}
					/>
					<Route
						path="/admin/users"
						component={() => {
							return (
								<AdminLayout>
									<div>
										<AdminUsersPage />
									</div>
								</AdminLayout>
							);
						}}
					/>
					{/* Added route for Admin User Edit Page */}
					<Route
						path="/admin/users/:id"
						component={() => (
							<AdminLayout>
								<AdminUserEdit />
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/threads"
						component={() => {
							return (
								<AdminLayout>
									<div>
										<AdminThreadsPage />
									</div>
								</AdminLayout>
							);
						}}
					/>
					<Route
						path="/admin/treasury"
						component={() => (
							<AdminLayout>
								<div>
									<AdminTreasuryPage />
								</div>
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/wallets"
						component={() => (
							<AdminLayout>
								<AdminWalletsPage />
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/user-groups"
						component={() => (
							<AdminLayout>
								<AdminUserGroupsPage />
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/transactions"
						component={() => (
							<AdminLayout>
								<AdminTransactionsPage />
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/stats"
						component={() => (
							<AdminLayout>
								<AdminStatsPage />
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/reports"
						component={() => (
							<AdminLayout>
								<AdminReportsPage />
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/announcements"
						component={() => (
							<AdminLayout>
								<AdminAnnouncementsPage />
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/emojis"
						component={() => (
							<AdminLayout>
								<React.Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
									<AdminEmojisPage />
								</React.Suspense>
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/categories"
						component={() => (
							<AdminLayout>
								<AdminCategoriesPage />
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/prefixes"
						component={() => (
							<AdminLayout>
								<AdminPrefixesPage />
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/platform-settings"
						component={() => (
							<AdminLayout>
								<PlatformSettingsPage />
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/config/tags"
						component={TagConfigPage}
					/>
					<Route
						path="/admin/config/xp"
						component={XpConfigPage}
					/>
					<Route
						path="/admin/config/zones"
						component={ZoneConfigPage}
					/>
					<Route
						path="/admin/dgt-packages"
						component={() => (
							<AdminLayout>
								<AdminDgtPackagesPage />
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/tip-rain-settings"
						component={() => (
							<AdminLayout>
								<TipRainSettingsPage />
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/cooldowns"
						component={() => (
							<AdminLayout>
								<CooldownSettingsPage />
							</AdminLayout>
						)}
					/>
					{/* Added route for Admin XP Adjust Page */}
					<Route
						path="/admin/xp/adjust"
						component={() => (
							<AdminLayout>
								<UserXpAdjustmentPage />
							</AdminLayout>
						)}
					/>
					{/* Added routes for Admin XP Management Pages */}
					<Route
						path="/admin/xp/badges"
						component={() => (
							<AdminLayout>
								<BadgeManagementPage />
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/xp/levels"
						component={() => (
							<AdminLayout>
								<LevelManagementPage />
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/xp/settings"
						component={() => (
							<AdminLayout>
								<XpSettingsPage />
							</AdminLayout>
						)}
					/>
					<Route
						path="/admin/xp/titles"
						component={() => (
							<AdminLayout>
								<TitleManagementPage />
							</AdminLayout>
						)}
					/>

					{/* Moderator Routes */}
					<Route
						path="/mod"
						component={() => (
							<RequireMod>
								<ModLayout>
									<ModDashboardPage />
								</ModLayout>
							</RequireMod>
						)}
					/>
					<Route
						path="/mod/shoutbox"
						component={() => (
							<RequireMod>
								<ModLayout>
									<ModShoutboxPage />
								</ModLayout>
							</RequireMod>
						)}
					/>
					<Route
						path="/mod/users"
						component={() => (
							<RequireMod>
								<ModLayout>
									<ModUsersPage />
								</ModLayout>
							</RequireMod>
						)}
					/>

					{/* Legacy Forum Routes – temporary aliases for '/forum' */}
					<ProtectedRoute path="/forum" component={ForumsPage} />
					<ProtectedRoute path="/forum/:slug" component={ForumBySlugPage} />

					{/* 404 Route - Render the custom NotFoundPage component */}
					<Route component={NotFoundPage} />
				</Switch>			</React.Suspense>
				<Toaster />
				{/* Conditionally render the DevRoleSwitcher */}
				{import.meta.env.MODE === 'development' && <DevRoleSwitcher />}
			</div>
		</ForumStructureProvider>
	);
}

export default App;
