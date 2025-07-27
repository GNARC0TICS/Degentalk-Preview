import React from 'react';
import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';

interface SiteLayoutWrapperProps {
	children: React.ReactNode;
}

// TODO(gravity-well): Delete this legacy wrapper after Phase 3 migration when AppShell & MainGrid replace it.

export function SiteLayoutWrapper({ children }: SiteLayoutWrapperProps) {
	return (
		<div className="flex flex-col min-h-screen">
			<SiteHeader />
			<main className="flex-grow container mx-auto px-2 sm:px-4 py-8">{children}</main>
			<SiteFooter />
		</div>
	);
}
