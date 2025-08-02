import React, { useState } from 'react';
import { IconRenderer } from '@/components/icons/iconRenderer';

interface SearchBoxProps {
	className?: string;
	placeholder?: string;
}

export function SearchBox({ className, placeholder = 'Search threads...' }: SearchBoxProps) {
	const [searchValue, setSearchValue] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// For landing page - just log the search
		console.log('Search submitted:', searchValue);
	};

	return (
		<form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
			<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<IconRenderer icon="search" size={16} className="h-4 w-4 text-zinc-500" />
			</div>
			<input
				type="search"
				value={searchValue}
				onChange={(e) => setSearchValue(e.target.value)}
				placeholder={placeholder}
				className="pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-sm w-full text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
				aria-label="Search"
			/>
		</form>
	);
}
