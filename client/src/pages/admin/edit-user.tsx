import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Separator } from '@/components/ui/separator'; // Unused
import { ROUTES } from '@/config/admin-routes';

// User edit form validation schema
const userEditSchema = z.object({
	username: z
		.string()
		.min(3, 'Username must be at least 3 characters')
		.max(30, 'Username must be 30 characters or less'),
	email: z.string().email('Please enter a valid email address'),
	bio: z.string().max(1000, 'Bio must be 1000 characters or less').nullable().optional(),
	avatarUrl: z.string().url('Please enter a valid URL').nullable().optional(),
	profileBannerUrl: z.string().url('Please enter a valid URL').nullable().optional(),
	groupId: z.number().nullable().optional(),
	isActive: z.boolean().default(true),
	isVerified: z.boolean().default(false),
	isBanned: z.boolean().default(false),
	pluginData: z.string().optional()
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

// Define a more specific type for the user object in API responses
interface UserApiResponse {
	id: string;
	username: string;
	email: string;
	bio?: string | null;
	avatarUrl?: string | null;
	profileBannerUrl?: string | null;
	groupId?: number | null;
	isActive: boolean;
	isVerified: boolean;
	isBanned: boolean;
	pluginData?: Record<string, unknown> | null;
	createdAt: string;
	// Add other fields if known
}

interface UpdateUserResponse {
	user: UserApiResponse;
	// Potentially other fields in the response
}

export default function AdminUserEdit() {
	const params = useParams<{ id: string }>();
	// const [_, navigate] = useLocation(); // navigate was unused
	useLocation(); // Call useLocation if it has side effects or is needed by other hooks
	const { toast } = useToast();
	const [tab, setTab] = useState('basic');

	// Fetch the user data
	const { data, isLoading, error } = useQuery({
		queryKey: [`/api/admin/users/${params.id}`],
		queryFn: async () => {
			const res = await fetch(`/api/admin/users/${params.id}`);
			if (!res.ok) {
				throw new Error('Failed to fetch user');
			}
			return res.json();
		}
	});

	// Set up form
	const form = useForm<UserEditFormValues>({
		resolver: zodResolver(userEditSchema),
		defaultValues: {
			username: '',
			email: '',
			bio: '',
			avatarUrl: '',
			profileBannerUrl: '',
			groupId: null,
			isActive: true,
			isVerified: false,
			isBanned: false,
			pluginData: '{}'
		}
	});

	// Update form when data is loaded
	useEffect(() => {
		if (data?.user) {
			const { user } = data;
			form.reset({
				username: user.username,
				email: user.email,
				bio: user.bio || '',
				avatarUrl: user.avatarUrl || '',
				profileBannerUrl: user.profileBannerUrl || '',
				groupId: user.groupId ?? null, // groupId is now number | null
				isActive: user.isActive,
				isVerified: user.isVerified,
				isBanned: user.isBanned,
				pluginData: user.pluginData ? JSON.stringify(user.pluginData, null, 2) : '{}'
			});
		}
	}, [data, form]);

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: async (formData: UserEditFormValues) => {
			// Parse pluginData JSON if provided
			let parsedPluginData = {};
			if (formData.pluginData) {
				try {
					parsedPluginData = JSON.parse(formData.pluginData);
				} catch (e) {
					throw new Error('Invalid JSON in Plugin Data field');
				}
			}

			const updatedData = {
				...formData,
				pluginData: parsedPluginData
			};

			// Assuming apiRequest returns the parsed JSON response directly or throws on error
			return apiRequest<UpdateUserResponse>({
				method: 'PUT',
				url: `/api/admin/users/${params.id}`,
				data: updatedData
			});
		},
		onSuccess: () => {
			toast({
				title: 'User updated',
				description: 'User profile has been updated successfully'
			});
			queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${params.id}`] });
			queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
		},
		onError: (error: Error) => {
			toast({
				title: 'Update failed',
				description: error.message,
				variant: 'destructive'
			});
		}
	});

	// Form submission handler
	function onSubmit(formData: UserEditFormValues) {
		updateMutation.mutate(formData);
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
		);
	}

	if (error || !data) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
					<h1 className="text-2xl font-bold mb-4">Error loading user</h1>
					<p className="text-destructive mb-4">
						{error instanceof Error ? error.message : 'Unknown error'}
					</p>
					<Button asChild>
						<Link href={ROUTES.ADMIN_USERS}>Back to Users</Link>
					</Button>
				</div>
		);
	}

	return (
		<div className="container py-6">
				<div className="flex justify-between items-center mb-6">
					<div className="flex items-center gap-2">
						<Button variant="outline" size="icon" asChild>
							<Link href={ROUTES.ADMIN_USERS}>
								<ArrowLeft className="h-4 w-4" />
							</Link>
						</Button>
						<h1 className="text-2xl font-bold">Edit User: {data.user.username}</h1>
					</div>
					<Button
						onClick={form.handleSubmit(onSubmit)}
						disabled={updateMutation.isPending}
						className="gap-1"
					>
						{updateMutation.isPending ? (
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
						) : (
							<Save className="h-4 w-4 mr-2" />
						)}
						Save Changes
					</Button>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<Tabs value={tab} onValueChange={setTab}>
							<TabsList className="grid grid-cols-4 w-full md:w-auto">
								<TabsTrigger value="basic">Basic Info</TabsTrigger>
								<TabsTrigger value="profile">Profile</TabsTrigger>
								<TabsTrigger value="settings">Settings</TabsTrigger>
								<TabsTrigger value="advanced">Advanced</TabsTrigger>
							</TabsList>

							{/* Basic Info Tab */}
							<TabsContent value="basic">
								<Card>
									<CardHeader>
										<CardTitle>Basic Information</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<FormField
											control={form.control}
											name="username"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Username</FormLabel>
													<FormControl>
														<Input placeholder="username" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Email</FormLabel>
													<FormControl>
														<Input placeholder="email@example.com" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="groupId"
											render={({ field }) => (
												<FormItem>
													<FormLabel>User Group</FormLabel>
													<Select
														onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
														defaultValue={field.value ? String(field.value) : ''}
														value={field.value ? String(field.value) : ''}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select a group" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="">None</SelectItem>
															{data.allGroups?.map((group: { id: number; name: string }) => (
																<SelectItem key={group.id} value={String(group.id)}>
																	{group.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<FormDescription>
														The user group determines permissions and appearance
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>
							</TabsContent>

							{/* Profile Tab */}
							<TabsContent value="profile">
								<Card>
									<CardHeader>
										<CardTitle>Profile Information</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<FormField
											control={form.control}
											name="bio"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Bio</FormLabel>
													<FormControl>
														<Textarea
															placeholder="Write something about the user..."
															className="min-h-[120px] resize-y"
															{...field}
															value={field.value || ''}
														/>
													</FormControl>
													<FormDescription>Maximum 1000 characters</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FormField
												control={form.control}
												name="avatarUrl"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Avatar URL</FormLabel>
														<FormControl>
															<Input
																placeholder="https://example.com/avatar.jpg"
																{...field}
																value={field.value || ''}
															/>
														</FormControl>
														<FormMessage />
														{field.value && (
															<div className="mt-2">
																<img
																	src={field.value}
																	alt="Avatar Preview"
																	className="w-16 h-16 rounded-full object-cover border"
																	onError={(e) => {
																		(e.target as HTMLImageElement).src =
																			'https://via.placeholder.com/128?text=Invalid+URL';
																	}}
																/>
															</div>
														)}
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="profileBannerUrl"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Profile Banner URL</FormLabel>
														<FormControl>
															<Input
																placeholder="https://example.com/banner.jpg"
																{...field}
																value={field.value || ''}
															/>
														</FormControl>
														<FormMessage />
														{field.value && (
															<div className="mt-2">
																<img
																	src={field.value}
																	alt="Banner Preview"
																	className="w-full h-16 object-cover rounded border"
																	onError={(e) => {
																		(e.target as HTMLImageElement).src =
																			'https://via.placeholder.com/800x200?text=Invalid+URL';
																	}}
																/>
															</div>
														)}
													</FormItem>
												)}
											/>
										</div>
									</CardContent>
								</Card>
							</TabsContent>

							{/* Settings Tab */}
							<TabsContent value="settings">
								<Card>
									<CardHeader>
										<CardTitle>User Settings</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<FormField
												control={form.control}
												name="isActive"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
														<div className="space-y-0.5">
															<FormLabel className="text-base">Active Status</FormLabel>
															<FormDescription>
																Inactive users cannot log in but their content remains visible
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
																aria-readonly
															/>
														</FormControl>
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="isVerified"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
														<div className="space-y-0.5">
															<FormLabel className="text-base">Verified Status</FormLabel>
															<FormDescription>
																Verified users receive a badge next to their name
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
																aria-readonly
															/>
														</FormControl>
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="isBanned"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-destructive/20">
														<div className="space-y-0.5">
															<FormLabel className="text-base">Ban Status</FormLabel>
															<FormDescription>
																Banned users cannot log in or perform any actions
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
																aria-readonly
															/>
														</FormControl>
													</FormItem>
												)}
											/>
										</div>
									</CardContent>
								</Card>
							</TabsContent>

							{/* Advanced Tab */}
							<TabsContent value="advanced">
								<Card>
									<CardHeader>
										<CardTitle>Advanced Settings</CardTitle>
									</CardHeader>
									<CardContent>
										<FormField
											control={form.control}
											name="pluginData"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Plugin Data (JSON)</FormLabel>
													<FormControl>
														<Textarea
															placeholder="{}"
															className="font-mono h-[200px] resize-y"
															{...field}
															value={field.value || '{}'}
														/>
													</FormControl>
													<FormDescription>
														Advanced settings for plugins. Must be valid JSON.
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									</CardContent>
									<CardFooter className="flex justify-between border-t p-4">
										<div className="text-sm text-muted-foreground">
											User ID: {data.user.id} • Created:{' '}
											{new Date(data.user.createdAt).toLocaleDateString()}
										</div>
									</CardFooter>
								</Card>
							</TabsContent>
						</Tabs>
					</form>
				</Form>
			</div>
	);
}
