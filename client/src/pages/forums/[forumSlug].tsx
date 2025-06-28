import React from 'react';
import ForumPageView from '@/components/forum/ForumPage';
import ForumErrorBoundary from '@/components/forum/ForumErrorBoundary';

/**
 * Forum Route Page
 *
 * Consolidated dynamic route for rendering individual forums.
 * All heavy lifting is delegated to `ForumPageView`, a dedicated
 * component that handles data fetching, layout, and interactions.
 */
const ForumRoutePage: React.FC = () => {
	return (
		<ForumErrorBoundary>
			<ForumPageView />
		</ForumErrorBoundary>
	);
};

export default ForumRoutePage;
