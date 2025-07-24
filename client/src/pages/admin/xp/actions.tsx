import React, { useState } from 'react';
import {
	useXpActions,
	useCreateXpAction,
	useUpdateXpAction,
	useDeleteXpAction,
	type XpAction
} from '@app/features/admin/services/xpActionsService';
import { XpActionRow } from '@app/features/admin/components/XpActionRow';
import {
	XpActionFormDialog,
	type XpActionFormData
} from '@app/features/admin/components/forms/xp/XpActionFormDialog';
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
	TableCaption
} from '@app/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@app/components/ui/dialog';

export default function XpActionsAdminPage() {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [selectedAction, setSelectedAction] = useState<XpAction | null>(null);
	const [isEditMode, setIsEditMode] = useState(false);

	const { data, isLoading, error } = useXpActions();
	const createMutation = useCreateXpAction();
	const updateMutation = useUpdateXpAction();
	const deleteMutation = useDeleteXpAction();

	const [formData, setFormData] = useState<XpActionFormData>({
		description: '',
		baseValue: 0,
		enabled: true
	});

	const handleOpenCreate = () => {
		setIsEditMode(false);
		setSelectedAction(null);
		setFormData({
			action: '',
			description: '',
			baseValue: 10,
			maxPerDay: undefined,
			cooldownSec: undefined,
			enabled: true
		});
		setIsFormOpen(true);
	};

	const handleOpenEdit = (action: XpAction) => {
		setIsEditMode(true);
		setSelectedAction(action);
		setFormData(action);
		setIsFormOpen(true);
	};

	const handleOpenDelete = (action: XpAction) => {
		setSelectedAction(action);
		setIsDeleteConfirmOpen(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isEditMode && selectedAction) {
			updateMutation.mutate(
				{ key: selectedAction.action, data: formData },
				{ onSuccess: () => setIsFormOpen(false) }
			);
		} else {
			createMutation.mutate(formData, { onSuccess: () => setIsFormOpen(false) });
		}
	};

	const handleDeleteConfirm = () => {
		if (selectedAction) {
			deleteMutation.mutate(selectedAction.action, {
				onSuccess: () => setIsDeleteConfirmOpen(false)
			});
		}
	};

	return (
		<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-bold tracking-tight">XP Action Settings</h2>
				<Button onClick={handleOpenCreate}>
					<Plus className="mr-2 h-4 w-4" /> Create Action
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Configurable XP Actions</CardTitle>
					<CardDescription>
						Define the events that grant XP, their values, and their limits.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading && (
						<div className="flex justify-center items-center py-8">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					)}
					{error && (
						<Alert variant="destructive">
							<AlertDescription>
								Error loading actions: {error instanceof Error ? error.message : 'Unknown error'}
							</AlertDescription>
						</Alert>
					)}
					{data && (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Action Key</TableHead>
									<TableHead>Description</TableHead>
									<TableHead className="text-center">XP Value</TableHead>
									<TableHead className="text-center">Max/Day</TableHead>
									<TableHead className="text-center">Cooldown (s)</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.actions.map((action) => (
									<XpActionRow
										key={action.action}
										action={action}
										onEdit={handleOpenEdit}
										onDelete={handleOpenDelete}
									/>
								))}
							</TableBody>
							<TableCaption>
								These settings control the entire XP economy of the platform.
							</TableCaption>
						</Table>
					)}
				</CardContent>
			</Card>

			<XpActionFormDialog
				isOpen={isFormOpen}
				setIsOpen={setIsFormOpen}
				isEdit={isEditMode}
				formData={formData}
				setFormData={setFormData}
				handleSubmit={handleSubmit}
				isSubmitting={createMutation.isPending || updateMutation.isPending}
			/>

			<Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Are you sure?</DialogTitle>
						<DialogDescription>
							This will permanently delete the XP action{' '}
							<span className="font-bold font-mono">{selectedAction?.action}</span>. This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
							{deleteMutation.isPending ? 'Deleting...' : 'Delete'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
