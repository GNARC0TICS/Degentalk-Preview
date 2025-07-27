import React from 'react';
import ForumPageView from '@/components/forum/ForumPage';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

/**
 * Forum Route Page
 *
 * Consolidated dynamic route for rendering individual forums.
 * All heavy lifting is delegated to `ForumPageView`, a dedicated
 * component that handles data fetching, layout, and interactions.
 */
const ForumRoutePage: React.FC = () => {
	return (
		<ErrorBoundary level="component">
			<ForumPageView />
		</ErrorBoundary>
	);
};

export default ForumRoutePage;
