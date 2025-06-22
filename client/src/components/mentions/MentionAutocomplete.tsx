import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MentionUser {
	id: string;
	username: string;
	avatarUrl?: string | null;
	activeAvatarUrl?: string | null;
	role?: string | null;
	level?: number | null;
}

interface MentionAutocompleteProps {
	onSelect: (user: MentionUser) => void;
	query: string;
	isOpen: boolean;
	onClose: () => void;
	position: { top: number; left: number };
	className?: string;
}

export function MentionAutocomplete({
	onSelect,
	query,
	isOpen,
	onClose,
	position,
	className
}: MentionAutocompleteProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

	// Fetch users for mention autocomplete
	const { data: usersData, isLoading } = useQuery({
		queryKey: ['/api/social/mentions/search-users', query],
		queryFn: async () => {
			if (!query || query.length < 1) return { users: [] };

			return await apiRequest<{ users: MentionUser[] }>({
				url: `/api/social/mentions/search-users?q=${encodeURIComponent(query)}&limit=10`,
				method: 'GET'
			});
		},
		enabled: isOpen && query.length >= 1,
		staleTime: 30000 // Cache for 30 seconds
	});

	const users = usersData?.users || [];

	// Reset selected index when users change
	useEffect(() => {
		setSelectedIndex(0);
	}, [users]);

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!isOpen || users.length === 0) return;

			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					setSelectedIndex((prev) => (prev + 1) % users.length);
					break;
				case 'ArrowUp':
					e.preventDefault();
					setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
					break;
				case 'Enter':
					e.preventDefault();
					if (users[selectedIndex]) {
						onSelect(users[selectedIndex]);
					}
					break;
				case 'Escape':
					e.preventDefault();
					onClose();
					break;
			}
		},
		[isOpen, users, selectedIndex, onSelect, onClose]
	);

	// Add keyboard event listener
	useEffect(() => {
		if (isOpen) {
			document.addEventListener('keydown', handleKeyDown);
			return () => document.removeEventListener('keydown', handleKeyDown);
		}
	}, [isOpen, handleKeyDown]);

	// Scroll selected item into view
	useEffect(() => {
		if (containerRef.current && selectedIndex >= 0) {
			const selectedElement = containerRef.current.children[selectedIndex] as HTMLElement;
			if (selectedElement) {
				selectedElement.scrollIntoView({
					block: 'nearest',
					behavior: 'smooth'
				});
			}
		}
	}, [selectedIndex]);

	if (!isOpen || (query.length >= 1 && users.length === 0 && !isLoading)) {
		return null;
	}

	const getRoleColor = (role?: string | null) => {
		switch (role) {
			case 'admin':
				return 'bg-red-900/60 text-red-300 border-red-700/30';
			case 'mod':
				return 'bg-blue-900/60 text-blue-300 border-blue-700/30';
			default:
				return 'bg-zinc-700/60 text-zinc-300 border-zinc-600/30';
		}
	};

	const getRoleLabel = (role?: string | null) => {
		switch (role) {
			case 'admin':
				return 'Admin';
			case 'mod':
				return 'Mod';
			default:
				return 'User';
		}
	};

	return (
		<div
			ref={containerRef}
			className={cn(
				'absolute z-50 w-80 max-h-64 overflow-y-auto',
				'bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl',
				'animate-in fade-in-0 zoom-in-95 duration-200',
				className
			)}
			style={{
				top: position.top,
				left: position.left
			}}
		>
			{isLoading ? (
				<div className="p-4 text-center text-zinc-400">
					<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500 mx-auto mb-2"></div>
					Searching users...
				</div>
			) : users.length === 0 ? (
				<div className="p-4 text-center text-zinc-400">No users found matching "{query}"</div>
			) : (
				<div className="py-2">
					<div className="px-3 py-1 text-xs font-medium text-zinc-500 border-b border-zinc-800">
						Select user to mention
					</div>
					{users.map((user, index) => (
						<div
							key={user.id}
							className={cn(
								'flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors',
								selectedIndex === index
									? 'bg-emerald-900/20 border-l-2 border-emerald-500'
									: 'hover:bg-zinc-800/50'
							)}
							onClick={() => onSelect(user)}
							onMouseEnter={() => setSelectedIndex(index)}
						>
							<Avatar className="h-8 w-8 border border-zinc-700">
								<AvatarImage
									src={user.activeAvatarUrl || user.avatarUrl || ''}
									alt={user.username}
								/>
								<AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">
									{user.username.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<span className="font-medium text-zinc-200 truncate">@{user.username}</span>
									<Badge
										variant="outline"
										className={cn('text-xs px-1.5 py-0', getRoleColor(user.role))}
									>
										{getRoleLabel(user.role)}
									</Badge>
								</div>
								{user.level && <div className="text-xs text-zinc-500">Level {user.level}</div>}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
