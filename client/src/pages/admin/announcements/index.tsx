import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import {
	AlertCircle,
	TrendingUp,
	Flame,
	Award,
	Megaphone,
	Bell,
	Star,
	Zap,
	BarChart3,
	Plus,
	Pencil,
	Trash2,
	CheckCircle,
	XCircle,
	Calendar,
	Eye,
	EyeOff,
	Link2,
	Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';

// Define the Announcement type
interface Announcement {
	id: number;
	content: string;
	icon?: string;
	type: string;
	isActive: boolean;
	expiresAt?: string | null;
	priority: number;
	visibleTo: string[];
	tickerMode: boolean;
	link?: string | null;
	bgColor?: string | null;
	textColor?: string | null;
	createdAt: string;
	updatedAt?: string; // Assuming there might be an updatedAt field
}

// Create a schema for announcement form
const announcementFormSchema = z.object({
	content: z.string().min(1, 'Content is required'),
	icon: z.string().optional(),
	type: z.string().default('info'),
	isActive: z.boolean().default(true),
	expiresAt: z.date().optional().nullable(),
	priority: z.number().default(0),
	visibleTo: z.array(z.string()).default(['all']),
	tickerMode: z.boolean().default(true),
	link: z.string().optional().nullable(),
	bgColor: z.string().optional().nullable(),
	textColor: z.string().optional().nullable()
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

// Icons for announcements
const iconOptions = [
	{ value: 'megaphone', label: 'Megaphone', icon: <Megaphone className="w-4 h-4" /> },
	{ value: 'alert', label: 'Alert', icon: <AlertCircle className="w-4 h-4" /> },
	{ value: 'bell', label: 'Bell', icon: <Bell className="w-4 h-4" /> },
	{ value: 'trending', label: 'Trending', icon: <TrendingUp className="w-4 h-4" /> },
	{ value: 'flame', label: 'Flame', icon: <Flame className="w-4 h-4" /> },
	{ value: 'award', label: 'Award', icon: <Award className="w-4 h-4" /> },
	{ value: 'star', label: 'Star', icon: <Star className="w-4 h-4" /> },
	{ value: 'zap', label: 'Zap', icon: <Zap className="w-4 h-4" /> },
	{ value: 'chart', label: 'Chart', icon: <BarChart3 className="w-4 h-4" /> },
	{ value: 'info', label: 'Info', icon: <Info className="w-4 h-4" /> }
];

// Announcement types
const typeOptions = [
	{ value: 'info', label: 'Information', color: 'bg-emerald-500' },
	{ value: 'alert', label: 'Alert', color: 'bg-red-500' },
	{ value: 'update', label: 'Update', color: 'bg-cyan-500' },
	{ value: 'hot', label: 'Hot', color: 'bg-orange-500' },
	{ value: 'achievement', label: 'Achievement', color: 'bg-yellow-500' },
	{ value: 'event', label: 'Event', color: 'bg-purple-500' }
];

// Visibility options
const visibilityOptions = [
	{ value: 'all', label: 'Everyone' },
	{ value: 'user', label: 'Registered Users' },
	{ value: 'mod', label: 'Moderators' },
	{ value: 'admin', label: 'Administrators' },
	{ value: 'guest', label: 'Guests (Not Logged In)' }
];

// Format date for display
const formatDate = (dateString: string) => {
	try {
		return format(parseISO(dateString), 'PPP');
	} catch (e) {
		return 'Invalid date';
	}
};

export default function AnnouncementsPage() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
	const [activeTab, setActiveTab] = useState('all');

	// Create form for new announcements
	const form = useForm<AnnouncementFormValues>({
		resolver: zodResolver(announcementFormSchema),
		defaultValues: {
			content: '',
			icon: 'megaphone',
			type: 'info',
			isActive: true,
			expiresAt: null,
			priority: 0,
			visibleTo: ['all'],
			tickerMode: true,
			link: null,
			bgColor: null,
			textColor: null
		}
	});

	// Edit form for existing announcements
	const editForm = useForm<AnnouncementFormValues>({
		resolver: zodResolver(announcementFormSchema),
		defaultValues: {
			content: '',
			icon: 'megaphone',
			type: 'info',
			isActive: true,
			expiresAt: null,
			priority: 0,
			visibleTo: ['all'],
			tickerMode: true,
			link: null,
			bgColor: null,
			textColor: null
		}
	});

	// Fetch announcements
	const { data: announcements = [], isLoading } = useQuery({
		queryKey: ['/api/admin/announcements'],
		queryFn: async () => {
			const data = await apiRequest<Announcement[]>({
				url: '/api/admin/announcements',
				method: 'GET'
			});
			return data;
		}
	});

	// Filter announcements based on active tab
	const filteredAnnouncements = announcements.filter((announcement) => {
		if (activeTab === 'all') return true;
		if (activeTab === 'active') return announcement.isActive;
		if (activeTab === 'inactive') return !announcement.isActive;
		return true;
	});

	// Create mutation
	const createMutation = useMutation({
		mutationFn: async (values: AnnouncementFormValues) => {
			return await apiRequest({
				url: '/api/admin/announcements',
				method: 'POST',
				data: values
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
			queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
			toast({
				title: 'Announcement created',
				description: 'Your announcement has been published.'
			});
			setIsCreateDialogOpen(false);
			form.reset();
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to create announcement',
				variant: 'destructive'
			});
		}
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: async ({ id, values }: { id: number; values: AnnouncementFormValues }) => {
			return await apiRequest({
				url: `/api/admin/announcements/${id}`,
				method: 'PUT',
				data: values
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
			queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
			toast({
				title: 'Announcement updated',
				description: 'Your announcement has been updated.'
			});
			setIsEditDialogOpen(false);
			editForm.reset();
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to update announcement',
				variant: 'destructive'
			});
		}
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			return await apiRequest({
				url: `/api/admin/announcements/${id}`,
				method: 'DELETE'
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
			queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
			toast({
				title: 'Announcement deleted',
				description: 'Your announcement has been deleted.'
			});
			setIsDeleteDialogOpen(false);
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to delete announcement',
				variant: 'destructive'
			});
		}
	});

	// Handle create form submission
	const onCreateSubmit = (values: AnnouncementFormValues) => {
		createMutation.mutate(values);
	};

	// Handle edit form submission
	const onEditSubmit = (values: AnnouncementFormValues) => {
		if (selectedAnnouncement) {
			updateMutation.mutate({ id: selectedAnnouncement.id, values });
		}
	};

	// Open edit dialog and populate form
	const handleEditClick = (announcement: Announcement) => {
		setSelectedAnnouncement(announcement);
		editForm.reset({
			content: announcement.content,
			icon: announcement.icon || 'megaphone',
			type: announcement.type || 'info',
			isActive: announcement.isActive,
			expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt) : null,
			priority: announcement.priority || 0,
			visibleTo: announcement.visibleTo || ['all'],
			tickerMode: announcement.tickerMode !== undefined ? announcement.tickerMode : true,
			link: announcement.link || null,
			bgColor: announcement.bgColor || null,
			textColor: announcement.textColor || null
		});
		setIsEditDialogOpen(true);
	};

	// Open delete dialog
	const handleDeleteClick = (announcement: Announcement) => {
		setSelectedAnnouncement(announcement);
		setIsDeleteDialogOpen(true);
	};

	// Toggle announcement active status
	const toggleActive = (announcement: Announcement) => {
		const valuesForUpdate: AnnouncementFormValues = {
			content: announcement.content,
			icon: announcement.icon,
			type: announcement.type,
			isActive: !announcement.isActive, // The toggled value
			expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt) : null,
			priority: announcement.priority,
			visibleTo: announcement.visibleTo,
			tickerMode: announcement.tickerMode,
			link: announcement.link,
			bgColor: announcement.bgColor,
			textColor: announcement.textColor
		};
		updateMutation.mutate({
			id: announcement.id,
			values: valuesForUpdate
		});
	};

	// Function to get icon component by name
	const getIconByName = (name?: string) => {
		const icon = iconOptions.find((i) => i.value === name);
		return icon ? icon.icon : <Megaphone className="w-4 h-4" />;
	};

	// Get type badge color
	const getTypeColor = (type: string) => {
		const typeOption = typeOptions.find((t) => t.value === type);
		return typeOption?.color || 'bg-emerald-500';
	};

	const pageActions = (
		<Button
			onClick={() => {
				setIsCreateDialogOpen(true);
			}}
		>
			<Plus className="h-4 w-4 mr-2" /> Create Announcement
		</Button>
	);

	return (
		<AdminPageShell title="Announcements" pageActions={pageActions}>
			<div className="space-y-6">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-2xl font-bold mb-2">Announcements</h1>
						<p className="text-muted-foreground">
							Create and manage platform-wide announcements for your users.
						</p>
					</div>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
					<TabsList>
						<TabsTrigger value="all">All</TabsTrigger>
						<TabsTrigger value="active">Active</TabsTrigger>
						<TabsTrigger value="inactive">Inactive</TabsTrigger>
					</TabsList>
				</Tabs>

				{isLoading ? (
					<div className="flex justify-center items-center h-64">
						<div className="text-muted-foreground">Loading announcements...</div>
					</div>
				) : filteredAnnouncements.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-64 border rounded-lg">
						<Megaphone className="w-12 h-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium">No announcements found</h3>
						<p className="text-muted-foreground mt-1">
							Create your first announcement to start communicating with your users.
						</p>
						<Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
							Create Announcement
						</Button>
					</div>
				) : (
					<Card>
						<CardHeader>
							<CardTitle>Announcement Management</CardTitle>
							<CardDescription>
								Manage your platform announcements. {filteredAnnouncements.length} announcement(s)
								found.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Content</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Visibility</TableHead>
										<TableHead>Created</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredAnnouncements.map((announcement) => (
										<TableRow key={announcement.id}>
											<TableCell>
												<div className="flex items-center space-x-2">
													<span className="text-primary">{getIconByName(announcement.icon)}</span>
													<span className="font-medium truncate max-w-[250px]">
														{announcement.content}
													</span>
												</div>
												{announcement.priority > 0 && (
													<Badge variant="outline" className="mt-1">
														Priority: {announcement.priority}
													</Badge>
												)}
												{announcement.tickerMode === false && (
													<Badge variant="outline" className="mt-1 ml-1">
														Not in ticker
													</Badge>
												)}
											</TableCell>
											<TableCell>
												<Badge className={`${getTypeColor(announcement.type)} text-white`}>
													{announcement.type || 'info'}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex flex-col">
													{announcement.visibleTo &&
														(announcement.visibleTo.includes('all') ? (
															<Badge variant="outline">Everyone</Badge>
														) : (
															<div className="flex flex-wrap gap-1">
																{announcement.visibleTo.map((role: string) => (
																	<Badge key={role} variant="outline">
																		{role}
																	</Badge>
																))}
															</div>
														))}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex flex-col text-sm">
													<span>{formatDate(announcement.createdAt)}</span>
													{announcement.expiresAt && (
														<span className="text-xs text-muted-foreground flex items-center mt-1">
															<Calendar className="w-3 h-3 mr-1" />
															Expires: {formatDate(announcement.expiresAt)}
														</span>
													)}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => toggleActive(announcement)}
													>
														{announcement.isActive ? (
															<Badge variant="default" className="bg-green-500">
																<CheckCircle className="w-3 h-3 mr-1" />
																Active
															</Badge>
														) : (
															<Badge variant="outline" className="text-muted-foreground">
																<XCircle className="w-3 h-3 mr-1" />
																Inactive
															</Badge>
														)}
													</Button>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center space-x-2">
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleEditClick(announcement)}
													>
														<Pencil className="w-4 h-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleDeleteClick(announcement)}
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				)}

				{/* Create Announcement Dialog */}
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Create New Announcement</DialogTitle>
							<DialogDescription>
								Create a new announcement to display to users on the platform
							</DialogDescription>
						</DialogHeader>

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
								<FormField
									control={form.control}
									name="content"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Announcement Text</FormLabel>
											<FormControl>
												<Textarea placeholder="Enter your announcement message" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="icon"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Icon</FormLabel>
												<Select value={field.value} onValueChange={field.onChange}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select an icon" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{iconOptions.map((icon) => (
															<SelectItem key={icon.value} value={icon.value}>
																<div className="flex items-center">
																	{icon.icon}
																	<span className="ml-2">{icon.label}</span>
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="type"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Type</FormLabel>
												<Select value={field.value} onValueChange={field.onChange}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select a type" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{typeOptions.map((type) => (
															<SelectItem key={type.value} value={type.value}>
																<div className="flex items-center">
																	<div className={`w-3 h-3 rounded-full ${type.color} mr-2`} />
																	<span>{type.label}</span>
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="priority"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Priority</FormLabel>
												<FormControl>
													<Input
														type="number"
														{...field}
														onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
													/>
												</FormControl>
												<FormDescription>
													Higher priority announcements appear first
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="expiresAt"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Expiration Date (Optional)</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant="outline"
																className={`w-full pl-3 text-left font-normal ${
																	!field.value && 'text-muted-foreground'
																}`}
															>
																{field.value ? (
																	format(field.value, 'PPP')
																) : (
																	<span>No expiration date</span>
																)}
																<Calendar className="ml-auto h-4 w-4 opacity-50" />
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0" align="start">
														<CalendarComponent
															mode="single"
															selected={field.value || undefined}
															onSelect={(date) => field.onChange(date)}
															initialFocus
														/>
														<div className="p-2 border-t border-border">
															<Button
																variant="ghost"
																className="w-full"
																onClick={() => field.onChange(null)}
															>
																Clear
															</Button>
														</div>
													</PopoverContent>
												</Popover>
												<FormDescription>
													Announcement will be hidden after this date
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="visibleTo"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Visibility</FormLabel>
											<div className="flex flex-wrap gap-2 mt-2">
												{visibilityOptions.map((option) => (
													<Badge
														key={option.value}
														variant={field.value?.includes(option.value) ? 'default' : 'outline'}
														className="cursor-pointer"
														onClick={() => {
															if (option.value === 'all') {
																field.onChange(['all']);
															} else {
																const currentValues = field.value || [];
																// Remove "all" if it's there
																const filteredValues = currentValues.filter((v) => v !== 'all');

																if (currentValues.includes(option.value)) {
																	// If this value exists, remove it
																	field.onChange(filteredValues.filter((v) => v !== option.value));
																} else {
																	// If this value doesn't exist, add it
																	field.onChange([...filteredValues, option.value]);
																}
															}
														}}
													>
														{field.value?.includes(option.value) ? (
															<Eye className="w-3 h-3 mr-1" />
														) : (
															<EyeOff className="w-3 h-3 mr-1" />
														)}
														{option.label}
													</Badge>
												))}
											</div>
											<FormDescription>
												Select who should be able to see this announcement
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="tickerMode"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>Show in Ticker</FormLabel>
													<FormDescription>
														Display this announcement in the scrolling ticker
													</FormDescription>
												</div>
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="isActive"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>Active</FormLabel>
													<FormDescription>
														Make this announcement active immediately
													</FormDescription>
												</div>
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="link"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Link (Optional)</FormLabel>
											<FormControl>
												<div className="flex items-center space-x-2">
													<Link2 className="w-4 h-4 text-muted-foreground" />
													<Input
														placeholder="e.g., /forum/thread/123 or https://example.com"
														{...field}
														value={field.value || ''}
														onChange={(e) => field.onChange(e.target.value || null)}
													/>
												</div>
											</FormControl>
											<FormDescription>Add a clickable link to the announcement</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="bgColor"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Background Color (Optional)</FormLabel>
												<FormControl>
													<Input
														type="text"
														placeholder="#000000 or rgba(0,0,0,0.5)"
														{...field}
														value={field.value || ''}
														onChange={(e) => field.onChange(e.target.value || null)}
													/>
												</FormControl>
												<FormDescription>
													Custom background color for the announcement
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="textColor"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Text Color (Optional)</FormLabel>
												<FormControl>
													<Input
														type="text"
														placeholder="#ffffff or rgba(255,255,255,1)"
														{...field}
														value={field.value || ''}
														onChange={(e) => field.onChange(e.target.value || null)}
													/>
												</FormControl>
												<FormDescription>Custom text color for the announcement</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsCreateDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={createMutation.isPending}>
										{createMutation.isPending ? 'Creating...' : 'Create Announcement'}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>

				{/* Edit Announcement Dialog */}
				<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
					<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Edit Announcement</DialogTitle>
							<DialogDescription>Update this announcement's details</DialogDescription>
						</DialogHeader>

						<Form {...editForm}>
							<form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
								<FormField
									control={editForm.control}
									name="content"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Announcement Text</FormLabel>
											<FormControl>
												<Textarea placeholder="Enter your announcement message" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={editForm.control}
										name="icon"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Icon</FormLabel>
												<Select value={field.value} onValueChange={field.onChange}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select an icon" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{iconOptions.map((icon) => (
															<SelectItem key={icon.value} value={icon.value}>
																<div className="flex items-center">
																	{icon.icon}
																	<span className="ml-2">{icon.label}</span>
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={editForm.control}
										name="type"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Type</FormLabel>
												<Select value={field.value} onValueChange={field.onChange}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select a type" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{typeOptions.map((type) => (
															<SelectItem key={type.value} value={type.value}>
																<div className="flex items-center">
																	<div className={`w-3 h-3 rounded-full ${type.color} mr-2`} />
																	<span>{type.label}</span>
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={editForm.control}
										name="priority"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Priority</FormLabel>
												<FormControl>
													<Input
														type="number"
														{...field}
														onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
													/>
												</FormControl>
												<FormDescription>
													Higher priority announcements appear first
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={editForm.control}
										name="expiresAt"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Expiration Date (Optional)</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant="outline"
																className={`w-full pl-3 text-left font-normal ${
																	!field.value && 'text-muted-foreground'
																}`}
															>
																{field.value ? (
																	format(field.value, 'PPP')
																) : (
																	<span>No expiration date</span>
																)}
																<Calendar className="ml-auto h-4 w-4 opacity-50" />
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0" align="start">
														<CalendarComponent
															mode="single"
															selected={field.value || undefined}
															onSelect={(date) => field.onChange(date)}
															initialFocus
														/>
														<div className="p-2 border-t border-border">
															<Button
																variant="ghost"
																className="w-full"
																onClick={() => field.onChange(null)}
															>
																Clear
															</Button>
														</div>
													</PopoverContent>
												</Popover>
												<FormDescription>
													Announcement will be hidden after this date
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={editForm.control}
									name="visibleTo"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Visibility</FormLabel>
											<div className="flex flex-wrap gap-2 mt-2">
												{visibilityOptions.map((option) => (
													<Badge
														key={option.value}
														variant={field.value?.includes(option.value) ? 'default' : 'outline'}
														className="cursor-pointer"
														onClick={() => {
															if (option.value === 'all') {
																field.onChange(['all']);
															} else {
																const currentValues = field.value || [];
																// Remove "all" if it's there
																const filteredValues = currentValues.filter((v) => v !== 'all');

																if (currentValues.includes(option.value)) {
																	// If this value exists, remove it
																	field.onChange(filteredValues.filter((v) => v !== option.value));
																} else {
																	// If this value doesn't exist, add it
																	field.onChange([...filteredValues, option.value]);
																}
															}
														}}
													>
														{field.value?.includes(option.value) ? (
															<Eye className="w-3 h-3 mr-1" />
														) : (
															<EyeOff className="w-3 h-3 mr-1" />
														)}
														{option.label}
													</Badge>
												))}
											</div>
											<FormDescription>
												Select who should be able to see this announcement
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={editForm.control}
										name="tickerMode"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>Show in Ticker</FormLabel>
													<FormDescription>
														Display this announcement in the scrolling ticker
													</FormDescription>
												</div>
											</FormItem>
										)}
									/>

									<FormField
										control={editForm.control}
										name="isActive"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>Active</FormLabel>
													<FormDescription>
														Make this announcement active immediately
													</FormDescription>
												</div>
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={editForm.control}
									name="link"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Link (Optional)</FormLabel>
											<FormControl>
												<div className="flex items-center space-x-2">
													<Link2 className="w-4 h-4 text-muted-foreground" />
													<Input
														placeholder="e.g., /forum/thread/123 or https://example.com"
														{...field}
														value={field.value || ''}
														onChange={(e) => field.onChange(e.target.value || null)}
													/>
												</div>
											</FormControl>
											<FormDescription>Add a clickable link to the announcement</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={editForm.control}
										name="bgColor"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Background Color (Optional)</FormLabel>
												<FormControl>
													<Input
														type="text"
														placeholder="#000000 or rgba(0,0,0,0.5)"
														{...field}
														value={field.value || ''}
														onChange={(e) => field.onChange(e.target.value || null)}
													/>
												</FormControl>
												<FormDescription>
													Custom background color for the announcement
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={editForm.control}
										name="textColor"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Text Color (Optional)</FormLabel>
												<FormControl>
													<Input
														type="text"
														placeholder="#ffffff or rgba(255,255,255,1)"
														{...field}
														value={field.value || ''}
														onChange={(e) => field.onChange(e.target.value || null)}
													/>
												</FormControl>
												<FormDescription>Custom text color for the announcement</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsEditDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={updateMutation.isPending}>
										{updateMutation.isPending ? 'Saving...' : 'Save Changes'}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>

				{/* Delete Confirmation Dialog */}
				<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Announcement</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete this announcement? This action cannot be undone.
							</DialogDescription>
						</DialogHeader>
						<div className="border rounded-md p-4 my-4">
							<div className="flex items-center space-x-2">
								{selectedAnnouncement && (
									<>
										{getIconByName(selectedAnnouncement.icon)}
										<span className="font-medium">{selectedAnnouncement?.content}</span>
									</>
								)}
							</div>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={() => {
									if (selectedAnnouncement) {
										deleteMutation.mutate(selectedAnnouncement.id);
									}
								}}
								disabled={deleteMutation.isPending}
							>
								{deleteMutation.isPending ? 'Deleting...' : 'Delete'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</AdminPageShell>
	);
}
