import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { GlobalRouteGuard } from '@/components/auth/GlobalRouteGuard';

// Import Dev Role Switcher
import { DevRoleSwitcher } from '@/components/dev/dev-role-switcher';

// Import the new XP events hook
import { useXpEvents } from '@/hooks/useXpEvents';

// Import UIPlayground shortcut component
import { DevPlaygroundShortcut } from '@/components/dev/dev-playground-shortcut';

/**
 * App Component - Simplified for react-router-dom
 * 
 * This component now serves as a container for global UI components and hooks
 * that need to be available across all routes. The actual routing is handled
 * by RouterProvider in main.tsx.
 */
function App() {
	// Initialize the XP event listeners
	useXpEvents();

	return (
		<>
			{/* Global Route Guard for authentication */}
			<GlobalRouteGuard />

			{/* Global UI Components */}
			<Toaster />

			{/* Development Tools (only in development) */}
			{import.meta.env.MODE === 'development' && (
				<>
					<DevRoleSwitcher />
					<DevPlaygroundShortcut />
				</>
			)}
		</>
	);
}

export default App;