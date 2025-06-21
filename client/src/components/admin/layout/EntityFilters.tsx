import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
// import { DatePickerWithRange } from '@/components/ui/date-range-picker'; // Assuming this exists or will be created
import type { DateRange } from 'react-day-picker'; // Keep type for FilterValue
import { cn } from '@/lib/utils';
import { Search, XCircle } from 'lucide-react';

export type FilterValue = string | number | boolean | DateRange | undefined | null;

export interface FilterConfig {
	id: string;
	label: string;
	type: 'text' | 'select' | /* 'date-range' | */ 'boolean'; // Commented out date-range
	placeholder?: string;
	options?: { value: string; label: string }[];
}

interface EntityFiltersProps {
	filtersConfig: FilterConfig[];
	filters: Record<string, FilterValue>;
	onFilterChange: (filterId: string, value: FilterValue) => void;
	onClearFilters?: () => void;
	className?: string;
}

export const EntityFilters: React.FC<EntityFiltersProps> = ({
	filtersConfig,
	filters,
	onFilterChange,
	onClearFilters,
	className
}) => {
	const renderFilterInput = (config: FilterConfig) => {
		const value = filters[config.id];

		switch (config.type) {
			case 'text':
				return (
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder={config.placeholder || `Search by ${config.label.toLowerCase()}...`}
							value={(value as string) || ''}
							onChange={(e) => onFilterChange(config.id, e.target.value)}
							className="pl-8 bg-admin-input-bg border-admin-input-border focus:border-admin-input-focus-border"
						/>
					</div>
				);
			case 'select':
				return (
					<Select
						value={(value as string) || ''}
						onValueChange={(selectValue) => onFilterChange(config.id, selectValue)}
					>
						<SelectTrigger className="bg-admin-input-bg border-admin-input-border">
							<SelectValue
								placeholder={config.placeholder || `Select ${config.label.toLowerCase()}`}
							/>
						</SelectTrigger>
						<SelectContent>
							{config.options?.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);
			// case 'date-range': // Commented out date-range filter
			//   return (
			//     <DatePickerWithRange
			//       date={value as DateRange | undefined}
			//       onDateChange={(dateRange) => onFilterChange(config.id, dateRange)}
			//       className="bg-admin-input-bg border-admin-input-border"
			//     />
			//   );
			case 'boolean':
				return (
					<Select
						value={typeof value === 'boolean' ? String(value) : ''}
						onValueChange={(selectValue) =>
							onFilterChange(config.id, selectValue === '' ? undefined : selectValue === 'true')
						}
					>
						<SelectTrigger className="bg-admin-input-bg border-admin-input-border">
							<SelectValue
								placeholder={config.placeholder || `Filter by ${config.label.toLowerCase()}`}
							/>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">Any</SelectItem>
							<SelectItem value="true">Yes</SelectItem>
							<SelectItem value="false">No</SelectItem>
						</SelectContent>
					</Select>
				);
			default:
				return null;
		}
	};

	const hasActiveFilters = Object.values(filters).some(
		(val) =>
			val !== undefined &&
			val !== '' &&
			(typeof val !== 'object' || (val && Object.keys(val).length > 0))
	);

	return (
		<div
			className={cn('p-4 border border-admin-border-subtle rounded-lg bg-admin-surface', className)}
		>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{filtersConfig.map((config) => (
					<div key={config.id} className="space-y-1">
						<label htmlFor={config.id} className="text-sm font-medium text-admin-text-secondary">
							{config.label}
						</label>
						{renderFilterInput(config)}
					</div>
				))}
			</div>
			{onClearFilters && hasActiveFilters && (
				<div className="mt-4 flex justify-end">
					<Button
						variant="ghost"
						onClick={onClearFilters}
						className="text-admin-text-accent hover:text-admin-text-primary"
					>
						<XCircle className="mr-2 h-4 w-4" /> Clear Filters
					</Button>
				</div>
			)}
		</div>
	);
};
