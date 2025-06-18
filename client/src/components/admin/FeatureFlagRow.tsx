import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToggleFlag } from '@/features/admin/services/featureFlagsService';

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
	const toggle = useToggleFlag();

	const saveChanges = () => {
		toggle.mutate({ key: flag.key, enabled, rolloutPercentage: percentage });
	};

	return (
		<tr data-testid={`flag-${flag.key}`} className="border-b">
			<td className="p-2 font-medium">{flag.name || flag.key}</td>
			<td className="p-2 max-w-lg text-sm text-muted-foreground">
				{flag.description}
			</td>
			<td className="p-2 text-center">
				<Switch checked={enabled} onCheckedChange={setEnabled} onBlur={saveChanges} />
			</td>
			<td className="p-2 w-56">
				<Slider
					min={0}
					max={100}
					value={[percentage]}
					onValueChange={(v) => setPercentage(v[0])}
					onBlur={saveChanges}
				/>
				<Input
					type="number"
					min={0}
					max={100}
					className="mt-1 h-8"
					value={percentage}
					onChange={(e) => setPercentage(Number(e.target.value))}
					onBlur={saveChanges}
				/>
			</td>
		</tr>
	);
} 