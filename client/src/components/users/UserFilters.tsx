import React from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SortAsc, SortDesc, Zap, Users } from 'lucide-react';

interface UserFiltersProps {
	filters: {
		sortBy: 'username' | 'level' | 'xp' | 'reputation' | 'joinDate';
		sortOrder: 'asc' | 'desc';
		onlineOnly: boolean;
		minXP: number;
	};
	onFiltersChange: (filters: UserFiltersProps['filters']) => void;
}

export function UserFilters({ filters, onFiltersChange }: UserFiltersProps) {
	const updateFilter = (key: keyof UserFiltersProps['filters'], value: any) => {
		onFiltersChange({
			...filters,
			[key]: value
		});
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{/* Sort By */}
			<div className="space-y-2">
				<Label className="text-zinc-300 text-sm font-medium">Sort By</Label>
				<Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
					<SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-300">
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="bg-zinc-800 border-zinc-700">
						<SelectItem value="username" className="text-zinc-300 hover:bg-zinc-700">
							Username
						</SelectItem>
						<SelectItem value="level" className="text-zinc-300 hover:bg-zinc-700">
							Level
						</SelectItem>
						<SelectItem value="xp" className="text-zinc-300 hover:bg-zinc-700">
							XP Points
						</SelectItem>
						<SelectItem value="reputation" className="text-zinc-300 hover:bg-zinc-700">
							Reputation Score
						</SelectItem>
						<SelectItem value="joinDate" className="text-zinc-300 hover:bg-zinc-700">
							Join Date
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Sort Order */}
			<div className="space-y-2">
				<Label className="text-zinc-300 text-sm font-medium">Order</Label>
				<Select
					value={filters.sortOrder}
					onValueChange={(value) => updateFilter('sortOrder', value)}
				>
					<SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-300">
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="bg-zinc-800 border-zinc-700">
						<SelectItem value="asc" className="text-zinc-300 hover:bg-zinc-700">
							<div className="flex items-center">
								<SortAsc className="w-4 h-4 mr-2" />
								Ascending
							</div>
						</SelectItem>
						<SelectItem value="desc" className="text-zinc-300 hover:bg-zinc-700">
							<div className="flex items-center">
								<SortDesc className="w-4 h-4 mr-2" />
								Descending
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Minimum XP */}
			<div className="space-y-2">
				<Label className="text-zinc-300 text-sm font-medium flex items-center">
					<Zap className="w-4 h-4 mr-1 text-emerald-400" />
					Min XP
				</Label>
				<Input
					type="number"
					placeholder="0"
					value={filters.minXP || ''}
					onChange={(e) => updateFilter('minXP', parseInt(e.target.value) || 0)}
					className="bg-zinc-800/50 border-zinc-700 text-zinc-300 placeholder-zinc-500"
					min="0"
					step="100"
				/>
			</div>

			{/* Online Only Toggle */}
			<div className="space-y-2">
				<Label className="text-zinc-300 text-sm font-medium flex items-center">
					<Users className="w-4 h-4 mr-1 text-cyan-400" />
					Filters
				</Label>
				<div className="flex items-center space-x-3 pt-2">
					<Switch
						id="online-only"
						checked={filters.onlineOnly}
						onCheckedChange={(checked) => updateFilter('onlineOnly', checked)}
						className="data-[state=checked]:bg-emerald-600"
					/>
					<Label htmlFor="online-only" className="text-sm text-zinc-400 cursor-pointer">
						Online only
					</Label>
				</div>
			</div>
		</div>
	);
}

export default UserFilters;
