/**
 * Fixture Preview Component
 * Displays generated fixtures with realistic styling and interactive features
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	User,
	MessageSquare,
	Coins,
	Crown,
	Shield,
	Star,
	TrendingUp,
	Pin,
	Lock,
	Heart,
	Eye,
	Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FixturePreviewProps {
	fixtures: any[];
	type: string;
}

export function FixturePreview({ fixtures, type }: FixturePreviewProps) {
	const [selectedFixture, setSelectedFixture] = useState<any>(null);

	const groupedFixtures = useMemo(() => {
		if (type === 'user') {
			return {
				admins: fixtures.filter((f) => f.role === 'admin'),
				moderators: fixtures.filter((f) => f.role === 'moderator'),
				users: fixtures.filter((f) => f.role === 'user' || !f.role)
			};
		}
		return { all: fixtures };
	}, [fixtures, type]);

	const renderUserFixture = (user: any) => (
		<Card
			key={user.id}
			className="cursor-pointer hover:shadow-md transition-shadow"
			onClick={() => setSelectedFixture(user)}
		>
			<CardContent className="p-4">
				<div className="flex items-start gap-3">
					<Avatar>
						<AvatarImage src={user.avatarUrl} />
						<AvatarFallback>{user.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
					</Avatar>

					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<h3 className="font-semibold truncate">{user.username}</h3>
							{user.role === 'admin' && <Crown className="w-4 h-4 text-yellow-500" />}
							{user.role === 'moderator' && <Shield className="w-4 h-4 text-blue-500" />}
							{user.dgtWalletBalance > 1000000 && <Star className="w-4 h-4 text-purple-500" />}
						</div>

						<p className="text-sm text-muted-foreground truncate">{user.email}</p>

						<div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
							<span>Level {user.level}</span>
							<span>{user.xp?.toLocaleString()} XP</span>
							<span>{user.dgtWalletBalance?.toLocaleString()} DGT</span>
						</div>

						{user.bio && (
							<p className="text-xs text-muted-foreground mt-2 line-clamp-2">{user.bio}</p>
						)}

						<div className="flex gap-1 mt-2">
							<Badge variant="secondary" className="text-xs">
								{user.role || 'user'}
							</Badge>
							{user.isEmailVerified && (
								<Badge variant="outline" className="text-xs">
									verified
								</Badge>
							)}
							{!user.isActive && (
								<Badge variant="destructive" className="text-xs">
									inactive
								</Badge>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	const renderThreadFixture = (thread: any) => (
		<Card
			key={thread.id}
			className="cursor-pointer hover:shadow-md transition-shadow"
			onClick={() => setSelectedFixture(thread)}
		>
			<CardContent className="p-4">
				<div className="flex items-start gap-2">
					{thread.isPinned && <Pin className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />}
					{thread.isLocked && <Lock className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />}

					<div className="flex-1 min-w-0">
						<h3 className="font-semibold line-clamp-2 mb-2">{thread.title}</h3>

						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							<div className="flex items-center gap-1">
								<MessageSquare className="w-3 h-3" />
								{thread.postCount}
							</div>
							<div className="flex items-center gap-1">
								<Eye className="w-3 h-3" />
								{thread.viewCount?.toLocaleString()}
							</div>
							<div className="flex items-center gap-1">
								<Clock className="w-3 h-3" />
								{formatDistanceToNow(new Date(thread.createdAt || Date.now()), { addSuffix: true })}
							</div>
						</div>

						<div className="flex gap-1 mt-2">
							{thread.isPinned && (
								<Badge variant="secondary" className="text-xs">
									pinned
								</Badge>
							)}
							{thread.isLocked && (
								<Badge variant="destructive" className="text-xs">
									locked
								</Badge>
							)}
							{thread.viewCount > 5000 && (
								<Badge variant="outline" className="text-xs">
									hot
								</Badge>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	const renderPostFixture = (post: any) => (
		<Card
			key={post.id}
			className="cursor-pointer hover:shadow-md transition-shadow"
			onClick={() => setSelectedFixture(post)}
		>
			<CardContent className="p-4">
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Avatar className="w-6 h-6">
								<AvatarFallback className="text-xs">U</AvatarFallback>
							</Avatar>
							<span className="text-sm font-medium">User {post.userId}</span>
							{post.isFirstPost && (
								<Badge variant="outline" className="text-xs">
									OP
								</Badge>
							)}
						</div>
						<span className="text-xs text-muted-foreground">
							{formatDistanceToNow(new Date(post.createdAt || Date.now()), { addSuffix: true })}
						</span>
					</div>

					<p className="text-sm line-clamp-3">{post.content}</p>

					<div className="flex items-center gap-3 text-xs text-muted-foreground">
						<div className="flex items-center gap-1">
							<Heart className="w-3 h-3" />
							{post.likeCount || 0}
						</div>
						<span>Thread {post.threadId}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	const renderTransactionFixture = (transaction: any) => (
		<Card
			key={transaction.id}
			className="cursor-pointer hover:shadow-md transition-shadow"
			onClick={() => setSelectedFixture(transaction)}
		>
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center ${
								transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
							}`}
						>
							<Coins className="w-4 h-4" />
						</div>

						<div>
							<div className="font-medium">{transaction.type || 'Transfer'}</div>
							<div className="text-sm text-muted-foreground">
								User {transaction.userId || transaction.user_id}
							</div>
						</div>
					</div>

					<div className="text-right">
						<div
							className={`font-semibold ${
								transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
							}`}
						>
							{transaction.amount > 0 ? '+' : ''}
							{transaction.amount?.toLocaleString()} DGT
						</div>
						<div className="text-xs text-muted-foreground">
							{formatDistanceToNow(new Date(transaction.created_at || Date.now()), {
								addSuffix: true
							})}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	const renderFixture = (fixture: any) => {
		switch (type) {
			case 'user':
				return renderUserFixture(fixture);
			case 'thread':
				return renderThreadFixture(fixture);
			case 'post':
				return renderPostFixture(fixture);
			case 'transaction':
				return renderTransactionFixture(fixture);
			default:
				return (
					<Card key={fixture.id}>
						<CardContent className="p-4">
							<pre className="text-xs">{JSON.stringify(fixture, null, 2)}</pre>
						</CardContent>
					</Card>
				);
		}
	};

	if (fixtures.length === 0) {
		return (
			<Card>
				<CardContent className="p-8 text-center text-muted-foreground">
					No fixtures generated yet
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">
					{fixtures.length} {type} fixture{fixtures.length !== 1 ? 's' : ''}
				</h2>
				<div className="flex gap-2">
					<Button variant="outline" size="sm">
						Export All
					</Button>
					<Button variant="outline" size="sm">
						Clear
					</Button>
				</div>
			</div>

			{type === 'user' && Object.keys(groupedFixtures).length > 1 ? (
				<Tabs defaultValue="users">
					<TabsList>
						<TabsTrigger value="users">Users ({groupedFixtures.users?.length || 0})</TabsTrigger>
						<TabsTrigger value="moderators">
							Moderators ({groupedFixtures.moderators?.length || 0})
						</TabsTrigger>
						<TabsTrigger value="admins">Admins ({groupedFixtures.admins?.length || 0})</TabsTrigger>
					</TabsList>

					<TabsContent
						value="users"
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
					>
						{groupedFixtures.users?.map(renderFixture)}
					</TabsContent>
					<TabsContent
						value="moderators"
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
					>
						{groupedFixtures.moderators?.map(renderFixture)}
					</TabsContent>
					<TabsContent
						value="admins"
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
					>
						{groupedFixtures.admins?.map(renderFixture)}
					</TabsContent>
				</Tabs>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{fixtures.map(renderFixture)}
				</div>
			)}

			{selectedFixture && (
				<FixtureDetailModal
					fixture={selectedFixture}
					type={type}
					onClose={() => setSelectedFixture(null)}
				/>
			)}
		</div>
	);
}

function FixtureDetailModal({
	fixture,
	type,
	onClose
}: {
	fixture: any;
	type: string;
	onClose: () => void;
}) {
	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						{type.charAt(0).toUpperCase() + type.slice(1)} Details
						<Button variant="ghost" size="sm" onClick={onClose}>
							×
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<pre className="text-sm bg-muted p-4 rounded overflow-auto">
						{JSON.stringify(fixture, null, 2)}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
