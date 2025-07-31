import React from 'react';
import { Toaster } from '@/components/ui/toaster';

/**
 * App Component - Static landing page wrapper
 * 
 * This component serves as a container for global UI components
 * that need to be available across the landing page.
 */
function App() {
	return (
		<>
			{/* Global UI Components */}
			<Toaster />
		</>
	);
}

export default App;