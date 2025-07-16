import React from 'react';
import { Switch, Route, useLocation, Redirect } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import ModularAdminLayout from '@/features/admin/layout/admin-layout';
import { ModLayout } from './components/mod/mod-layout';
import { SiteHeader, HeaderProvider } from '@/components/header';
import { GlobalRouteGuard } from '@/components/auth/GlobalRouteGuard';
import { ProtectedRoute } from '@/components/auth';
import WalletPage from './pages/wallet';

// Pages
import HomePage from './pages/home';
import ForumsPage from './pages/forums';
// Import forum system pages
import ForumBySlugPage from './pages/forums/[forumSlug]';
import ForumSearchPage from './pages/forums/search'; // Import the new search page
import ThreadPage from './pages/threads/BBCodeThreadPage';
import CreateThreadPage from './pages/threads/create';
import ShopPage from './pages/shop';
import NotFoundPage from './pages/not-found';
import LeaderboardPage from './pages/leaderboard';
import DegenIndexPage from './pages/degen-index';
import AuthPage from './pages/auth';
import MissionsPage from './pages/missions';
import AnnouncementsPage from './pages/announcements';
import SearchPage from './pages/search';




// Shop Pages
import DgtPurchasePage from './pages/shop-management/dgt-purchase';
import PurchaseSuccessPage from './pages/shop-management/purchase-success';

// Mod Pages
import ModDashboardPage from './pages/mod/index';
import ModShoutboxPage from './pages/mod/shoutbox';
import ModUsersPage from './pages/mod/users';
import ModReportsPage from './pages/mod/reports';

// Import user profile page and whispers page
import ProfilePage from './pages/profile/[username]';
import WhispersPage from './pages/whispers';

// Define admin pages using lazy loading
const AdminEmojisPage = React.lazy(() => import('@/pages/admin/emojis'));
// const AdminUserGroupsPage = React.lazy(() => import('@/features/admin/views/user-groups')); // Removed as page was deleted

// Import Dev Role Switcher
import { DevRoleSwitcher } from '@/components/dev/dev-role-switcher';

// Import Preferences Page
import PreferencesPage from './pages/preferences/index';

// Import Dictionary Pages
import DictionaryIndexPage from './pages/dictionary/index';
import DictionarySlugPage from './pages/dictionary/[slug]';

// Import Referrals Page
import ReferralsPage from './pages/referrals/index';

// Import Invite Page
import InvitePage from './pages/invite/[code]';

// Import UIPlayground page and DevPlaygroundShortcut component
import UIPlaygroundPage from './pages/ui-playground';
import { DevPlaygroundShortcut } from '@/components/dev/dev-playground-shortcut';

// Import the new XP events hook
import { useXpEvents } from '@/hooks/useXpEvents';

// Import Legacy Redirect Component
import LegacyForumRedirect from '@/components/forum/LegacyForumRedirect';

// Permission wrapper for mod routes
function RequireMod({ children }: { children: React.ReactNode }) {
	// Always allow access without permission checks
	// This enables unrestricted navigation to moderator routes
	return <>{children}</>;
}

