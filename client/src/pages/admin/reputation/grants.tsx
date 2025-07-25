import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Search,
	ArrowUpDown,
	PlusCircle,
	MinusCircle,
	RotateCcw,
	History,
	UserRound,
	TrendingUp,
	TrendingDown,
	Bell,
	BellOff,
	Target,
	Crown,
	Shield,
	Star
} from 'lucide-react';
import { useToast } from '@app/hooks/use-toast';
import { Input } from '@app/components/ui/input';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@app/components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@app/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { Label } from '@app/components/ui/label';
import { Textarea } from '@app/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@app/components/ui/radio-group';
import { Checkbox } from '@app/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@app/components/ui/avatar';
import { useDebounce } from '@app/hooks/use-debounce';
import { apiRequest } from '@app/utils/queryClient';
import { calculateReputationTierImpact, getTierForReputation } from '@shared/economy/reputation-calculator';
import { REPUTATION_EASTER_EGGS } from '@app/config/easter-eggs.config';
import { ReputationObliterationEffect } from '@app/features/admin/effects/ReputationObliterationEffect';

// Types
interface User {
	id: string;
	username: string;
	avatarUrl: string | null;
	reputation: number;
	tier: {
		tier: number;
		name: string;
		color: string;
	};
	nextTierReputation: number;
	progressPercent: number;
}

interface ReputationAdjustment {
	id: string;
	userId: string;
	username: string;
	adjustmentType: 'add' | 'subtract' | 'set';
	amount: number;
	reason: string;
	oldReputation: number;
	newReputation: number;
	adminUsername: string;
	timestamp: string;
}

