import React from 'react';
import { TableCell, TableRow } from '@app/components/ui/table';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import type { XpAction } from '../services/xpActionsService';

interface XpActionRowProps {
	action: XpAction;
	onEdit: (action: XpAction) => void;
	onDelete: (action: XpAction) => void;
}

export function XpActionRow({ action, onEdit, onDelete }: XpActionRowProps) {
	return (
		<TableRow>
			<TableCell className="font-mono">{action.action}</TableCell>
			<TableCell>{action.description}</TableCell>
			<TableCell className="text-center">{action.baseValue}</TableCell>
			<TableCell className="text-center">{action.maxPerDay ?? 'N/A'}</TableCell>
			<TableCell className="text-center">{action.cooldownSec ?? 'N/A'}</TableCell>
			<TableCell>
				<Badge variant={action.enabled ? 'default' : 'destructive'}>
					{action.enabled ? 'Enabled' : 'Disabled'}
				</Badge>
			</TableCell>
			<TableCell className="text-right">
				<Button variant="outline" size="sm" className="mr-2" onClick={() => onEdit(action)}>
					<Pencil className="h-4 w-4 mr-1" />
					Edit
				</Button>
				<Button variant="destructive" size="sm" onClick={() => onDelete(action)}>
					<Trash2 className="h-4 w-4 mr-1" />
					Delete
				</Button>
			</TableCell>
		</TableRow>
	);
}
