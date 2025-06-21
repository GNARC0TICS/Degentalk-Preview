import { useFeatureFlags } from '@/features/admin/services/featureFlagsService';
import { FeatureFlagRow } from '@/components/admin/FeatureFlagRow';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';

export default function AdminFeatureFlagsPage() {
	const { data: flags, isLoading, error } = useFeatureFlags();

	return (
		<AdminPageShell title="Feature Flags">
			<Card>
				<CardHeader>
					<CardTitle>Rollout Control</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading && <p>Loading…</p>}
					{error && <p className="text-red-500">Error loading flags</p>}
					{flags && (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Flag</TableHead>
									<TableHead>Description</TableHead>
									<TableHead className="text-center">Enabled</TableHead>
									<TableHead>Rollout %</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{flags.map((flag) => (
									<FeatureFlagRow key={flag.key} flag={flag} />
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</AdminPageShell>
	);
}
