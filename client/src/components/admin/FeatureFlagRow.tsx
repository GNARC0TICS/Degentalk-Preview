import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { useState, useEffect } from 'react';
import { useToggleFlag } from '@/features/admin/services/featureFlagsService';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface FeatureFlag {
	key: string;
	name: string;
	description?: string | null;
	isEnabled: boolean;
	rolloutPercentage: number;
}

interface Props {
	flag: FeatureFlag;
}

export function FeatureFlagRow({ flag }: Props) {
	const [enabled, setEnabled] = useState(flag.isEnabled);
	const [percentage, setPercentage] = useState(flag.rolloutPercentage);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const toggle = useToggleFlag();
	const { toast } = useToast();

	// Reset local state when flag data changes
	useEffect(() => {
		setEnabled(flag.isEnabled);
		setPercentage(flag.rolloutPercentage);
		setHasUnsavedChanges(false);
	}, [flag.isEnabled, flag.rolloutPercentage]);

	// Check if there are unsaved changes
	useEffect(() => {
		const hasChanges = enabled !== flag.isEnabled || percentage !== flag.rolloutPercentage;
		setHasUnsavedChanges(hasChanges);
	}, [enabled, percentage, flag.isEnabled, flag.rolloutPercentage]);

	const saveChanges = async () => {
		if (!hasUnsavedChanges) return;

		try {
			await toggle.mutateAsync({
				key: flag.key,
				enabled,
				rolloutPercentage: percentage
			});

			toast({
				title: 'Feature flag updated',
				description: `${flag.name || flag.key} has been updated successfully.`
			});
		} catch (error) {
			toast({
				title: 'Failed to update feature flag',
				description: 'There was an error updating the feature flag. Please try again.',
				variant: 'destructive'
			});

			// Reset to original values on error
			setEnabled(flag.isEnabled);
			setPercentage(flag.rolloutPercentage);
		}
	};

	const handleEnabledChange = (newEnabled: boolean) => {
		setEnabled(newEnabled);
		// Auto-save for the enable/disable toggle
		setTimeout(saveChanges, 100);
	};

	const handlePercentageSliderChange = (value: number[]) => {
		setPercentage(value[0]);
	};

	const handlePercentageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Math.max(0, Math.min(100, Number(e.target.value)));
		setPercentage(value);
	};

	const getStatusBadge = () => {
		if (!enabled) {
			return <Badge variant="secondary">Disabled</Badge>;
		}

		if (percentage < 100) {
			return <Badge variant="outline">Partial ({percentage}%)</Badge>;
		}

		return <Badge variant="default">Full Rollout</Badge>;
	};

	return (
		<TableRow
			data-testid={`flag-${flag.key}`}
			className={hasUnsavedChanges ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}
		>
			<TableCell className="font-medium">
				<div className="flex items-center gap-2">
					<span>{flag.name || flag.key}</span>
					{toggle.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
					{hasUnsavedChanges && !toggle.isPending && (
						<AlertCircle className="h-3 w-3 text-yellow-600" />
					)}
				</div>
			</TableCell>

			<TableCell className="max-w-lg">
				<div className="space-y-1">
					<p className="text-sm text-muted-foreground">
						{flag.description || 'No description provided'}
					</p>
					{getStatusBadge()}
				</div>
			</TableCell>

			<TableCell className="text-center">
				<Switch
					checked={enabled}
					onCheckedChange={handleEnabledChange}
					disabled={toggle.isPending}
				/>
			</TableCell>

			<TableCell className="w-56">
				<div className="space-y-2">
					<Slider
						min={0}
						max={100}
						step={1}
						value={[percentage]}
						onValueChange={handlePercentageSliderChange}
						onValueCommit={saveChanges}
						disabled={!enabled || toggle.isPending}
						className="w-full"
					/>
					<div className="flex items-center gap-2">
						<Input
							type="number"
							min={0}
							max={100}
							className="h-8 text-xs"
							value={percentage}
							onChange={handlePercentageInputChange}
							onBlur={saveChanges}
							disabled={!enabled || toggle.isPending}
						/>
						<span className="text-xs text-muted-foreground">%</span>
					</div>
				</div>
			</TableCell>
		</TableRow>
	);
}