export default function ReputationGrantsAdminPage() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [searchTerm, setSearchTerm] = useState('');
	const debouncedSearchTerm = useDebounce(searchTerm, 300);
	const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
	const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
	const [adjustmentAmount, setAdjustmentAmount] = useState<number>(100);
	const [adjustmentReason, setAdjustmentReason] = useState<string>('');
	const [notifyUser, setNotifyUser] = useState<boolean>(false);
	const [showObliterationEffect, setShowObliterationEffect] = useState<boolean>(false);
	const [sortField, setSortField] = useState<'username' | 'tier' | 'reputation'>('reputation');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

	// Search users query
	const {
		data: users,
		isLoading,
		isError,
		error
	} = useQuery({
		queryKey: ['/api/admin/users/search', debouncedSearchTerm],
		queryFn: async () => {
			if (!debouncedSearchTerm || debouncedSearchTerm.length < 3) {
				return { users: [] };
			}
			const response = await fetch(`/api/admin/users/search?term=${debouncedSearchTerm}`);
			if (!response.ok) {
				throw new Error('Failed to search users');
			}
			return response.json();
		},
		enabled: debouncedSearchTerm.length >= 3
	});

	// Get Reputation adjustment logs for a user
	const fetchUserReputationAdjustmentLogs = async (userId: string) => {
		const response = await fetch(`/api/admin/reputation/adjustment-logs?userId=${userId}`);
		if (!response.ok) {
			throw new Error('Failed to fetch Reputation adjustment logs');
		}
		return response.json();
	};

	// Mutations
	const adjustReputationMutation = useMutation({
		mutationFn: async (data: {
			userId: string;
			amount: number;
			adjustmentType: 'add' | 'subtract' | 'set';
			reason: string;
			notify?: boolean;
		}) => {
			return apiRequest<{ user: User }>({ method: 'POST', url: '/api/admin/reputation/adjust', data });
		},
		onSuccess: (data: { user: User }) => {
			const tierImpact = calculateTierImpact();
			let description = `${data.user.username}'s Reputation has been updated`;

			if (tierImpact && tierImpact.tierChange > 0) {
				description += ` (${tierImpact.currentTier.name} → ${tierImpact.newTier.name})`;
			} else if (tierImpact && tierImpact.tierChange < 0) {
				description += ` (${tierImpact.currentTier.name} → ${tierImpact.newTier.name})`;
			}

			// Check for obliteration easter egg
			if (
				(REPUTATION_EASTER_EGGS.enableObliteration &&
					adjustmentType === 'subtract' &&
					adjustmentAmount >= Math.abs(REPUTATION_EASTER_EGGS.obliterationThreshold)) ||
				(adjustmentType === 'set' &&
					adjustmentAmount === 0 &&
					selectedUser &&
					selectedUser.reputation > 1000)
			) {
				setShowObliterationEffect(true);
				// Don't show normal toast for obliteration - the effect is the notification
			} else {
				toast({
					title: 'Reputation adjusted successfully',
					description,
					variant: 'default'
				});
			}

			setIsAdjustDialogOpen(false);
			// Update the local state with the new reputation
			if (users?.users) {
				const updatedUsers = users.users.map((user: User) =>
					user.id === data.user.id ? { ...user, reputation: data.user.reputation } : user
				);
				queryClient.setQueryData(['/api/admin/users/search', debouncedSearchTerm], {
					users: updatedUsers
				});
			}
			resetAdjustmentForm();
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: `Failed to adjust Reputation: ${error.message}`,
				variant: 'destructive'
			});
		}
	});

	// Handlers
	const handleSort = (field: 'username' | 'tier' | 'reputation') => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const handleAdjustReputation = (user: User) => {
		setSelectedUser(user);
		setIsAdjustDialogOpen(true);
	};

	const handleViewHistory = async (user: User) => {
		setSelectedUser(user);
		try {
			const logs = await fetchUserReputationAdjustmentLogs(user.id);
			// Store logs in state or via queryClient if needed
			queryClient.setQueryData(['/api/admin/reputation/adjustment-logs', user.id], logs);
			setIsHistoryDialogOpen(true);
		} catch (error) {
			toast({
				title: 'Error',
				description: `Failed to fetch adjustment history: ${(error as Error).message}`,
				variant: 'destructive'
			});
		}
	};

	const handleSubmitAdjustment = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedUser) return;

		adjustReputationMutation.mutate({
			userId: selectedUser.id,
			amount: adjustmentAmount,
			adjustmentType,
			reason: adjustmentReason,
			notify: notifyUser
		});
	};

	const resetAdjustmentForm = () => {
		setAdjustmentType('add');
		setAdjustmentAmount(100);
		setAdjustmentReason('');
		setNotifyUser(false);
		setSelectedUser(null);
	};

	// Sort users if available
	const sortedUsers = users?.users
		? [...users.users].sort((a, b) => {
				if (sortField === 'username') {
					return sortDirection === 'asc'
						? a.username.localeCompare(b.username)
						: b.username.localeCompare(a.username);
				} else if (sortField === 'tier') {
					return sortDirection === 'asc' ? a.tier.tier - b.tier.tier : b.tier.tier - a.tier.tier;
				} else {
					return sortDirection === 'asc' ? a.reputation - b.reputation : b.reputation - a.reputation;
				}
			})
		: [];

	// Calculate adjusted Reputation
	const calculateAdjustedReputation = () => {
		if (!selectedUser) return 0;

		switch (adjustmentType) {
			case 'add':
				return selectedUser.reputation + adjustmentAmount;
			case 'subtract':
				return Math.max(0, selectedUser.reputation - adjustmentAmount);
			case 'set':
				return Math.max(0, adjustmentAmount);
			default:
				return selectedUser.reputation;
		}
	};

	// Calculate tier impact
	const calculateTierImpact = () => {
		if (!selectedUser) return null;

		const currentReputation = selectedUser.reputation;
		const newReputation = calculateAdjustedReputation();

		return calculateReputationTierImpact(currentReputation, newReputation);
	};

	return (
		<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-bold tracking-tight">User Reputation Adjustment</h2>
			</div>

			<Tabs defaultValue="search" className="space-y-4">
				<TabsList>
					<TabsTrigger value="search">Search Users</TabsTrigger>
					<TabsTrigger value="recent">Recent Adjustments</TabsTrigger>
				</TabsList>

				<TabsContent value="search" className="space-y-4">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle>Search Users</CardTitle>
							<CardDescription>
								Search for users by username or ID to adjust their Reputation
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col space-y-4">
								<div className="relative">
									<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search by username or ID (min 3 characters)..."
										className="pl-8"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
								</div>

								{debouncedSearchTerm.length > 0 && debouncedSearchTerm.length < 3 && (
									<p className="text-sm text-muted-foreground">
										Enter at least 3 characters to search
									</p>
								)}

								{isLoading && (
									<div className="text-center py-4">
										<p className="text-muted-foreground">Searching...</p>
									</div>
								)}

								{isError && (
									<div className="text-center py-4">
										<p className="text-destructive">Error: {error.message}</p>
									</div>
								)}

								{!isLoading &&
									!isError &&
									users?.users &&
									users.users.length === 0 &&
									debouncedSearchTerm.length >= 3 && (
										<div className="text-center py-4">
											<p className="text-muted-foreground">No users found</p>
										</div>
									)}

								{users?.users && users.users.length > 0 && (
									<div className="rounded-md border">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>User</TableHead>
													<TableHead>
														<div
															className="flex items-center cursor-pointer"
															onClick={() => handleSort('tier')}
														>
															Tier
															<ArrowUpDown className="ml-2 h-4 w-4" />
														</div>
													</TableHead>
													<TableHead>
														<div
															className="flex items-center cursor-pointer"
															onClick={() => handleSort('reputation')}
														>
															Reputation
															<ArrowUpDown className="ml-2 h-4 w-4" />
														</div>
													</TableHead>
													<TableHead>Progress</TableHead>
													<TableHead className="text-right">Actions</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{sortedUsers.map((user) => (
													<TableRow key={user.id}>
														<TableCell>
															<div className="flex items-center gap-2">
																<Avatar className="h-8 w-8">
																	{user.avatarUrl ? (
																		<AvatarImage src={user.avatarUrl} alt={user.username} />
																	) : (
																		<AvatarFallback>
																			{user.username.substring(0, 2).toUpperCase()}
																		</AvatarFallback>
																	)}
																</Avatar>
																<div>
																	<p className="font-medium">{user.username}</p>
																	<p className="text-xs text-muted-foreground">ID: {user.id}</p>
																</div>
															</div>
														</TableCell>
														<TableCell>
															<Badge
																variant="outline"
																className="flex items-center gap-1"
																style={{ borderColor: user.tier.color, color: user.tier.color }}
															>
																<Crown className="h-3 w-3" />
																{user.tier.name}
															</Badge>
														</TableCell>
														<TableCell>{user.reputation.toLocaleString()}</TableCell>
														<TableCell>
															<div className="w-full bg-zinc-800 rounded-full h-2.5 mb-1">
																<div
																	className="h-2.5 rounded-full"
																	style={{
																		width: `${user.progressPercent}%`,
																		backgroundColor: user.tier.color
																	}}
																></div>
															</div>
															<div className="text-xs text-muted-foreground">
																{user.progressPercent}% to next tier
															</div>
														</TableCell>
														<TableCell className="text-right">
															<div className="flex justify-end gap-2">
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => handleViewHistory(user)}
																>
																	<History className="h-4 w-4 mr-1" />
																	History
																</Button>
																<Button
																	variant="default"
																	size="sm"
																	onClick={() => handleAdjustReputation(user)}
																>
																	<PlusCircle className="h-4 w-4 mr-1" />
																	Adjust Reputation
																</Button>
															</div>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="recent" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Recent Reputation Adjustments</CardTitle>
							<CardDescription>
								View the most recent Reputation adjustments made by administrators
							</CardDescription>
						</CardHeader>
						<CardContent>
							<RecentReputationAdjustmentsTable />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Reputation Adjustment Dialog */}
			<Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<form onSubmit={handleSubmitAdjustment}>
						<DialogHeader>
							<DialogTitle>Adjust User Reputation</DialogTitle>
							<DialogDescription>Modify the Reputation of {selectedUser?.username}</DialogDescription>
						</DialogHeader>

						<div className="grid gap-4 py-4">
							{selectedUser && (
								<div className="flex items-center gap-3">
									<Avatar className="h-10 w-10">
										{selectedUser.avatarUrl ? (
											<AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.username} />
										) : (
											<AvatarFallback>
												{selectedUser.username.substring(0, 2).toUpperCase()}
											</AvatarFallback>
										)}
									</Avatar>
									<div>
										<p className="font-medium">{selectedUser.username}</p>
										<p className="text-xs text-muted-foreground">
											Current Reputation: {selectedUser.reputation.toLocaleString()} |{' '}
											{selectedUser.tier.name}
										</p>
									</div>
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="adjustmentType">Adjustment Type</Label>
								<RadioGroup
									id="adjustmentType"
									value={adjustmentType}
									onValueChange={(value) => setAdjustmentType(value as 'add' | 'subtract' | 'set')}
									className="flex space-x-4"
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="add" id="add" />
										<Label htmlFor="add" className="flex items-center">
											<PlusCircle className="h-4 w-4 mr-1 text-emerald-500" />
											Add
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="subtract" id="subtract" />
										<Label htmlFor="subtract" className="flex items-center">
											<MinusCircle className="h-4 w-4 mr-1 text-red-500" />
											Subtract
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="set" id="set" />
										<Label htmlFor="set" className="flex items-center">
											<RotateCcw className="h-4 w-4 mr-1" />
											Set
										</Label>
									</div>
								</RadioGroup>
							</div>

							<div className="space-y-2">
								<Label htmlFor="amount">Reputation Amount</Label>
								<Input
									id="amount"
									type="number"
									min="0"
									max="1000000"
									value={adjustmentAmount}
									onChange={(e) => setAdjustmentAmount(parseInt(e.target.value))}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="reason">Reason for Adjustment</Label>
								<Textarea
									id="reason"
									value={adjustmentReason}
									onChange={(e) => setAdjustmentReason(e.target.value)}
									placeholder="Explain why this adjustment is being made"
									required
								/>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="notify"
									checked={notifyUser}
									onCheckedChange={(checked) => setNotifyUser(checked as boolean)}
								/>
								<Label htmlFor="notify" className="flex items-center text-sm">
									{notifyUser ? (
										<Bell className="h-4 w-4 mr-1" />
									) : (
										<BellOff className="h-4 w-4 mr-1" />
									)}
									Notify user of Reputation adjustment
								</Label>
							</div>

							{selectedUser &&
								(() => {
									const tierImpact = calculateTierImpact();
									if (!tierImpact) return null;

									return (
										<div className="rounded-md bg-muted p-4 space-y-4">
											<div className="flex items-center gap-2">
												<Target className="h-4 w-4" />
												<div className="text-sm font-medium">Tier Impact Preview</div>
											</div>

											{/* Reputation Summary */}
											<div className="grid grid-cols-3 gap-4 text-sm">
												<div>
													<div className="text-muted-foreground">Current Reputation</div>
													<div className="font-medium">
														{tierImpact.currentReputation.toLocaleString()}
													</div>
												</div>
												<div>
													<div className="text-muted-foreground">
														{adjustmentType === 'add'
															? 'Adding'
															: adjustmentType === 'subtract'
																? 'Subtracting'
																: 'Setting to'}
													</div>
													<div className="font-medium">{adjustmentAmount.toLocaleString()}</div>
												</div>
												<div>
													<div className="text-muted-foreground">New Reputation</div>
													<div className="font-medium">{tierImpact.newReputation.toLocaleString()}</div>
												</div>
											</div>

											{/* Tier Change */}
											<div className="border-t pt-3">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<div className="text-sm font-medium">Tier Impact:</div>
														{tierImpact.tierChange > 0 && (
															<Badge
																className="text-emerald-100"
																style={{
																	backgroundColor: tierImpact.newTier.color,
																	color: '#ffffff'
																}}
															>
																<TrendingUp className="h-3 w-3 mr-1" />+{tierImpact.tierChange} Tier
																{tierImpact.tierChange > 1 ? 's' : ''}
															</Badge>
														)}
														{tierImpact.tierChange < 0 && (
															<Badge className="bg-red-700 hover:bg-red-800 text-red-100">
																<TrendingDown className="h-3 w-3 mr-1" />
																{tierImpact.tierChange} Tier
																{Math.abs(tierImpact.tierChange) > 1 ? 's' : ''}
															</Badge>
														)}
														{tierImpact.tierChange === 0 && (
															<Badge variant="outline">No Tier Change</Badge>
														)}
													</div>
													<div className="text-sm text-muted-foreground">
														{tierImpact.currentTier.name} → {tierImpact.newTier.name}
													</div>
												</div>

												{tierImpact.newTier.tier > tierImpact.currentTier.tier && (
													<div className="mt-2 text-xs text-emerald-600">
														👑 User will advance {tierImpact.tierChange} tier
														{tierImpact.tierChange > 1 ? 's' : ''}!
													</div>
												)}

												{tierImpact.reputationToNextTier > 0 && (
													<div className="mt-2 text-xs text-muted-foreground">
														{tierImpact.reputationToNextTier.toLocaleString()} Reputation to next tier
													</div>
												)}
											</div>
										</div>
									);
								})()}
						</div>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={adjustReputationMutation.isPending || !adjustmentReason.trim()}
							>
								{adjustReputationMutation.isPending ? 'Applying...' : 'Apply Adjustment'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Reputation History Dialog */}
			<Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
				<DialogContent className="sm:max-w-[700px]">
					<DialogHeader>
						<DialogTitle>Reputation Adjustment History</DialogTitle>
						<DialogDescription>
							{selectedUser && `Reputation adjustments for ${selectedUser.username}`}
						</DialogDescription>
					</DialogHeader>

					<ReputationHistoryTable userId={selectedUser?.id} />

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Reputation Obliteration Easter Egg Effect */}
			<ReputationObliterationEffect
				isOpen={showObliterationEffect}
				username={selectedUser?.username || ''}
				onClose={() => setShowObliterationEffect(false)}
			/>
		</div>
	);
}

// Recent Reputation Adjustments Table Component
function RecentReputationAdjustmentsTable() {
	const {
		data: adjustments,
		isLoading,
		isError,
		error
	} = useQuery({
		queryKey: ['/api/admin/reputation/adjustment-logs'],
		queryFn: async () => {
			const response = await fetch('/api/admin/reputation/adjustment-logs');
			if (!response.ok) {
				throw new Error('Failed to fetch adjustment logs');
			}
			return response.json();
		}
	});

	if (isLoading) {
		return (
			<div className="text-center py-4">
				<p className="text-muted-foreground">Loading recent adjustments...</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="text-center py-4">
				<p className="text-destructive">Error loading adjustments: {error.message}</p>
			</div>
		);
	}

	if (!adjustments || adjustments.length === 0) {
		return (
			<div className="text-center py-4">
				<p className="text-muted-foreground">No recent Reputation adjustments found</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>User</TableHead>
						<TableHead>Adjustment</TableHead>
						<TableHead>Reason</TableHead>
						<TableHead>Admin</TableHead>
						<TableHead>Date</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{adjustments.map((adjustment: ReputationAdjustment) => (
						<TableRow key={adjustment.id}>
							<TableCell>
								<div className="flex items-center gap-2">
									<UserRound className="h-5 w-5 text-muted-foreground" />
									<span>{adjustment.username}</span>
								</div>
							</TableCell>
							<TableCell>
								<div className="flex flex-col">
									<Badge
										className={
											adjustment.adjustmentType === 'add'
												? 'bg-emerald-900 text-emerald-300'
												: adjustment.adjustmentType === 'subtract'
													? 'bg-red-900 text-red-300'
													: 'bg-blue-900 text-blue-300'
										}
									>
										{adjustment.adjustmentType === 'add'
											? `+${adjustment.amount}`
											: adjustment.adjustmentType === 'subtract'
												? `-${adjustment.amount}`
												: `Set to ${adjustment.amount}`}
									</Badge>
									<span className="text-xs text-muted-foreground mt-1">
										{adjustment.oldReputation.toLocaleString()} → {adjustment.newReputation.toLocaleString()}
									</span>
								</div>
							</TableCell>
							<TableCell className="max-w-xs truncate">{adjustment.reason}</TableCell>
							<TableCell>{adjustment.adminUsername}</TableCell>
							<TableCell>{new Date(adjustment.timestamp).toLocaleString()}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

// Reputation History Table Component
function ReputationHistoryTable({ userId }: { userId?: string }) {
	const {
		data: adjustments,
		isLoading,
		isError,
		error
	} = useQuery({
		queryKey: ['/api/admin/reputation/adjustment-logs', userId],
		queryFn: async () => {
			if (!userId) return [];
			const response = await fetch(`/api/admin/reputation/adjustment-logs?userId=${userId}`);
			if (!response.ok) {
				throw new Error('Failed to fetch adjustment logs');
			}
			return response.json();
		},
		enabled: !!userId
	});

	if (isLoading) {
		return (
			<div className="text-center py-4">
				<p className="text-muted-foreground">Loading adjustment history...</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="text-center py-4">
				<p className="text-destructive">Error loading history: {error.message}</p>
			</div>
		);
	}

	if (!adjustments || adjustments.length === 0) {
		return (
			<div className="text-center py-4">
				<p className="text-muted-foreground">No adjustment history found for this user</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border max-h-[400px] overflow-y-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Adjustment</TableHead>
						<TableHead>Reason</TableHead>
						<TableHead>Admin</TableHead>
						<TableHead>Date</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{adjustments.map((adjustment: ReputationAdjustment) => (
						<TableRow key={adjustment.id}>
							<TableCell>
								<div className="flex flex-col">
									<Badge
										className={
											adjustment.adjustmentType === 'add'
												? 'bg-emerald-900 text-emerald-300'
												: adjustment.adjustmentType === 'subtract'
													? 'bg-red-900 text-red-300'
													: 'bg-blue-900 text-blue-300'
										}
									>
										{adjustment.adjustmentType === 'add'
											? `+${adjustment.amount}`
											: adjustment.adjustmentType === 'subtract'
												? `-${adjustment.amount}`
												: `Set to ${adjustment.amount}`}
									</Badge>
									<span className="text-xs text-muted-foreground mt-1">
										{adjustment.oldReputation.toLocaleString()} → {adjustment.newReputation.toLocaleString()}
									</span>
								</div>
							</TableCell>
							<TableCell>{adjustment.reason}</TableCell>
							<TableCell>{adjustment.adminUsername}</TableCell>
							<TableCell>{new Date(adjustment.timestamp).toLocaleString()}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
