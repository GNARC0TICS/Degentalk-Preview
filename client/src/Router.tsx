import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';
import ModLayout from './layouts/ModLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Import pages
import HomePage from './pages/home';
import AuthPage from './pages/auth';
import ForumsIndexPage from './pages/forums/index';
import ForumRoutePage from './pages/forums/[forumSlug]';
import ForumSearchPage from './pages/forums/search';
import CreateThreadPage from './pages/threads/create';
import ThreadDetailPage from './pages/threads/[slug]';
import ShopPage from './pages/shop';
import LeaderboardPage from './pages/leaderboard';
import DegenIndexPage from './pages/degen-index';
// import MissionsPage from './pages/missions'; // Disabled - replaced with about page
import AboutPage from './pages/about/index';
import AnnouncementsPage from './pages/announcements';
import SearchPage from './pages/search';
import ProfilePage from './pages/profile';
import WhispersPage from './pages/whispers';
import WalletPage from './pages/wallet';
import NotFoundPage from './pages/not-found';

// Shop Pages
import DgtPurchasePage from './pages/shop-management/dgt-purchase';
import PurchaseSuccessPage from './pages/shop-management/purchase-success';

// Mod Pages
import ModDashboardPage from './pages/mod/index';
import ModShoutboxPage from './pages/mod/shoutbox';
import ModUsersPage from './pages/mod/users';
import ModReportsPage from './pages/mod/reports';

// Dictionary Pages
import DictionaryIndexPage from './pages/dictionary/index';
import DictionarySlugPage from './pages/dictionary/[slug]';

// Other Pages
import ReferralsPage from './pages/referrals/index';
import InvitePage from './pages/invite/[code]';
import PreferencesPage from './pages/preferences/index';
import UIPlaygroundPage from './pages/ui-playground';

// Test Components (Development Only)
import { ErrorBoundaryTest } from './__tests__/components/ErrorBoundaryTest';

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
      { path: 'forums', element: <ForumsIndexPage /> },
      { path: 'forums/:forumSlug', element: <ForumRoutePage /> },
      { path: 'forums/:forumSlug/:subforumSlug', element: <ForumRoutePage /> },
      
      // Thread Routes
      { path: 'threads/create', element: <ProtectedRoute><CreateThreadPage /></ProtectedRoute> },
      { path: 'threads/:slug', element: <ThreadDetailPage /> },

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
      // { 
      //   path: 'missions', 
      //   element: <ProtectedRoute><MissionsPage /></ProtectedRoute> 
      // },
      { 
        path: 'about', 
        element: <AboutPage /> 
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

  // Test Route for Error Boundary (Development Only)
  ...(process.env.NODE_ENV === 'development' ? [{
    path: '/test/error-boundary',
    element: (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Error Boundary Test Page</h1>
        <ErrorBoundaryTest />
      </div>
    ),
  }] : []),
]);