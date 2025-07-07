import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Minus, Search, RefreshCw, History, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { XPProgressBar } from '@/components/economy/xp/XPProgressBar';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import type { UserId } from '@shared/types/ids';

// Form schema for user search
const searchFormSchema = z.object({
	searchTerm: z.string().min(3, 'Search term must be at least 3 characters')
});

// Form schema for XP adjustment
const adjustmentFormSchema = z.object({
	userId: z.custom<UserId>().refine(val => Number(val) > 0, 'Invalid user'),
	amount: z.coerce.number().int('Must be a whole number'),
	adjustmentType: z.enum(['add', 'subtract', 'set']),
	reason: z.string().min(3, 'Please provide a reason for this adjustment')
});

// User type definition
type User = {
	id: UserId;
	username: string;
	avatarUrl?: string;
	level: number;
	xp: number;
	nextLevelXp: number | null;
	progressPercent: number;
};

// XP Adjustment log entry type
type XpAdjustmentLog = {
	id: string;
	userId: UserId;
	username: string;
	adjustmentType: 'add' | 'subtract' | 'set';
	amount: number;
	reason: string;
	adminUsername: string;
	timestamp: string;
};

export default function UserXPAdjustmentPage() {
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const { toast } = useToast();

	// Form for user search
	const searchForm = useForm<z.infer<typeof searchFormSchema>>({
		resolver: zodResolver(searchFormSchema),
		defaultValues: {
			searchTerm: ''
		}
	});

	// Form for XP adjustment
	const adjustmentForm = useForm<z.infer<typeof adjustmentFormSchema>>({
		resolver: zodResolver(adjustmentFormSchema),
		defaultValues: {
			userId: 0,
			amount: 0,
			adjustmentType: 'add',
			reason: ''
		}
	});

	// Update adjustment form when user is selected
	useState(() => {
		if (selectedUser) {
			adjustmentForm.setValue('userId', selectedUser.id);
		}
	}, [selectedUser]);

	// Search query
	const [searchTerm, setSearchTerm] = useState('');

	// Query to search for users
	const {
		data: searchResults,
		isLoading: isSearching,
		refetch: refetchSearch,
		error: searchError
	} = useQuery<User[]>({
		queryKey: ['admin-user-search', searchTerm],
		queryFn: async () => {
			if (!searchTerm || searchTerm.length < 3) return [];

			const response = await fetch(
				`/api/admin/users/search?term=${encodeURIComponent(searchTerm)}`
			);
			if (!response.ok) {
				throw new Error('Failed to search users');
			}
			return response.json();
		},
		enabled: searchTerm.length >= 3
	});

	// Query to fetch recent XP adjustments
	const {
		data: recentAdjustments,
		isLoading: isLoadingAdjustments,
		refetch: refetchAdjustments
	} = useQuery<XpAdjustmentLog[]>({
		queryKey: ['admin-xp-adjustment-logs'],
		queryFn: async () => {
			const response = await fetch('/api/admin/xp/adjustment-logs');
			if (!response.ok) {
				throw new Error('Failed to fetch XP adjustment logs');
			}
			return response.json();
		}
	});

	// Mutation to adjust user XP
	const adjustXpMutation = useMutation({
		mutationFn: async (values: z.infer<typeof adjustmentFormSchema>) => {
			const response = await fetch('/api/admin/xp/adjust', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(values)
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to adjust XP');
			}

			return response.json();
		},
		onSuccess: () => {
			// Refresh the user data and adjustment logs
			if (selectedUser) {
				refetchUserInfo(selectedUser.id);
			}
			refetchAdjustments();

			toast({
				title: 'XP Adjusted',
				description: "The user's XP has been successfully adjusted."
			});

			// Reset the form
			adjustmentForm.reset({
				userId: selectedUser?.id || 0,
				amount: 0,
				adjustmentType: 'add',
				reason: ''
			});
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to adjust XP',
				variant: 'destructive'
			});
		}
	});

	// Function to fetch user info when selected
	const refetchUserInfo = async (userId: UserId) => {
		try {
			const response = await fetch(`/api/admin/users/${userId}/xp`);
			if (!response.ok) {
				throw new Error('Failed to fetch user XP info');
			}

			const userData = await response.json();
			setSelectedUser({
				id: userId,
				username: userData.username,
				avatarUrl: userData.avatarUrl,
				level: userData.level,
				xp: userData.xp,
				nextLevelXp: userData.nextLevelXp,
				progressPercent: userData.progressPercent
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to fetch user information',
				variant: 'destructive'
			});
		}
	};

	// Handle user search form submission
	const onSearchSubmit = (data: z.infer<typeof searchFormSchema>) => {
		setSearchTerm(data.searchTerm);
	};

	// Handle user selection from search results
	const selectUser = (user: User) => {
		setSelectedUser(user);
		adjustmentForm.setValue('userId', user.id);
	};

	// Handle XP adjustment form submission
	const onAdjustmentSubmit = (data: z.infer<typeof adjustmentFormSchema>) => {
		adjustXpMutation.mutate(data);
	};

	return (
		<AdminPageShell title="User XP Adjustment">
			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* User Search */}
					<Card className="md:col-span-1">
						<CardHeader>
							<CardTitle className="flex items-center">
								<Search className="h-5 w-5 mr-2" />
								Find User
							</CardTitle>
							<CardDescription>Search for a user by username or ID</CardDescription>
						</CardHeader>
						<CardContent>
							<Form {...searchForm}>
								<form onSubmit={searchForm.handleSubmit(onSearchSubmit)} className="space-y-4">
									<FormField
										control={searchForm.control}
										name="searchTerm"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<div className="flex space-x-2">
														<Input placeholder="Username or ID" {...field} />
														<Button type="submit" disabled={isSearching}>
															{isSearching ? (
																<Loader2 className="h-4 w-4 animate-spin" />
															) : (
																'Search'
															)}
														</Button>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</form>
							</Form>

							{/* Search Results */}
							<div className="mt-4 max-h-[200px] overflow-y-auto">
								{isSearching ? (
									<div className="flex justify-center py-4">
										<Loader2 className="h-6 w-6 animate-spin text-primary" />
									</div>
								) : searchError ? (
									<div className="text-center text-destructive py-4">
										<p>Error searching users</p>
										<Button
											variant="outline"
											size="sm"
											className="mt-2"
											onClick={() => refetchSearch()}
										>
											<RefreshCw className="h-4 w-4 mr-1" /> Retry
										</Button>
									</div>
								) : searchResults && searchResults.length > 0 ? (
									<div className="space-y-2">
										{searchResults.map((user) => (
											<div
												key={user.id}
												className={`
                          flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors
                          ${selectedUser?.id === user.id ? 'bg-primary/10 border border-primary/50' : 'hover:bg-muted'}
                        `}
												onClick={() => selectUser(user)}
											>
												<div className="flex items-center gap-2">
													<div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
														{user.avatarUrl ? (
															<img
																src={user.avatarUrl}
																alt={user.username}
																className="h-full w-full object-cover"
															/>
														) : (
															<User className="h-4 w-4" />
														)}
													</div>
													<div>
														<p className="text-sm font-medium">{user.username}</p>
														<div className="flex items-center text-xs text-muted-foreground gap-1">
															<span>ID: {user.id}</span>
															<span>•</span>
															<span>Level {user.level}</span>
														</div>
													</div>
												</div>
												<Button variant="ghost" size="icon" onClick={() => selectUser(user)}>
													<Plus className="h-4 w-4" />
												</Button>
											</div>
										))}
									</div>
								) : searchTerm.length >= 3 ? (
									<div className="text-center text-muted-foreground py-4">No users found</div>
								) : null}
							</div>
						</CardContent>
					</Card>

					{/* XP Adjustment Form */}
					<Card className="md:col-span-2">
						<CardHeader>
							<CardTitle className="flex items-center">
								<Plus className="h-5 w-5 mr-2" />
								Adjust XP
							</CardTitle>
							<CardDescription>Add, subtract or set a specific XP amount</CardDescription>
						</CardHeader>
						<CardContent>
							{selectedUser ? (
								<div className="space-y-6">
									{/* User Info */}
									<div className="bg-muted/50 rounded-lg p-4">
										<div className="flex items-center gap-4 mb-4">
											<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
												{selectedUser.avatarUrl ? (
													<img
														src={selectedUser.avatarUrl}
														alt={selectedUser.username}
														className="h-full w-full object-cover"
													/>
												) : (
													<User className="h-6 w-6" />
												)}
											</div>
											<div>
												<h3 className="text-lg font-bold">{selectedUser.username}</h3>
												<p className="text-sm text-muted-foreground">ID: {selectedUser.id}</p>
											</div>
										</div>

										<XPProgressBar
											level={selectedUser.level}
											currentXP={selectedUser.xp}
											nextLevelXP={selectedUser.nextLevelXp}
											progressPercent={selectedUser.progressPercent}
										/>
									</div>

									{/* Adjustment Form */}
									<Form {...adjustmentForm}>
										<form
											onSubmit={adjustmentForm.handleSubmit(onAdjustmentSubmit)}
											className="space-y-4"
										>
											<FormField
												control={adjustmentForm.control}
												name="adjustmentType"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Adjustment Type</FormLabel>
														<Select onValueChange={field.onChange} defaultValue={field.value}>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="Select adjustment type" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																<SelectItem value="add">Add XP</SelectItem>
																<SelectItem value="subtract">Subtract XP</SelectItem>
																<SelectItem value="set">Set to specific amount</SelectItem>
															</SelectContent>
														</Select>
														<FormDescription>
															{field.value === 'add' && "Add XP to the user's current total"}
															{field.value === 'subtract' &&
																"Subtract XP from the user's current total"}
															{field.value === 'set' && "Set the user's XP to a specific amount"}
														</FormDescription>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={adjustmentForm.control}
												name="amount"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Amount</FormLabel>
														<FormControl>
															<Input type="number" {...field} />
														</FormControl>
														<FormDescription>
															{adjustmentForm.watch('adjustmentType') === 'add' &&
																'Amount of XP to add'}
															{adjustmentForm.watch('adjustmentType') === 'subtract' &&
																'Amount of XP to subtract'}
															{adjustmentForm.watch('adjustmentType') === 'set' && 'New XP amount'}
														</FormDescription>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={adjustmentForm.control}
												name="reason"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Reason</FormLabel>
														<FormControl>
															<Textarea
																placeholder="Provide a reason for this adjustment"
																{...field}
															/>
														</FormControl>
														<FormDescription>
															This will be recorded in the adjustment logs
														</FormDescription>
														<FormMessage />
													</FormItem>
												)}
											/>

											<Button
												type="submit"
												className="w-full"
												disabled={adjustXpMutation.isPending}
											>
												{adjustXpMutation.isPending ? (
													<>
														<Loader2 className="h-4 w-4 mr-2 animate-spin" />
														Processing...
													</>
												) : (
													'Apply Adjustment'
												)}
											</Button>
										</form>
									</Form>
								</div>
							) : (
								<div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
									<User className="h-8 w-8 mb-2 opacity-50" />
									<p>Select a user to adjust their XP</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Recent Adjustments */}
				<Card className="mt-6">
					<CardHeader>
						<CardTitle className="flex items-center">
							<History className="h-5 w-5 mr-2" />
							Recent XP Adjustments
						</CardTitle>
						<CardDescription>
							History of recent XP adjustments made by administrators
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoadingAdjustments ? (
							<div className="flex justify-center py-8">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</div>
						) : recentAdjustments && recentAdjustments.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>User</TableHead>
										<TableHead>Adjustment</TableHead>
										<TableHead>Reason</TableHead>
										<TableHead>Admin</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{recentAdjustments.map((log) => (
										<TableRow key={log.id}>
											<TableCell className="text-xs">
												{new Date(log.timestamp).toLocaleString()}
											</TableCell>
											<TableCell>
												<div className="font-medium">{log.username}</div>
												<div className="text-xs text-muted-foreground">ID: {log.userId}</div>
											</TableCell>
											<TableCell>
												<Badge
													className={
														log.adjustmentType === 'add'
															? 'bg-emerald-600'
															: log.adjustmentType === 'subtract'
																? 'bg-red-600'
																: 'bg-blue-600'
													}
												>
													{log.adjustmentType === 'add' && '+'}
													{log.adjustmentType === 'subtract' && '-'}
													{log.adjustmentType === 'set' && '='} {log.amount.toLocaleString()} XP
												</Badge>
											</TableCell>
											<TableCell className="max-w-[200px] truncate" title={log.reason}>
												{log.reason}
											</TableCell>
											<TableCell>{log.adminUsername}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<div className="text-center py-8 text-muted-foreground">No recent XP adjustments</div>
						)}
					</CardContent>
					<CardFooter className="flex justify-end border-t pt-4">
						<Button variant="outline" size="sm" onClick={() => refetchAdjustments()}>
							<RefreshCw className="h-4 w-4 mr-2" />
							Refresh
						</Button>
					</CardFooter>
				</Card>
			</div>
		</AdminPageShell>
	);
}
