import React, { useState } from 'react';
import { Skeleton } from '@app/components/ui/skeleton';
import type { ProfileData } from '@app/types/profile';
import { useFriends } from '@app/hooks/useFriends';
import { Avatar, AvatarImage, AvatarFallback } from '@app/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@app/components/ui/tabs';

interface Props {
	profile: ProfileData;
}

export default function FriendsTab({ profile }: Props) {
	const { mutual, all, isLoading } = useFriends(profile.id);
	const viewingOwnProfile = all !== undefined; // when hook returns all list

	const [activeTab, setActiveTab] = useState<'mutual' | 'friends'>(
		viewingOwnProfile ? 'friends' : 'mutual'
	);

	const renderList = (list: typeof mutual) => {
		if (isLoading) {
			return (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/70">
							<Skeleton className="w-12 h-12 rounded-full" />
							<div className="flex-1 space-y-1">
								<Skeleton className="h-4 w-20" />
							</div>
						</div>
					))}
				</div>
			);
		}

		if (!list || list.length === 0) {
			return <div className="text-zinc-500 italic">No friends to display</div>;
		}

		return (
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{list.map((u) => (
					<a
						key={u.id}
						href={`/profile/${u.username}`}
						className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/70 hover:bg-zinc-900/90"
					>
						<Avatar className="w-12 h-12 border border-zinc-700">
							<AvatarImage src={u.avatarUrl || ''} alt={u.username} />
							<AvatarFallback className="bg-zinc-800 text-zinc-300">
								{u.username.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<span className="truncate text-zinc-200 font-medium">{u.username}</span>
					</a>
				))}
			</div>
		);
	};

	if (!viewingOwnProfile) {
		// public view — only mutual list
		return (
			<div className="space-y-4">
				<h3 className="text-lg font-semibold text-zinc-200">Mutual Friends</h3>
				{renderList(mutual)}
			</div>
		);
	}

	// owner view with tabs
	return (
		<div className="space-y-6">
			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
				<TabsList className="bg-zinc-800/50 mb-4">
					<TabsTrigger value="friends">All Friends ({all?.length || 0})</TabsTrigger>
					<TabsTrigger value="mutual">Mutual ({mutual.length})</TabsTrigger>
				</TabsList>

				<TabsContent value="friends">{renderList(all ?? [])}</TabsContent>
				<TabsContent value="mutual">{renderList(mutual)}</TabsContent>
			</Tabs>
		</div>
	);
}
