import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import type { ButtonProps } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
// import { ROUTES } from '@/constants/routes'; // ROUTES not used directly here

interface CreateThreadButtonProps extends ButtonProps {
	// categoryId?: number; // REPLACED
	forumSlug?: string; // NEW: Use forumSlug
	// onThreadCreated?: () => void; // This prop doesn't seem to be used, consider removing if not needed elsewhere
}

export function CreateThreadButton({
	// categoryId, // REPLACED
	forumSlug, // NEW
	// onThreadCreated,
	className = '',
	variant = 'default',
	size = 'default',
	...props
}: CreateThreadButtonProps) {
	const { user } = useAuth();
	const isLoggedIn = !!user;

	if (!isLoggedIn) {
		// Redirect to auth, potentially with a redirect_to query param to come back to the forum page
		const redirectPath = forumSlug ? `/forums/${forumSlug}` : '/forums';
		return (
			<Button variant="outline" size={size} asChild className={className} {...props}>
				<Link href={`/auth?redirect_to=${encodeURIComponent(redirectPath)}`}>
					<Plus className="h-4 w-4 mr-2" />
					Sign in to Post
				</Link>
			</Button>
		);
	}

	const createThreadUrl = forumSlug
		? `/threads/create?forumSlug=${encodeURIComponent(forumSlug)}`
		: '/threads/create';

	return (
		<Button variant={variant} size={size} className={className} asChild {...props}>
			<Link href={createThreadUrl}>
				<Plus className="h-4 w-4 mr-2" />
				New Thread
			</Link>
		</Button>
	);
}
