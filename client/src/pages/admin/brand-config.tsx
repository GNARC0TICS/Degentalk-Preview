import React from 'react';
import { useBrand, BrandProvider } from '@/contexts/BrandContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

const BrandConfigAdminPageInner: React.FC = () => {
	const { brandConfig, refresh } = useBrand();

	return (
		<div className="p-6 space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Brand Configuration (Placeholder)</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						This page will eventually allow full editing of the platform design system. For now it
						just displays the current (static) configuration pulled from the API.
					</p>
					<div className="flex items-center gap-2 mt-4">
						<button className="btn btn-secondary" onClick={refresh}>
							Refresh
						</button>
					</div>
					<pre className="mt-4 bg-muted p-4 rounded overflow-auto text-xs max-h-[60vh]">
						{JSON.stringify(brandConfig, null, 2)}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
};

const BrandConfigAdminPage: React.FC = () => {
	return (
		<BrandProvider>
			<BrandConfigAdminPageInner />
		</BrandProvider>
	);
};

export default BrandConfigAdminPage;
