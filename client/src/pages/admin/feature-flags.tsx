import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { RefreshCw, ToggleLeft } from 'lucide-react';
import ProtectedAdminRoute from '@/features/admin/components/protected-admin-route';
import { useAdminModuleV2 } from '@/hooks/use-admin-modules';
import { VisualJsonTabs } from '@/features/admin/components/VisualJsonTabs';
import { useJsonConfig } from '@/hooks/useJsonConfig';
import {
	featureFlagsSchema,
	type FeatureFlags,
	type FeatureFlag
} from '@/schemas/featureFlags.schema';
import { SwitchRow } from '@/features/admin/components/form-controls';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

/* -------------------------------------------------------------------------
 * Visual feature-flag editor: simple table with inline controls
 * -----------------------------------------------------------------------*/
function VisualFeatureFlagsEditor({
	state,
	setState
}: {
	state: FeatureFlags;
	setState: (next: FeatureFlags) => void;
}) {
	const updateFlag = (idx: number, changes: Partial<FeatureFlag>) => {
		const next = state.map((f, i) => (i === idx ? { ...f, ...changes } : f));
		setState(next);
	};

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Key</TableHead>
					<TableHead>Description</TableHead>
					<TableHead className="text-center">Enabled</TableHead>
					<TableHead>Rollout %</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{state.map((flag, idx) => (
					<TableRow key={flag.key}>
						<TableHead>{flag.key}</TableHead>
						<TableHead>{flag.description}</TableHead>
						<TableHead className="text-center">
							<SwitchRow
								label=""
								checked={flag.isEnabled}
								onChange={(v) => updateFlag(idx, { isEnabled: v })}
							/>
						</TableHead>
						<TableHead className="w-56">
							<div className="flex items-center gap-2">
								<Slider
									min={0}
									max={100}
									step={1}
									value={[flag.rolloutPercentage]}
									onValueChange={(v) => updateFlag(idx, { rolloutPercentage: v[0] })}
									disabled={!flag.isEnabled}
									className="flex-1"
								/>
								<Input
									type="number"
									min={0}
									max={100}
									className="h-8 w-16"
									value={flag.rolloutPercentage}
									onChange={(e) =>
										updateFlag(idx, {
											rolloutPercentage: Math.min(100, Math.max(0, Number(e.target.value) ?? 0))
										})
									}
									disabled={!flag.isEnabled}
								/>
								<span className="text-xs">%</span>
							</div>
						</TableHead>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

/* -------------------------------------------------------------------------
 * Main content component
 * -----------------------------------------------------------------------*/
function FeatureFlagsContent() {
	const { module, isEnabled } = useAdminModule('feature-flags');
	const { data, save, loading } = useJsonConfig<FeatureFlags>(
		'/admin/feature-flags',
		featureFlagsSchema
	);

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

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ToggleLeft className="h-5 w-5" /> Feature Flag Management
				</CardTitle>
				<CardDescription>
					Control feature rollouts and gradual deployments across the platform. Toggle features and
					adjust rollout percentages for controlled releases.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<VisualJsonTabs<FeatureFlags>
					shapeSchema={featureFlagsSchema}
					value={data}
					onChange={save}
					loading={loading}
				>
					{(state, setState) => <VisualFeatureFlagsEditor state={state} setState={setState} />}
				</VisualJsonTabs>
			</CardContent>
		</Card>
	);
}

/* -------------------------------------------------------------------------
 * Page export with admin protection
 * -----------------------------------------------------------------------*/
export default function AdminFeatureFlagsPage() {
	return (
		<ProtectedAdminRoute moduleId="feature-flags">
			<FeatureFlagsContent />
		</ProtectedAdminRoute>
	);
}