function App() {
	// Initialize the XP event listeners
	useXpEvents();

	// Use location to conditionally show SiteHeader
	const [location] = useLocation();
	const isAdminRoute = location.startsWith('/admin');
	const isModRoute = location.startsWith('/mod');
	const isAuthRoute = location === '/auth';

	return (
		<HeaderProvider>
			<div className="min-h-screen bg-black text-white flex flex-col">
				{/* Only show SiteHeader on non-admin, non-mod, and non-auth routes */}
				{!isAdminRoute && !isModRoute && !isAuthRoute && <SiteHeader />}

				<React.Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
					<Switch>
						{/* Auth Routes */}
						<Route path="/auth" component={AuthPage} />

						{/* Forum Routes - Clean /forums/ Structure */}
						{/* Main forum discovery page (Featured + General forums) */}
						<ProtectedRoute path="/forums" component={ForumsPage} />

						{/* Individual forum pages */}
						<ProtectedRoute path="/forums/:forumSlug" component={ForumBySlugPage} />

						{/* Subforum pages */}
						<ProtectedRoute path="/forums/:forumSlug/:subforumSlug" component={ForumBySlugPage} />

						{/* Thread creation */}
						<ProtectedRoute path="/forums/:forumSlug/create" component={CreateThreadPage} />
						<ProtectedRoute
							path="/forums/:forumSlug/:subforumSlug/create"
							component={CreateThreadPage}
						/>

						{/* Forum search */}
						<ProtectedRoute path="/search/forums" component={ForumSearchPage} />

						{/* Legacy redirects from old /zones/ structure */}
						<ProtectedRoute path="/zones" component={LegacyForumRedirect} />
						<ProtectedRoute path="/zones/:slug" component={LegacyForumRedirect} />
						<ProtectedRoute path="/zones/:zoneSlug/:forumSlug" component={LegacyForumRedirect} />
						<ProtectedRoute
							path="/zones/:zoneSlug/:forumSlug/:subforumSlug"
							component={LegacyForumRedirect}
						/>

						{/* Thread Routes */}
						<ProtectedRoute path="/threads/create" component={CreateThreadPage} />
						<ProtectedRoute path="/threads/:thread_slug" component={ThreadPage} />

						{/* Other Routes */}
						<ProtectedRoute path="/shop" component={ShopPage} />
						<ProtectedRoute path="/shop/dgt-purchase" component={DgtPurchasePage} />
						<ProtectedRoute path="/shop/purchase-success" component={PurchaseSuccessPage} />
						<ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
						<ProtectedRoute path="/missions" component={MissionsPage} />
						<ProtectedRoute path="/announcements" component={AnnouncementsPage} />
						<ProtectedRoute path="/search" component={SearchPage} />
						<ProtectedRoute path="/degen-index" component={DegenIndexPage} />
						<ProtectedRoute path="/wallet" component={WalletPage} />
						<ProtectedRoute path="/profile/:username" component={ProfilePage} />
						<ProtectedRoute path="/whispers" component={WhispersPage} />
						<ProtectedRoute path="/preferences" component={PreferencesPage} />

						{/* Dictionary Routes */}
						<ProtectedRoute path="/dictionary" component={DictionaryIndexPage} />
						<ProtectedRoute path="/dictionary/:slug" component={DictionarySlugPage} />

						{/* Referrals Route */}
						<ProtectedRoute path="/referrals" component={ReferralsPage} />

						{/* Invite Route - Public route for referral codes */}
						<Route path="/invite/:code" component={InvitePage} />

						{/* Admin Routes */}
						<Route path="/admin/:rest*">
							<ModularAdminLayout />
						</Route>

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
						<Route
							path="/mod/reports"
							component={() => (
								<RequireMod>
									<ModLayout>
										<ModReportsPage />
									</ModLayout>
								</RequireMod>
							)}
						/>

						{/* Legacy Forum Routes - Only redirect old singular /forum pattern */}
						<Route path="/forum">
							<Redirect to="/forums" />
						</Route>
						<Route path="/forum/:slug" component={LegacyForumRedirect} />

						{/* UI Playground (dev only) */}
						{import.meta.env.MODE === 'development' && (
							<ProtectedRoute path="/ui-playground" component={UIPlaygroundPage} />
						)}
						
						{/* Uiverse Showcase */}
						<ProtectedRoute path="/uiverse-showcase" component={React.lazy(() => import('./pages/uiverse-showcase'))} />

						{/* Root route LAST to avoid shadowing */}
						<ProtectedRoute path="/" component={HomePage} />

						{/* 404 Route - Render the custom NotFoundPage component */}
						<Route component={NotFoundPage} />
					</Switch>
				</React.Suspense>
				<Toaster />
				{/* Conditionally render the DevRoleSwitcher */}
				{import.meta.env.MODE === 'development' && import.meta.env.VITE_FORCE_AUTH !== 'true' && (
					<DevRoleSwitcher />
				)}
				{import.meta.env.MODE === 'development' && <DevPlaygroundShortcut />}
			</div>
		</HeaderProvider>
	);
}

export default App;
