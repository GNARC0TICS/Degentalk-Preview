import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Loader2, Check } from 'lucide-react';

interface Role {
	id: number;
	name: string;
	color?: string | null;
}

interface AdminAccessSelectorProps {
	label?: string;
	selectedIds: number[];
	onChange: (ids: number[]) => void;
	className?: string;
}

/**
 * AdminAccessSelector
 *
 * Reusable multi-select popover that lists all roles (fetched from /api/admin/roles)
 * and allows selecting multiple role IDs.
 */
export const AdminAccessSelector: React.FC<AdminAccessSelectorProps> = ({
	label = 'Select Roles',
	selectedIds,
	onChange,
	className
}) => {
	const { data: roles = [], isLoading } = useQuery<Role[]>({
		queryKey: ['/admin/roles'],
		queryFn: async () => {
			const res = await fetch('/api/admin/roles');
			if (!res.ok) throw new Error('Failed to load roles');
			return res.json();
		}
	});

	const toggleRole = (id: number) => {
		if (selectedIds.includes(id)) {
			onChange(selectedIds.filter((r) => r !== id));
		} else {
			onChange([...selectedIds, id]);
		}
	};

	// Display text summarizing current selection
	const summaryText = () => {
		if (!selectedIds.length) return 'No roles';
		if (selectedIds.length === roles.length) return 'All roles';
		const names = roles
			.filter((r) => selectedIds.includes(r.id))
			.map((r) => r.name)
			.join(', ');
		return names || `${selectedIds.length} selected`;
	};

	return (
		<div className={cn('w-full', className)}>
			{label && <p className="text-sm font-medium mb-1">{label}</p>}
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline" className="w-full justify-between">
						<span>{isLoading ? 'Loading…' : summaryText()}</span>
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
							{roles.map((role) => (
								<label
									key={role.id}
									className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent/50 cursor-pointer"
								>
									<Checkbox
										checked={selectedIds.includes(role.id)}
										onCheckedChange={() => toggleRole(role.id)}
									/>
									<span className={cn('text-sm', role.color ? `text-[${role.color}]` : undefined)}>
										{role.name}
									</span>
								</label>
							))}
						</ScrollArea>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
};
