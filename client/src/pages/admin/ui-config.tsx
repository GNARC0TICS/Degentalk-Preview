import React, { useState, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Button,
	Input,
	Badge,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
	Label,
	Switch,
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import {
	Search,
	Plus,
	Edit,
	Trash2,
	Eye,
	EyeOff,
	Download,
	Upload,
	MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
	uiConfigApi,
	type CreateQuoteData,
	type QuoteFilters,
	type PaginationOptions
} from '@/features/admin/services/uiConfigApi';
import ProtectedAdminRoute from '@/features/admin/components/protected-admin-route';
import { useAdminModuleV2 } from '@/hooks/use-admin-modules';
import { VisualJsonTabs } from '@/features/admin/components/VisualJsonTabs';
import { useJsonConfig } from '@/hooks/useJsonConfig';
import { uiQuotesSchema, type UIQuotes } from '@/schemas/uiQuotes.schema';
import { logger } from "@/lib/logger";

// Types
interface Quote {
	id: string;
	type: string;
	headline: string;
	subheader?: string;
	tags?: string[];
	intensity?: number;
	theme?: string;
	targetAudience?: string;
	isActive: boolean;
	displayOrder: number;
	weight?: number;
	impressions: number;
	clicks: number;
	createdAt: Date;
	updatedAt?: Date;
}

interface QuotesResponse {
	quotes: Quote[];
	total: number;
	page: number;
	limit: number;
}

/* Minimal visual builder – table/inputs will be added in Phase-2 */
const QuotesVisualBuilder: React.FC<{
	state: UIQuotes;
	setState: (next: UIQuotes) => void;
}> = ({ state }) => (
	<pre className="text-xs bg-zinc-800/40 p-4 rounded max-h-[60vh] overflow-auto">
		{JSON.stringify(state, null, 2)}
	</pre>
);

function UIConfigContent() {
	const { data, save, loading } = useJsonConfig<UIQuotes>('/admin/ui-quotes', uiQuotesSchema);

	return (
		<Card>
			<CardHeader>
				<CardTitle>UI Quotes Configuration</CardTitle>
			</CardHeader>
			<CardContent>
				<VisualJsonTabs<UIQuotes>
					shapeSchema={uiQuotesSchema}
					value={data}
					onChange={save}
					loading={loading}
				>
					{(state, setState) => <QuotesVisualBuilder state={state} setState={setState} />}
				</VisualJsonTabs>
			</CardContent>
		</Card>
	);
}

const UiConfigPage: React.FC = () => {
	const { toast } = useToast();
	// State
	const [activeTab, setActiveTab] = useState('hero');
	const [quotes, setQuotes] = useState<Quote[]>([]);
	const [loading, setLoading] = useState(false);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState<QuoteFilters>({});
	const [searchTerm, setSearchTerm] = useState('');
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

	// Form state
	const [formData, setFormData] = useState<CreateQuoteData>({
		type: 'hero',
		headline: '',
		subheader: '',
		tags: [],
		intensity: 1,
		theme: 'default',
		targetAudience: 'all',
		isActive: true,
		displayOrder: 0,
		weight: 1
	});

	// Load quotes
	const loadQuotes = async () => {
		setLoading(true);
		try {
			const currentFilters = {
				...filters,
				type: [activeTab],
				searchTerm: searchTerm || undefined
			};

			const pagination: PaginationOptions = {
				page,
				limit: 20,
				sortBy: 'displayOrder',
				sortOrder: 'asc'
			};

			const data: QuotesResponse = await uiConfigApi.getQuotes(currentFilters, pagination);

			setQuotes(data.quotes);
			setTotal(data.total);
		} catch (error) {
			logger.error('UiConfig', 'Error loading quotes:', error);
			toast({
				title: 'Error',
				description: 'Failed to load quotes',
				variant: 'destructive'
			});
		} finally {
			setLoading(false);
		}
	};

	// Effects
	useEffect(() => {
		loadQuotes();
	}, [activeTab, page, filters, searchTerm]);

	// Handlers
	const handleCreateQuote = async () => {
		try {
			await uiConfigApi.createQuote({
				...formData,
				type: activeTab
			});

			setShowCreateDialog(false);
			setFormData({
				type: activeTab,
				headline: '',
				subheader: '',
				tags: [],
				intensity: 1,
				theme: 'default',
				targetAudience: 'all',
				isActive: true,
				displayOrder: 0,
				weight: 1
			});

			toast({
				title: 'Success',
				description: 'Quote created successfully'
			});

			loadQuotes();
		} catch (error) {
			logger.error('UiConfig', 'Error creating quote:', error);
			toast({
				title: 'Error',
				description: 'Failed to create quote',
				variant: 'destructive'
			});
		}
	};

	const handleEditQuote = async () => {
		if (!editingQuote) return;

		try {
			await uiConfigApi.updateQuote({
				...formData,
				id: editingQuote.id
			});

			setShowEditDialog(false);
			setEditingQuote(null);

			toast({
				title: 'Success',
				description: 'Quote updated successfully'
			});

			loadQuotes();
		} catch (error) {
			logger.error('UiConfig', 'Error updating quote:', error);
			toast({
				title: 'Error',
				description: 'Failed to update quote',
				variant: 'destructive'
			});
		}
	};

	const handleDeleteQuote = async (id: string) => {
		try {
			await uiConfigApi.deleteQuote(id);

			toast({
				title: 'Success',
				description: 'Quote deleted successfully'
			});

			loadQuotes();
		} catch (error) {
			logger.error('UiConfig', 'Error deleting quote:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete quote',
				variant: 'destructive'
			});
		}
	};

	const handleToggleActive = async (quote: Quote) => {
		try {
			await uiConfigApi.updateQuote({
				...quote,
				isActive: !quote.isActive
			});

			loadQuotes();
		} catch (error) {
			logger.error('UiConfig', 'Error toggling quote:', error);
			toast({
				title: 'Error',
				description: 'Failed to update quote status',
				variant: 'destructive'
			});
		}
	};

	const openEditDialog = (quote: Quote) => {
		setEditingQuote(quote);
		setFormData({
			type: quote.type,
			headline: quote.headline,
			subheader: quote.subheader || '',
			tags: quote.tags || [],
			intensity: quote.intensity || 1,
			theme: quote.theme || 'default',
			targetAudience: quote.targetAudience || 'all',
			isActive: quote.isActive,
			displayOrder: quote.displayOrder,
			weight: quote.weight || 1
		});
		setShowEditDialog(true);
	};

	const handleExport = async () => {
		try {
			const data = await uiConfigApi.exportQuotes({ type: [activeTab] }, 'json', true);

			const blob = new Blob([JSON.stringify(data, null, 2)], {
				type: 'application/json'
			});

			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${activeTab}-quotes-${new Date().toISOString().split('T')[0]}.json`;
			a.click();
			URL.revokeObjectURL(url);

			toast({
				title: 'Success',
				description: 'Quotes exported successfully'
			});
		} catch (error) {
			logger.error('UiConfig', 'Error exporting quotes:', error);
			toast({
				title: 'Error',
				description: 'Failed to export quotes',
				variant: 'destructive'
			});
		}
	};

	return (
		<ProtectedAdminRoute moduleId="ui-config">
			<div className="container mx-auto p-6">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-3xl font-bold">UI Quote Manager</h1>
					<div className="flex gap-2">
						<Button variant="outline" onClick={handleExport}>
							<Download className="h-4 w-4 mr-2" />
							Export
						</Button>
						<Button onClick={() => setShowCreateDialog(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Add Quote
						</Button>
					</div>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="hero">Hero Quotes</TabsTrigger>
						<TabsTrigger value="footer">Footer Quotes</TabsTrigger>
						<TabsTrigger value="toast">Toast Messages</TabsTrigger>
						<TabsTrigger value="loading">Loading Text</TabsTrigger>
					</TabsList>

					<div className="mt-6">
						{/* Search and Filters */}
						<Card className="mb-6">
							<CardContent className="pt-6">
								<div className="flex gap-4">
									<div className="flex-1">
										<div className="relative">
											<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
											<Input
												placeholder="Search quotes..."
												value={searchTerm}
												onChange={(e) => setSearchTerm(e.target.value)}
												className="pl-8"
											/>
										</div>
									</div>
									<Select
										value={filters.intensity?.[0]?.toString() || ''}
										onValueChange={(value) =>
											setFilters((prev) => ({
												...prev,
												intensity: value ? [parseInt(value)] : undefined
											}))
										}
									>
										<SelectTrigger className="w-40">
											<SelectValue placeholder="Intensity" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="">All Intensities</SelectItem>
											<SelectItem value="1">Mild (1)</SelectItem>
											<SelectItem value="2">Medium (2)</SelectItem>
											<SelectItem value="3">Spicy (3)</SelectItem>
											<SelectItem value="4">Hot (4)</SelectItem>
											<SelectItem value="5">Nuclear (5)</SelectItem>
										</SelectContent>
									</Select>
									<Select
										value={filters.isActive?.toString() || ''}
										onValueChange={(value) =>
											setFilters((prev) => ({
												...prev,
												isActive: value === '' ? undefined : value === 'true'
											}))
										}
									>
										<SelectTrigger className="w-32">
											<SelectValue placeholder="Status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="">All</SelectItem>
											<SelectItem value="true">Active</SelectItem>
											<SelectItem value="false">Inactive</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>

						{/* Quotes Table */}
						<TabsContent value={activeTab}>
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center justify-between">
										{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Quotes
										<Badge variant="secondary">{total} total</Badge>
									</CardTitle>
								</CardHeader>
								<CardContent>
									{loading ? (
										<div className="text-center py-8">Loading quotes...</div>
									) : quotes.length === 0 ? (
										<div className="text-center py-8 text-muted-foreground">
											No quotes found. Create your first quote!
										</div>
									) : (
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Headline</TableHead>
													<TableHead>Tags</TableHead>
													<TableHead>Intensity</TableHead>
													<TableHead>Status</TableHead>
													<TableHead>Performance</TableHead>
													<TableHead>Actions</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{quotes.map((quote) => (
													<TableRow key={quote.id}>
														<TableCell>
															<div>
																<div className="font-medium">{quote.headline}</div>
																{quote.subheader && (
																	<div className="text-sm text-muted-foreground">
																		{quote.subheader}
																	</div>
																)}
															</div>
														</TableCell>
														<TableCell>
															<div className="flex flex-wrap gap-1">
																{quote.tags?.map((tag) => (
																	<Badge key={tag} variant="outline" className="text-xs">
																		{tag}
																	</Badge>
																))}
															</div>
														</TableCell>
														<TableCell>
															<Badge
																variant={
																	quote.intensity && quote.intensity > 3
																		? 'destructive'
																		: 'secondary'
																}
															>
																{quote.intensity || 1}
															</Badge>
														</TableCell>
														<TableCell>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleToggleActive(quote)}
															>
																{quote.isActive ? (
																	<Eye className="h-4 w-4 text-green-600" />
																) : (
																	<EyeOff className="h-4 w-4 text-gray-400" />
																)}
															</Button>
														</TableCell>
														<TableCell>
															<div className="text-sm">
																<div>{quote.impressions} impressions</div>
																<div>{quote.clicks} clicks</div>
																<div className="text-xs text-muted-foreground">
																	{quote.impressions > 0
																		? `${((quote.clicks / quote.impressions) * 100).toFixed(1)}% CTR`
																		: '0% CTR'}
																</div>
															</div>
														</TableCell>
														<TableCell>
															<div className="flex gap-1">
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => openEditDialog(quote)}
																>
																	<Edit className="h-4 w-4" />
																</Button>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => setDeleteConfirm(quote.id)}
																>
																	<Trash2 className="h-4 w-4 text-red-600" />
																</Button>
															</div>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									)}
								</CardContent>
							</Card>
						</TabsContent>
					</div>
				</Tabs>

				{/* Create Quote Dialog */}
				<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>
								Create New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Quote
							</DialogTitle>
						</DialogHeader>
						<QuoteForm
							data={formData}
							onChange={setFormData}
							onSubmit={handleCreateQuote}
							onCancel={() => setShowCreateDialog(false)}
						/>
					</DialogContent>
				</Dialog>

				{/* Edit Quote Dialog */}
				<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Edit Quote</DialogTitle>
						</DialogHeader>
						<QuoteForm
							data={formData}
							onChange={setFormData}
							onSubmit={handleEditQuote}
							onCancel={() => setShowEditDialog(false)}
							isEditing
						/>
					</DialogContent>
				</Dialog>

				{/* Delete Confirmation */}
				<AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete Quote</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete this quote? This action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => {
									if (deleteConfirm) {
										handleDeleteQuote(deleteConfirm);
										setDeleteConfirm(null);
									}
								}}
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</ProtectedAdminRoute>
	);
};

// Quote Form Component
interface QuoteFormProps {
	data: CreateQuoteData;
	onChange: (data: CreateQuoteData) => void;
	onSubmit: () => void;
	onCancel: () => void;
	isEditing?: boolean;
}

const QuoteForm: React.FC<QuoteFormProps> = ({
	data,
	onChange,
	onSubmit,
	onCancel,
	isEditing = false
}) => {
	const [tagInput, setTagInput] = useState('');

	const handleAddTag = () => {
		if (tagInput.trim() && !data.tags?.includes(tagInput.trim())) {
			onChange({
				...data,
				tags: [...(data.tags || []), tagInput.trim()]
			});
			setTagInput('');
		}
	};

	const handleRemoveTag = (tag: string) => {
		onChange({
			...data,
			tags: data.tags?.filter((t) => t !== tag)
		});
	};

	return (
		<div className="space-y-4">
			<div>
				<Label htmlFor="headline">Headline *</Label>
				<Input
					id="headline"
					value={data.headline}
					onChange={(e) => onChange({ ...data, headline: e.target.value })}
					placeholder="Enter the main headline..."
				/>
			</div>

			<div>
				<Label htmlFor="subheader">Subheader</Label>
				<Textarea
					id="subheader"
					value={data.subheader}
					onChange={(e) => onChange({ ...data, subheader: e.target.value })}
					placeholder="Optional subheader or description..."
					rows={2}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label htmlFor="intensity">Intensity</Label>
					<Select
						value={data.intensity?.toString() || '1'}
						onValueChange={(value) => onChange({ ...data, intensity: parseInt(value) })}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="1">1 - Mild</SelectItem>
							<SelectItem value="2">2 - Medium</SelectItem>
							<SelectItem value="3">3 - Spicy</SelectItem>
							<SelectItem value="4">4 - Hot</SelectItem>
							<SelectItem value="5">5 - Nuclear</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label htmlFor="theme">Theme</Label>
					<Select
						value={data.theme || 'default'}
						onValueChange={(value) => onChange({ ...data, theme: value })}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="default">Default</SelectItem>
							<SelectItem value="holiday">Holiday</SelectItem>
							<SelectItem value="bearmarket">Bear Market</SelectItem>
							<SelectItem value="bullrun">Bull Run</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div>
				<Label>Tags</Label>
				<div className="flex gap-2 mb-2">
					<Input
						value={tagInput}
						onChange={(e) => setTagInput(e.target.value)}
						placeholder="Add a tag..."
						onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
					/>
					<Button type="button" onClick={handleAddTag}>
						Add
					</Button>
				</div>
				<div className="flex flex-wrap gap-2">
					{data.tags?.map((tag) => (
						<Badge
							key={tag}
							variant="secondary"
							className="cursor-pointer"
							onClick={() => handleRemoveTag(tag)}
						>
							{tag} ×
						</Badge>
					))}
				</div>
			</div>

			<div className="flex items-center space-x-2">
				<Switch
					id="isActive"
					checked={data.isActive}
					onCheckedChange={(checked) => onChange({ ...data, isActive: checked })}
				/>
				<Label htmlFor="isActive">Active</Label>
			</div>

			<DialogFooter>
				<Button variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button onClick={onSubmit} disabled={!data.headline.trim()}>
					{isEditing ? 'Update' : 'Create'} Quote
				</Button>
			</DialogFooter>
		</div>
	);
};

export default UiConfigPage;
