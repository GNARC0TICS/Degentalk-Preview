import React from 'react';
import { IconRenderer } from '@/components/icons/iconRenderer';

interface SearchBoxProps {
	className?: string;
	placeholder?: string;
}

export function SearchBox({ className, placeholder = 'Search threads...' }: SearchBoxProps) {
	return (
		<div className={`relative w-full ${className}`}>
			<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<IconRenderer icon="search" size={16} className="h-4 w-4 text-zinc-500" />
			</div>
			<div className="pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-sm w-full text-zinc-500">
				{placeholder}
			</div>
		</div>
	);
}
