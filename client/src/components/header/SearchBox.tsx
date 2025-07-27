import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconRenderer } from '@/components/icons/iconRenderer';
import { Input } from '@/components/ui/input';

interface SearchBoxProps {
	className?: string;
	placeholder?: string;
}

export function SearchBox({ className, placeholder = 'Search threads...' }: SearchBoxProps) {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = React.useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
		}
	};

	return (
		<form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
			<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<IconRenderer icon="search" size={16} className="h-4 w-4 text-zinc-500" />
			</div>
			<Input
				type="text"
				placeholder={placeholder}
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				className="pl-10 bg-zinc-800/50 border-zinc-700 text-sm w-full"
			/>
		</form>
	);
}
