import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SettingsCardProps {
	title?: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}

/**
 * A card component for displaying preferences sections
 */
export function PreferencesCard({ title, description, children, className }: SettingsCardProps) {
	// If title is provided, render with header
	if (title) {
		return (
			<Card className={`mb-6 border-border ${className}`}>
				<CardHeader className="pb-3">
					<CardTitle className="text-xl font-semibold">{title}</CardTitle>
					{description && (
						<CardDescription className="text-muted-foreground">{description}</CardDescription>
					)}
				</CardHeader>
				<CardContent>{children}</CardContent>
			</Card>
		);
	}
	
	// Otherwise, just render as a wrapper
	return (
		<Card className={`mb-6 border-border ${className}`}>
			{children}
		</Card>
	);
}
