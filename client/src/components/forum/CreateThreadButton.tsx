import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@app/components/ui/button';
import { PumpButton } from '@app/components/uiverse-clones/buttons';
import type { ButtonProps } from '@app/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@app/hooks/use-auth';
import type { CategoryId } from '@shared/types/ids';

// import { ROUTES } from '@app/constants/routes'; // ROUTES not used directly here

interface CreateThreadButtonProps extends ButtonProps {
	forumSlug?: string;
	categoryId?: CategoryId;
	redirectAuth?: boolean;
	// onThreadCreated?: () => void; // This prop doesn't seem to be used, consider removing if not needed elsewhere
}

export function CreateThreadButton({
	forumSlug,
	categoryId,
	redirectAuth = true, // Default to true
	// onThreadCreated,
	className = '',
	variant = 'default',
	size = 'default',
	...props
}: CreateThreadButtonProps) {
	const { user } = useAuth();
	const isLoggedIn = !!user;

	if (!isLoggedIn && redirectAuth) {
		// Determine redirect path based on available context
		let redirectPath = '/forums'; // Default redirect
		if (forumSlug) {
			redirectPath = `/forums/${forumSlug}`;
		} else if (categoryId) {
			// If we have categoryId, we might want to redirect to that category's page
			// This requires knowing the category slug or having a route like /categories/:id
			// For now, let's assume a generic redirect or enhance later if category page by ID is available
			// For simplicity, we'll still use a general forum redirect or the specific forumSlug if available
			// This part might need adjustment based on how category pages are structured if forumSlug is absent
		}

		return (
			<Link to={`/auth?redirect_to=${encodeURIComponent(redirectPath)}`}>
				<PumpButton
					variant="neutral" 
					size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
					className={className} 
					pulse={false}
					{...props}
				>
					<Plus className="h-4 w-4" />
					Sign in to Post
				</PumpButton>
			</Link>
		);
	}

	if (!isLoggedIn && !redirectAuth) {
		// If not logged in and redirectAuth is false, perhaps disable the button or show a different message
		// For now, let's disable it.
		return (
			<Button variant={variant} size={size} className={className} {...props} disabled>
				<Plus className="h-4 w-4 mr-2" />
				New Thread (Login Required)
			</Button>
		);
	}

	// URL Building Logic
	let createThreadUrl = '/threads/create';
	const queryParams = new URLSearchParams();
	if (forumSlug) {
		queryParams.append('forumSlug', forumSlug);
	} else if (categoryId) {
		queryParams.append('categoryId', categoryId.toString());
	}
	const queryString = queryParams.toString();
	if (queryString) {
		createThreadUrl += `?${queryString}`;
	}

	return (
		<Link to={createThreadUrl}>
			<PumpButton 
				variant="pump" 
				size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
				className={className}
				pulse
				{...props}
			>
				<Plus className="h-4 w-4" />
				New Thread
			</PumpButton>
		</Link>
	);
}
