import { Redirect, Route } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

/**
 * AdminRoute - Verifies the user is authenticated and has admin privileges.
 * Redirects to /auth if not logged in, or / if not an admin.
 */
export function AdminRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>; // Changed to React.ComponentType<any> for broader compatibility
}) {
  const { user, isLoading, isDevMode } = useAuth();

  // In development with a mock user, we still want to respect the role for admin routes
  // unless specifically bypassed for a different kind of testing.
  // For now, we'll strictly check the role even in dev mode if a user object exists.

  return (
    <Route path={path}>
      {(params) => { // Added params for potential use by Component
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (user && user.role === 'admin') {
          return <Component {...params} />;
        }

        // If in dev mode and user is explicitly set to non-admin, 
        // or in prod mode and user is not admin or not logged in.
        if (isDevMode && user && user.role !== 'admin') {
          // In dev, if logged in as non-admin, show an unauthorized message or redirect
          // console.warn(`[DEV] AdminRoute: Access to ${path} denied for mock role ${user.role}`);
          return <Redirect to="/" />; // Or a specific /unauthorized page
        }
        
        if (!user) {
          return <Redirect to="/auth" />;
        }

        // Default redirect for non-admin users in production
        return <Redirect to="/" />;
      }}
    </Route>
  );
}
