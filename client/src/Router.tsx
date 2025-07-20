import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './layouts/RootLayout.tsx';
import AdminLayout from './layouts/AdminLayout.tsx';
import ModLayout from './layouts/ModLayout.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';

// Import pages
import HomePage from './pages/home.tsx';
import AuthPage from './pages/auth.tsx';
import ForumsPage from './pages/forums';
import ForumBySlugPage from './pages/forums/[forumSlug].tsx';
import ForumSearchPage from './pages/forums/search.tsx';
import ThreadPage from './pages/threads/BBCodeThreadPage';
import CreateThreadPage from './pages/threads/create.tsx';
import ShopPage from './pages/shop.tsx';
import LeaderboardPage from './pages/leaderboard.tsx';
import DegenIndexPage from './pages/degen-index.tsx';
import MissionsPage from './pages/missions';
import AnnouncementsPage from './pages/announcements';
import SearchPage from './pages/search';
import ProfilePage from './pages/profile.tsx';
import WhispersPage from './pages/whispers.tsx';
import WalletPage from './pages/wallet.tsx';
import NotFoundPage from './pages/not-found.tsx';

// Shop Pages
import DgtPurchasePage from './pages/shop-management/dgt-purchase.tsx';
import PurchaseSuccessPage from './pages/shop-management/purchase-success.tsx';

// Mod Pages
import ModDashboardPage from './pages/mod/index.tsx';
import ModShoutboxPage from './pages/mod/shoutbox.tsx';
import ModUsersPage from './pages/mod/users.tsx';
import ModReportsPage from './pages/mod/reports.tsx';

// Dictionary Pages
import DictionaryIndexPage from './pages/dictionary/index.tsx';
import DictionarySlugPage from './pages/dictionary/[slug].tsx';

// Other Pages
import ReferralsPage from './pages/referrals/index.tsx';
import InvitePage from './pages/invite/[code].tsx';
import PreferencesPage from './pages/preferences/index.tsx';
import UIPlaygroundPage from './pages/ui-playground.tsx';

// Legacy Navigate Component
import LegacyForumNavigate from '@/components/forum/LegacyForumNavigate';

/**
 * Main Router Configuration
 * Uses react-router-dom v6 with createBrowserRouter for optimal performance
 */
export const router = createBrowserRouter([
  // Main Application Routes
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      // Home and Auth
      { index: true, element: <HomePage /> },
      { path: 'auth', element: <AuthPage /> },

      // Forum Routes
      { path: 'forums', element: <ForumsPage /> },
      { path: 'forums/:forumSlug', element: <ForumBySlugPage /> },
      { path: 'forums/:forumSlug/:subforumSlug', element: <ForumBySlugPage /> },
      
      // Protected Forum Routes
      { 
        path: 'forums/:forumSlug/create', 
        element: <ProtectedRoute><CreateThreadPage /></ProtectedRoute> 
      },
      { 
        path: 'forums/:forumSlug/:subforumSlug/create', 
        element: <ProtectedRoute><CreateThreadPage /></ProtectedRoute> 
      },
      { 
        path: 'search/forums', 
        element: <ProtectedRoute><ForumSearchPage /></ProtectedRoute> 
      },

      // Legacy redirects from old /zones/ structure
      { path: 'zones/:zoneSlug/:forumSlug/:subforumSlug', element: <ForumBySlugPage /> },
      { path: 'zones/:zoneSlug/:forumSlug', element: <ForumBySlugPage /> },
      { 
        path: 'zones/:slug', 
        element: <ProtectedRoute><LegacyForumNavigate /></ProtectedRoute> 
      },
      { 
        path: 'zones', 
        element: <ProtectedRoute><LegacyForumNavigate /></ProtectedRoute> 
      },

      // Thread Routes
      { 
        path: 'threads/create', 
        element: <ProtectedRoute><CreateThreadPage /></ProtectedRoute> 
      },
      { path: 'threads/:slug', element: <ThreadPage /> },

      // Shop Routes
      { 
        path: 'shop', 
        element: <ProtectedRoute><ShopPage /></ProtectedRoute> 
      },
      { 
        path: 'shop/dgt-purchase', 
        element: <ProtectedRoute><DgtPurchasePage /></ProtectedRoute> 
      },
      { 
        path: 'shop/purchase-success', 
        element: <ProtectedRoute><PurchaseSuccessPage /></ProtectedRoute> 
      },

      // Other Protected Routes
      { 
        path: 'leaderboard', 
        element: <ProtectedRoute><LeaderboardPage /></ProtectedRoute> 
      },
      { 
        path: 'missions', 
        element: <ProtectedRoute><MissionsPage /></ProtectedRoute> 
      },
      { 
        path: 'announcements', 
        element: <ProtectedRoute><AnnouncementsPage /></ProtectedRoute> 
      },
      { 
        path: 'search', 
        element: <ProtectedRoute><SearchPage /></ProtectedRoute> 
      },
      { 
        path: 'degen-index', 
        element: <ProtectedRoute><DegenIndexPage /></ProtectedRoute> 
      },
      { 
        path: 'wallet', 
        element: <ProtectedRoute><WalletPage /></ProtectedRoute> 
      },
      { 
        path: 'whispers', 
        element: <ProtectedRoute><WhispersPage /></ProtectedRoute> 
      },

      // Profile Routes
      { 
        path: 'profile/:username', 
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute> 
      },
      { path: 'profile', element: <ProfilePage /> },

      // Dictionary Routes
      { 
        path: 'dictionary', 
        element: <ProtectedRoute><DictionaryIndexPage /></ProtectedRoute> 
      },
      { 
        path: 'dictionary/:slug', 
        element: <ProtectedRoute><DictionarySlugPage /></ProtectedRoute> 
      },

      // Other Routes
      { 
        path: 'referrals', 
        element: <ProtectedRoute><ReferralsPage /></ProtectedRoute> 
      },
      { 
        path: 'invite/:code', 
        element: <ProtectedRoute><InvitePage /></ProtectedRoute> 
      },
      { 
        path: 'preferences', 
        element: <ProtectedRoute><PreferencesPage /></ProtectedRoute> 
      },
      { 
        path: 'ui-playground', 
        element: <ProtectedRoute><UIPlaygroundPage /></ProtectedRoute> 
      },
    ],
  },

  // Admin Routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      // Admin routes will be added here as needed
      // For now, we'll keep the existing admin routing structure
    ],
  },

  // Moderator Routes
  {
    path: '/mod',
    element: (
      <ProtectedRoute requiredRole="moderator">
        <ModLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ModDashboardPage /> },
      { path: 'shoutbox', element: <ModShoutboxPage /> },
      { path: 'users', element: <ModUsersPage /> },
      { path: 'reports', element: <ModReportsPage /> },
    ],
  },
]);