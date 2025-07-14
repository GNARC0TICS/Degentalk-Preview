import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/utils/utils';

interface Item {
	id: string;
	name: string;
	iconUrl?: string | null;
}

interface UnlockMultiSelectProps {
	label: string;
	endpoint: string; // /api/admin/titles etc.
	selectedIds: string[];
	onChange: (ids: string[]) => void;
	className?: string;
}

/**
 * Generic multi-select popover for selecting unlockable item IDs (titles, badges, frames).
 * Fetches from admin endpoints and returns id list via onChange.
 */
export const UnlockMultiSelect: React.FC<UnlockMultiSelectProps> = ({
	label,
	endpoint,
	selectedIds,
	onChange,
	className
}) => {
	const { data: items = [], isLoading } = useQuery<Item[]>({
		queryKey: [endpoint],
		queryFn: async () => {
			const res = await fetch(endpoint);
			if (!res.ok) throw new Error('Failed to load data');
			return res.json();
		}
	});

	const toggle = (id: string) => {
		if (selectedIds.includes(id)) {
			onChange(selectedIds.filter((i) => i !== id));
		} else {
			onChange([...selectedIds, id]);
		}
	};

	const summaryText = () => {
		if (isLoading) return 'Loading…';
		if (!selectedIds.length) return `No ${label.toLowerCase()}`;
		if (selectedIds.length === items.length) return `All ${label.toLowerCase()}`;
		const names = items
			.filter((i) => selectedIds.includes(i.id))
			.map((i) => i.name)
			.join(', ');
		return names || `${selectedIds.length} selected`;
	};

	return (
		<div className={cn('w-full', className)}>
			<p className="text-sm font-medium mb-1">{label}</p>
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline" className="w-full justify-between">
						<span>{summaryText()}</span>
						<Check className="h-4 w-4 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="p-0 w-64">
					{isLoading ? (
						<div className="flex items-center justify-center h-24">
							<Loader2 className="h-5 w-5 animate-spin" />
						</div>
					) : (
						<ScrollArea className="h-60 p-2">
							{items.map((item) => (
								<label
									key={item.id}
									className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent/50 cursor-pointer"
								>
									<Checkbox
										checked={selectedIds.includes(item.id)}
										onCheckedChange={() => toggle(item.id)}
									/>
									{item.iconUrl ? (
										<img src={item.iconUrl} alt={item.name} className="h-4 w-4 rounded-sm" />
									) : null}
									<span className="text-sm">{item.name}</span>
								</label>
							))}
						</ScrollArea>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
};
