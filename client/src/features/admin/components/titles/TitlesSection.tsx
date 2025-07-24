import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import type { AdminTitle as Title } from '@app/types/admin-title.types';
import type { Role } from '@app/types/admin.types';

interface TitlesSectionProps {
	titles: Title[];
	roles: Role[];
	isLoading: boolean;
}

export function TitlesSection({ titles, roles, isLoading }: TitlesSectionProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>User Titles</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8 text-zinc-400">Loading titles...</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>User Titles</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-center py-8 text-zinc-400">Titles management coming soon...</div>
			</CardContent>
		</Card>
	);
}
