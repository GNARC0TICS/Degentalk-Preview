import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Role {
	id: string;
	name: string;
	permissions: string[];
}

interface PermissionsOverviewProps {
	roles: Role[];
	isLoading: boolean;
}

export function PermissionsOverview({ isLoading }: PermissionsOverviewProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Permissions Overview</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8 text-zinc-400">Loading permissions...</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Permissions Overview</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-center py-8 text-zinc-400">Permissions management coming soon...</div>
			</CardContent>
		</Card>
	);
}
