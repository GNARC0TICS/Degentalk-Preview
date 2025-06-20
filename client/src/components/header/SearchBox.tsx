import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBoxProps {
	className?: string;
	placeholder?: string;
}

export function SearchBox({ className, placeholder = 'Search threads...' }: SearchBoxProps) {
	return (
		<div className={`relative w-full ${className}`}>
			<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<Search className="h-4 w-4 text-zinc-500" />
			</div>
			<Input
				type="text"
				placeholder={placeholder}
				className="pl-10 bg-zinc-800/50 border-zinc-700 text-sm w-full"
			/>
		</div>
	);
}
