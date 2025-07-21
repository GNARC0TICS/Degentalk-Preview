/**
 * Numeric Access Selector Wrapper
 * Wraps AdminAccessSelector to work with numeric IDs
 */

import React from 'react';
import { AdminAccessSelector } from './AdminAccessSelector';

interface NumericAccessSelectorProps {
	label: string;
	selectedIds: number[];
	onChange: (ids: number[]) => void;
	className?: string;
}

export function NumericAccessSelector({
	label,
	selectedIds,
	onChange,
	className
}: NumericAccessSelectorProps) {
	// Convert numbers to strings for AdminAccessSelector
	const stringIds = selectedIds.map(id => id.toString());
	
	// Convert back to numbers when onChange is called
	const handleChange = (ids: string[]) => {
		onChange(ids.map(id => parseInt(id, 10)));
	};
	
	return (
		<AdminAccessSelector
			label={label}
			selectedIds={stringIds}
			onChange={handleChange}
			className={className}
		/>
	);
}