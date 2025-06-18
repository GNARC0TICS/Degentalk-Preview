import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { useUpdateXpAction } from '@/features/admin/services/xpActionsService';

export interface XpAction {
	action: string;
	description: string;
	baseValue: number;
	cloutMultiplier?: number | null;
	enabled: boolean;
}

interface Props {
	action: XpAction;
}

export function XpActionRow({ action }: Props) {
	const [xp, setXp] = useState(action.baseValue);
	const [enabled, setEnabled] = useState(action.enabled);
	const update = useUpdateXpAction();

	const save = () => {
		update.mutate({
			actionKey: action.action,
			payload: { baseValue: xp, enabled }
		});
	};

	return (
		<tr className="border-b">
			<td className="p-2 font-mono text-xs">{action.action}</td>
			<td className="p-2">{action.description}</td>
			<td className="p-2 w-32">
				<Input
					type="number"
					min={0}
					value={xp}
					onChange={(e) => setXp(Number(e.target.value))}
					onBlur={save}
				/>
			</td>
			<td className="p-2 text-center">
				<Switch checked={enabled} onCheckedChange={setEnabled} onBlur={save} />
			</td>
		</tr>
	);
} 