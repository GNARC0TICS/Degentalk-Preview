import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import {
	Database,
	MoreHorizontal,
	Edit3,
	Ban,
	Unlock,
	Trash2,
	Eye,
	Shield,
	AlertTriangle,
	CheckCircle,
	Download,
	Search,
	Filter,
	RefreshCw,
	ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Types
interface TableInfo {
	name: string;
	schema: string;
	rowCount: number;
	lastModified: string | null;
	comment: string | null;
	isEditable: boolean;
	hasData: boolean;
	accessInfo: {
		canView: boolean;
		canEdit: boolean;
		isConfig: boolean;
		configRoute?: string;
		reason?: string;
	};
}

interface TableData {
	rows: any[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

interface ColumnInfo {
	name: string;
	type: string;
	nullable: boolean;
	defaultValue: string | null;
	isPrimaryKey: boolean;
	isForeignKey: boolean;
	foreignKeyTable: string | null;
	foreignKeyColumn: string | null;
}

const MODERATION_TABLES = ['users', 'threads', 'posts', 'bans', 'reports'];
const METADATA_TABLES = ['roles', 'categories', 'forum_structure', 'tags'];

export default function LiveDatabasePage() {
	const [selectedTable, setSelectedTable] = useState<string>('');
	const [searchTerm, setSearchTerm] = useState('');
	const [tableFilter, setTableFilter] = useState<'all' | 'moderation' | 'metadata' | 'editable'>(
		'all'
	);
	const [page, setPage] = useState(1);
	const [sortField, setSortField] = useState<string>('');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

	// Edit state
	const [editingRow, setEditingRow] = useState<any>(null);
	const [editData, setEditData] = useState<Record<string, any>>({});

	// Action dialogs
	const [actionDialog, setActionDialog] = useState<{
		type: 'ban' | 'unban' | 'delete' | 'lock' | 'unlock' | 'review' | null;
		row: any;
		table: string;
	} | null>(null);

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	const queryClient = useQueryClient();

	// Fetch available tables
	const { data: tablesData, isLoading: tablesLoading } = useQuery({
		queryKey: ['/api/admin/database/tables'],
		queryFn: async () => {
			const response = await apiRequest<{ success: boolean; data: TableInfo[] }>({
				url: '/api/admin/database/tables',
				method: 'GET'
			});
			return response.data;
		}
	});

	// Fetch table data when table is selected
	const {
		data: tableData,
		isLoading: tableDataLoading,
		refetch: refetchTableData
	} = useQuery({
		queryKey: [
			'/api/admin/database/table-data',
			selectedTable,
			page,
			searchTerm,
			sortField,
			sortOrder
		],
		queryFn: async () => {
			if (!selectedTable) return null;

			const params: Record<string, string> = {
				page: page.toString(),
				limit: '50',
				sortOrder
			};

			if (searchTerm) params.search = searchTerm;
			if (sortField) params.sortField = sortField;

			const response = await apiRequest<{ success: boolean; data: TableData }>({
				url: `/api/admin/database/tables/${selectedTable}/data`,
				method: 'GET',
				params
			});
			return response.data;
		},
		enabled: !!selectedTable
	});

	// Fetch table schema
	const { data: schemaData } = useQuery({
		queryKey: ['/api/admin/database/table-schema', selectedTable],
		queryFn: async () => {
			if (!selectedTable) return null;

			const response = await apiRequest<{ success: boolean; data: { columns: ColumnInfo[] } }>({
				url: `/api/admin/database/tables/${selectedTable}/schema`,
				method: 'GET'
			});
			return response.data;
		},
		enabled: !!selectedTable
	});

	// Update row mutation
	const updateRowMutation = useMutation({
		mutationFn: async ({
			table,
			rowId,
			data
		}: {
			table: string;
			rowId: any;
			data: Record<string, any>;
		}) => {
			return apiRequest({
				url: '/api/admin/database/tables/rows/update',
				method: 'PUT',
				data: { table, rowId, data }
			});
		},
		onSuccess: () => {
			toast.success('Row updated successfully');
			refetchTableData();
			setIsEditDialogOpen(false);
			setEditingRow(null);
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to update row');
		}
	});

	// Delete row mutation
	const deleteRowMutation = useMutation({
		mutationFn: async ({ table, rowId }: { table: string; rowId: any }) => {
			return apiRequest({
				url: '/api/admin/database/tables/rows/delete',
				method: 'DELETE',
				data: { table, rowId }
			});
		},
		onSuccess: () => {
			toast.success('Row deleted successfully');
			refetchTableData();
			setActionDialog(null);
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to delete row');
		}
	});

	// Export table mutation
	const exportTableMutation = useMutation({
		mutationFn: async (tableName: string) => {
			const response = await fetch(`/api/admin/database/tables/${tableName}/export/csv`, {
				method: 'GET',
				headers: { 'Content-Type': 'text/csv' }
			});

			if (!response.ok) throw new Error('Export failed');

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${tableName}_export.csv`;
			a.click();
			window.URL.revokeObjectURL(url);
		},
		onSuccess: () => {
			toast.success('Table exported successfully');
		},
		onError: (error: any) => {
			toast.error('Failed to export table');
		}
	});

	// Filter tables based on selected filter
	const filteredTables = useMemo(() => {
		if (!tablesData) return [];

		let filtered = tablesData;

		switch (tableFilter) {
			case 'moderation':
				filtered = tablesData.filter((t) => MODERATION_TABLES.includes(t.name));
				break;
			case 'metadata':
				filtered = tablesData.filter((t) => METADATA_TABLES.includes(t.name));
				break;
			case 'editable':
				filtered = tablesData.filter((t) => t.isEditable);
				break;
		}

		if (searchTerm) {
			filtered = filtered.filter(
				(t) =>
					t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(t.comment && t.comment.toLowerCase().includes(searchTerm.toLowerCase()))
			);
		}

		return filtered;
	}, [tablesData, tableFilter, searchTerm]);

	// Get table access badge
	const getAccessBadge = (table: TableInfo) => {
		if (table.accessInfo.isConfig) {
			return (
				<Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
					<ExternalLink className="h-3 w-3 mr-1" />
					Config Panel
				</Badge>
			);
		}

		if (table.isEditable) {
			return (
				<Badge className="bg-green-100 border-green-200 text-green-800">
					<Edit3 className="h-3 w-3 mr-1" />
					Editable
				</Badge>
			);
		}

		return (
			<Badge variant="outline" className="bg-gray-50">
				<Eye className="h-3 w-3 mr-1" />
				Read Only
			</Badge>
		);
	};

	// Handle moderation actions
	const handleModerationAction = (
		type: 'ban' | 'unban' | 'delete' | 'lock' | 'unlock' | 'review',
		row: any
	) => {
		setActionDialog({ type, row, table: selectedTable });
	};

	// Handle edit row
	const handleEditRow = (row: any) => {
		setEditingRow(row);
		setEditData({ ...row });
		setIsEditDialogOpen(true);
	};

	// Confirm action
	const confirmAction = async () => {
		if (!actionDialog) return;

		const { type, row, table } = actionDialog;

		try {
			switch (type) {
				case 'ban':
					if (table === 'users') {
						await updateRowMutation.mutateAsync({
							table,
							rowId: row.id,
							data: { status: 'banned', ban_reason: 'Banned via live database editor' }
						});
					}
					break;
				case 'unban':
					if (table === 'users') {
						await updateRowMutation.mutateAsync({
							table,
							rowId: row.id,
							data: { status: 'active', ban_reason: null }
						});
					}
					break;
				case 'lock':
					if (table === 'threads') {
						await updateRowMutation.mutateAsync({
							table,
							rowId: row.id,
							data: { locked: true }
						});
					}
					break;
				case 'unlock':
					if (table === 'threads') {
						await updateRowMutation.mutateAsync({
							table,
							rowId: row.id,
							data: { locked: false }
						});
					}
					break;
				case 'review':
					if (table === 'reports') {
						await updateRowMutation.mutateAsync({
							table,
							rowId: row.id,
							data: { status: 'reviewed', reviewed_at: new Date().toISOString() }
						});
					}
					break;
				case 'delete':
					await deleteRowMutation.mutateAsync({ table, rowId: row.id });
					break;
			}
			setActionDialog(null);
		} catch (error) {
			// Error handled by mutation
		}
	};

	// Save edited row
	const saveEditedRow = async () => {
		if (!editingRow || !schemaData) return;

		const primaryKey = schemaData.columns.find((col) => col.isPrimaryKey);
		if (!primaryKey) {
			toast.error('Cannot update: No primary key found');
			return;
		}

		// Remove unchanged fields
		const changedData: Record<string, any> = {};
		Object.keys(editData).forEach((key) => {
			if (editData[key] !== editingRow[key]) {
				changedData[key] = editData[key];
			}
		});

		if (Object.keys(changedData).length === 0) {
			toast.info('No changes to save');
			setIsEditDialogOpen(false);
			return;
		}

		await updateRowMutation.mutateAsync({
			table: selectedTable,
			rowId: editingRow[primaryKey.name],
			data: changedData
		});
	};

	const currentTable = tablesData?.find((t) => t.name === selectedTable);

	return (
		<AdminPageShell
			title="Live Database Editor"
			pageActions={
				<div className="flex items-center gap-2">
					{selectedTable && currentTable?.isEditable && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => exportTableMutation.mutate(selectedTable)}
							disabled={exportTableMutation.isPending}
						>
							<Download className="h-4 w-4 mr-2" />
							Export CSV
						</Button>
					)}
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							queryClient.invalidateQueries({ queryKey: ['/api/admin/database'] });
							refetchTableData();
						}}
					>
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh
					</Button>
				</div>
			}
		>
			<div className="space-y-6">
				{/* Safety Banners */}
				{currentTable?.accessInfo.blocked && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<div className="flex items-center gap-2 text-red-800">
							<Shield className="h-5 w-5" />
							<div>
								<h3 className="font-medium">⚠️ RESTRICTED TABLE ACCESS</h3>
								<p className="text-sm mt-1">{currentTable.accessInfo.reason}</p>
								<p className="text-xs mt-2 font-medium">
									This table is blocked for security reasons and cannot be accessed through the live
									database editor.
								</p>
							</div>
						</div>
					</div>
				)}

				{currentTable?.accessInfo.isConfig && !currentTable?.accessInfo.blocked && (
					<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
						<div className="flex items-center gap-2 text-amber-800">
							<AlertTriangle className="h-5 w-5" />
							<div>
								<h3 className="font-medium">Configuration Table</h3>
								<p className="text-sm mt-1">
									This table should be edited through the dedicated config panel:
									<a
										href={currentTable.accessInfo.configRoute}
										className="ml-1 underline hover:text-amber-900"
										target="_blank"
										rel="noopener noreferrer"
									>
										{currentTable.accessInfo.configRoute}
									</a>
								</p>
								<p className="text-xs mt-2 text-amber-700">
									The live database editor is read-only for configuration tables to maintain data
									integrity.
								</p>
							</div>
						</div>
					</div>
				)}

				{selectedTable && MODERATION_TABLES.includes(selectedTable) && (
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
						<div className="flex items-center gap-2 text-blue-800">
							<Shield className="h-4 w-4" />
							<div className="text-sm">
								<span className="font-medium">Moderation Table:</span> Enhanced actions available
								for user management, content moderation, and safety operations.
							</div>
						</div>
					</div>
				)}

				{selectedTable && METADATA_TABLES.includes(selectedTable) && (
					<div className="bg-green-50 border border-green-200 rounded-lg p-3">
						<div className="flex items-center gap-2 text-green-800">
							<CheckCircle className="h-4 w-4" />
							<div className="text-sm">
								<span className="font-medium">Metadata Table:</span> Safe for structure changes,
								drag-to-reorder, and organizational edits.
							</div>
						</div>
					</div>
				)}

				{/* Table Selection */}
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					<div className="lg:col-span-1">
						<div className="space-y-4">
							<div>
								<h3 className="text-lg font-medium mb-3">Database Tables</h3>

								{/* Filters */}
								<div className="space-y-2 mb-4">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
										<Input
											placeholder="Search tables..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-9"
										/>
									</div>

									<Select value={tableFilter} onValueChange={(value: any) => setTableFilter(value)}>
										<SelectTrigger>
											<SelectValue placeholder="Filter tables" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Tables</SelectItem>
											<SelectItem value="moderation">Moderation Tables</SelectItem>
											<SelectItem value="metadata">Metadata Tables</SelectItem>
											<SelectItem value="editable">Editable Only</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Tables List */}
							<div className="space-y-1 max-h-96 overflow-y-auto">
								{tablesLoading ? (
									<div className="text-sm text-gray-500 text-center py-4">Loading tables...</div>
								) : (
									filteredTables.map((table) => (
										<button
											key={table.name}
											onClick={() => {
												setSelectedTable(table.name);
												setPage(1);
											}}
											className={cn(
												'w-full text-left p-3 rounded-lg border text-sm transition-colors',
												selectedTable === table.name
													? 'bg-primary text-primary-foreground border-primary'
													: 'bg-white hover:bg-gray-50 border-gray-200'
											)}
										>
											<div className="flex items-center justify-between mb-1">
												<span className="font-medium">{table.name}</span>
												{getAccessBadge(table)}
											</div>
											<div className="text-xs opacity-75">
												{table.rowCount.toLocaleString()} rows
												{table.lastModified && (
													<span className="ml-2">
														Updated {new Date(table.lastModified).toLocaleDateString()}
													</span>
												)}
											</div>
											{table.comment && (
												<div className="text-xs mt-1 opacity-60">{table.comment}</div>
											)}
										</button>
									))
								)}
							</div>
						</div>
					</div>

					{/* Table Data */}
					<div className="lg:col-span-3">
						{!selectedTable ? (
							<div className="flex items-center justify-center h-64 border border-gray-200 rounded-lg bg-gray-50">
								<div className="text-center text-gray-500">
									<Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
									<p>Select a table to view its data</p>
								</div>
							</div>
						) : tableDataLoading ? (
							<div className="flex items-center justify-center h-64 border border-gray-200 rounded-lg">
								<div className="text-center text-gray-500">
									<RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
									<p>Loading table data...</p>
								</div>
							</div>
						) : !tableData || tableData.rows.length === 0 ? (
							<div className="flex items-center justify-center h-64 border border-gray-200 rounded-lg bg-gray-50">
								<div className="text-center text-gray-500">
									<Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
									<p>No data found in table "{selectedTable}"</p>
								</div>
							</div>
						) : (
							<div className="space-y-4">
								{/* Table Header */}
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-medium">{selectedTable}</h3>
										<p className="text-sm text-gray-500">
											{tableData.total.toLocaleString()} total rows
											{currentTable?.isEditable && (
												<span className="ml-2 text-green-600">• Editable</span>
											)}
										</p>
									</div>
								</div>

								{/* Data Table */}
								<div className="border rounded-lg overflow-hidden">
									<div className="overflow-x-auto max-h-96 overflow-y-auto">
										<Table>
											<TableHeader className="sticky top-0 bg-white">
												<TableRow>
													{schemaData?.columns.map((column) => (
														<TableHead
															key={column.name}
															className={cn('min-w-32', column.isPrimaryKey && 'bg-blue-50')}
														>
															<div className="flex items-center gap-2">
																<span>{column.name}</span>
																{column.isPrimaryKey && (
																	<Badge variant="outline" className="text-xs">
																		PK
																	</Badge>
																)}
																{column.isForeignKey && (
																	<Badge variant="outline" className="text-xs">
																		FK
																	</Badge>
																)}
															</div>
															<div className="text-xs font-normal text-gray-500 mt-1">
																{column.type}
															</div>
														</TableHead>
													))}
													{currentTable?.isEditable && (
														<TableHead className="w-16">Actions</TableHead>
													)}
												</TableRow>
											</TableHeader>
											<TableBody>
												{tableData.rows.map((row, index) => (
													<TableRow key={index} className="hover:bg-gray-50">
														{schemaData?.columns.map((column) => (
															<TableCell key={column.name} className="max-w-xs truncate">
																{row[column.name] === null ? (
																	<span className="text-gray-400 italic">null</span>
																) : column.type === 'boolean' ? (
																	row[column.name] ? (
																		<CheckCircle className="h-4 w-4 text-green-500" />
																	) : (
																		<span className="text-gray-400">false</span>
																	)
																) : (
																	String(row[column.name])
																)}
															</TableCell>
														))}
														{currentTable?.isEditable && (
															<TableCell>
																<DropdownMenu>
																	<DropdownMenuTrigger asChild>
																		<Button variant="ghost" size="sm">
																			<MoreHorizontal className="h-4 w-4" />
																		</Button>
																	</DropdownMenuTrigger>
																	<DropdownMenuContent align="end">
																		<DropdownMenuItem onClick={() => handleEditRow(row)}>
																			<Edit3 className="h-4 w-4 mr-2" />
																			Edit Row
																		</DropdownMenuItem>

																		{/* Moderation Actions */}
																		{selectedTable === 'users' && (
																			<>
																				<DropdownMenuSeparator />
																				{row.status === 'banned' ? (
																					<DropdownMenuItem
																						onClick={() => handleModerationAction('unban', row)}
																					>
																						<Unlock className="h-4 w-4 mr-2" />
																						Unban User
																					</DropdownMenuItem>
																				) : (
																					<DropdownMenuItem
																						onClick={() => handleModerationAction('ban', row)}
																					>
																						<Ban className="h-4 w-4 mr-2" />
																						Ban User
																					</DropdownMenuItem>
																				)}
																			</>
																		)}

																		{selectedTable === 'threads' && (
																			<>
																				<DropdownMenuSeparator />
																				{row.locked ? (
																					<DropdownMenuItem
																						onClick={() => handleModerationAction('unlock', row)}
																					>
																						<Unlock className="h-4 w-4 mr-2" />
																						Unlock Thread
																					</DropdownMenuItem>
																				) : (
																					<DropdownMenuItem
																						onClick={() => handleModerationAction('lock', row)}
																					>
																						<Ban className="h-4 w-4 mr-2" />
																						Lock Thread
																					</DropdownMenuItem>
																				)}
																			</>
																		)}

																		{selectedTable === 'reports' && row.status !== 'reviewed' && (
																			<>
																				<DropdownMenuSeparator />
																				<DropdownMenuItem
																					onClick={() => handleModerationAction('review', row)}
																				>
																					<CheckCircle className="h-4 w-4 mr-2" />
																					Mark Reviewed
																				</DropdownMenuItem>
																			</>
																		)}

																		<DropdownMenuSeparator />
																		<DropdownMenuItem
																			onClick={() => handleModerationAction('delete', row)}
																			className="text-red-600"
																		>
																			<Trash2 className="h-4 w-4 mr-2" />
																			Delete Row
																		</DropdownMenuItem>
																	</DropdownMenuContent>
																</DropdownMenu>
															</TableCell>
														)}
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								</div>

								{/* Pagination */}
								{tableData.totalPages > 1 && (
									<div className="flex items-center justify-between">
										<p className="text-sm text-gray-500">
											Page {tableData.page} of {tableData.totalPages}
										</p>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setPage((p) => Math.max(1, p - 1))}
												disabled={page === 1}
											>
												Previous
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setPage((p) => Math.min(tableData.totalPages, p + 1))}
												disabled={page === tableData.totalPages}
											>
												Next
											</Button>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Edit Row Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit Row in {selectedTable}</DialogTitle>
						<DialogDescription>
							Make changes to the selected row. Only modified fields will be updated.
						</DialogDescription>
					</DialogHeader>

					{editingRow && schemaData && (
						<div className="space-y-4">
							{schemaData.columns.map((column) => (
								<div key={column.name}>
									<label className="block text-sm font-medium mb-1">
										{column.name}
										{column.isPrimaryKey && (
											<Badge variant="outline" className="ml-2 text-xs">
												Primary Key
											</Badge>
										)}
										{!column.nullable && <span className="text-red-500 ml-1">*</span>}
									</label>
									<Input
										value={editData[column.name] || ''}
										onChange={(e) =>
											setEditData((prev) => ({
												...prev,
												[column.name]: e.target.value
											}))
										}
										disabled={column.isPrimaryKey}
										placeholder={column.nullable ? 'null' : 'Required'}
									/>
									<p className="text-xs text-gray-500 mt-1">
										Type: {column.type}
										{column.defaultValue && ` • Default: ${column.defaultValue}`}
									</p>
								</div>
							))}
						</div>
					)}

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={saveEditedRow} disabled={updateRowMutation.isPending}>
							{updateRowMutation.isPending ? 'Saving...' : 'Save Changes'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Action Confirmation Dialog */}
			<AlertDialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Action</AlertDialogTitle>
						<AlertDialogDescription>
							{actionDialog?.type === 'delete' &&
								`Are you sure you want to delete this row? This action cannot be undone.`}
							{actionDialog?.type === 'ban' && `Are you sure you want to ban this user?`}
							{actionDialog?.type === 'unban' && `Are you sure you want to unban this user?`}
							{actionDialog?.type === 'lock' && `Are you sure you want to lock this thread?`}
							{actionDialog?.type === 'unlock' && `Are you sure you want to unlock this thread?`}
							{actionDialog?.type === 'review' && `Mark this report as reviewed?`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmAction}
							className={cn(actionDialog?.type === 'delete' && 'bg-red-600 hover:bg-red-700')}
						>
							Confirm
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</AdminPageShell>
	);
}
