import { useFeatureFlags } from '@/features/admin/services/featureFlagsService';
import { FeatureFlagRow } from '@/components/admin/FeatureFlagRow';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { Button } from '@/components/ui/button';
import { RefreshCw, ToggleLeft, Plus } from 'lucide-react';
import ProtectedAdminRoute from '@/components/admin/protected-admin-route';
import { useAdminModule } from '@/hooks/use-admin-modules';

// Feature Flags Module Component (Protected)
function FeatureFlagsModuleContent() {
	const { module, isEnabled } = useAdminModule('feature-flags');
	const { data: flags, isLoading, error, refetch } = useFeatureFlags();

	// Show module disabled message if not enabled
	if (!isEnabled) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardContent className="p-8 text-center">
						<ToggleLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">Feature Flags Module Disabled</h3>
						<p className="text-muted-foreground">
							The Feature Flags module has been disabled by an administrator.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const pageActions = (
		<div className="flex gap-2">
			<Button variant="outline" onClick={() => refetch()}>
				<RefreshCw className="h-4 w-4 mr-2" />
				Refresh
			</Button>
		</div>
	);

	return (
		<AdminPageShell title={module?.name || 'Feature Flags'} pageActions={pageActions}>
			<div className="space-y-6">
				{/* Overview Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ToggleLeft className="h-5 w-5" />
							Feature Flag Management
						</CardTitle>
						<CardDescription>
							Control feature rollouts and gradual deployments across the platform. Toggle features
							on/off and adjust rollout percentages for controlled releases.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading && (
							<div className="flex items-center justify-center py-8">
								<RefreshCw className="h-6 w-6 animate-spin mr-2" />
								<span>Loading feature flags...</span>
							</div>
						)}

						{error && (
							<div className="text-center py-8">
								<p className="text-red-500 mb-4">Error loading feature flags</p>
								<Button variant="outline" onClick={() => refetch()}>
									Try Again
								</Button>
							</div>
						)}

						{flags && (
							<>
								{flags.length === 0 ? (
									<div className="text-center py-8">
										<ToggleLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
										<h3 className="text-lg font-semibold mb-2">No Feature Flags</h3>
										<p className="text-muted-foreground mb-4">
											No feature flags are currently configured in the system.
										</p>
									</div>
								) : (
									<div className="space-y-4">
										<div className="flex justify-between items-center">
											<p className="text-sm text-muted-foreground">
												{flags.length} feature flag{flags.length !== 1 ? 's' : ''} configured
											</p>
										</div>

										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Flag Name</TableHead>
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
									</div>
								)}
							</>
						)}
					</CardContent>
				</Card>

				{/* Statistics Card */}
				{flags && flags.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Statistics</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-3 gap-4 text-center">
								<div>
									<div className="text-2xl font-bold text-green-600">
										{flags.filter((f) => f.isEnabled).length}
									</div>
									<div className="text-sm text-muted-foreground">Enabled</div>
								</div>
								<div>
									<div className="text-2xl font-bold text-red-600">
										{flags.filter((f) => !f.isEnabled).length}
									</div>
									<div className="text-sm text-muted-foreground">Disabled</div>
								</div>
								<div>
									<div className="text-2xl font-bold text-blue-600">
										{flags.filter((f) => f.rolloutPercentage < 100 && f.isEnabled).length}
									</div>
									<div className="text-sm text-muted-foreground">Partial Rollout</div>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</AdminPageShell>
	);
}

// Main exported component with protection wrapper
export default function AdminFeatureFlagsPage() {
	return (
		<ProtectedAdminRoute moduleId="feature-flags">
			<FeatureFlagsModuleContent />
		</ProtectedAdminRoute>
	);
}
