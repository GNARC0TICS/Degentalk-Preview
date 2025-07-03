import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { AdminDataTable } from '@/components/admin/common/AdminDataTable';
import type { ColumnDef } from '@/components/admin/layout/EntityTable';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdminAccessSelector } from '@/components/admin/inputs/AdminAccessSelector';
import { AdminToggle } from '@/components/admin/inputs/AdminToggle';

const EntitySchema = z.object({
	id: z.number().optional(),
	name: z.string().min(2).max(100),
	slug: z.string().min(2).max(100),
	description: z.string().max(255).optional().nullable(),
	type: z.enum(['zone', 'category', 'forum']),
	parentId: z.number().nullable().optional(),
	position: z.number().int().min(0).default(0)
});

type Entity = z.infer<typeof EntitySchema>;

export default function ForumStructureAdminPage() {
	const queryClient = useQueryClient();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
	const [accessControl, setAccessControl] = useState<{
		canView: string[];
		canPost: string[];
		canTip: string[];
	}>({
		canView: [],
		canPost: [],
		canTip: []
	});
	const [unlockedStyling, setUnlockedStyling] = useState(false);

	const { data: entities = [], isLoading } = useQuery<Entity[]>({
		queryKey: ['/admin/forum/entities'],
		queryFn: async () => {
			const res = await fetch('/admin/forum/entities');
			if (!res.ok) throw new Error('Failed to fetch entities');
			return res.json();
		}
	});

	const createMutation = useMutation({
		mutationFn: async (data: Entity) => {
			const res = await fetch('/admin/forum/entities', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			if (!res.ok) throw new Error('Failed to create entity');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/admin/forum/entities'] });
			closeDialog();
		}
	});

	const updateMutation = useMutation({
		mutationFn: async (data: Entity) => {
			const res = await fetch(`/admin/forum/entities/${data.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			if (!res.ok) throw new Error('Failed to update entity');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/admin/forum/entities'] });
			closeDialog();
		}
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/admin/forum/entities/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Failed to delete entity');
			return res.json();
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/admin/forum/entities'] })
	});

	const openCreateDialog = () => {
		setEditingEntity(null);
		setAccessControl({ canView: [], canPost: [], canTip: [] });
		setUnlockedStyling(false);
		setIsDialogOpen(true);
	};
	const openEditDialog = (entity: Entity) => {
		setEditingEntity(entity);
		try {
			const pluginData: any = (entity as any).pluginData ?? {};
			setAccessControl({
				canView: pluginData.accessControl?.canView || [],
				canPost: pluginData.accessControl?.canPost || [],
				canTip: pluginData.accessControl?.canTip || []
			});
			setUnlockedStyling(!!pluginData.unlockedStyling);
		} catch {
			setAccessControl({ canView: [], canPost: [], canTip: [] });
			setUnlockedStyling(false);
		}
		setIsDialogOpen(true);
	};
	const closeDialog = () => {
		setIsDialogOpen(false);
	};

	const form = useForm<Entity>({
		resolver: zodResolver(EntitySchema),
		defaultValues: {
			name: '',
			slug: '',
			description: '',
			type: 'forum',
			parentId: null,
			position: 0
		}
	});

	// Populate form when editingEntity changes
	if (editingEntity) {
		form.reset(editingEntity);
	}

	const onSubmit = form.handleSubmit((data) => {
		// Merge pluginData if entity is forum
		const pluginData =
			data.type === 'forum'
				? {
						accessControl,
						unlockedStyling
					}
				: undefined;

		const payload: any = {
			...editingEntity,
			...data,
			...(pluginData ? { pluginData } : {})
		};

		if (editingEntity) {
			updateMutation.mutate(payload);
		} else {
			createMutation.mutate(payload);
		}
	});

	const columns: ColumnDef<Entity>[] = [
		{ key: 'id', header: 'ID' },
		{ key: 'name', header: 'Name' },
		{ key: 'slug', header: 'Slug' },
		{ key: 'type', header: 'Type' },
		{ key: 'parentId', header: 'Parent ID' },
		{ key: 'position', header: 'Position' }
	];

	return (
		<AdminPageShell title="Forum Structure" description="Manage zones, categories, and forums.">
			<Button className="mb-4" onClick={openCreateDialog}>
				<Plus className="h-4 w-4 mr-2" /> New Entity
			</Button>
			<AdminDataTable<Entity>
				columns={columns}
				data={entities}
				isLoading={isLoading}
				renderActions={(row) => (
					<>
						<Button size="sm" variant="outline" onClick={() => openEditDialog(row)}>
							<Pencil className="h-4 w-4" />
						</Button>
						<Button
							className="ml-2"
							size="sm"
							variant="destructive"
							onClick={() => deleteMutation.mutate(row.id!)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</>
				)}
			/>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>{editingEntity ? 'Edit Entity' : 'Create Entity'}</DialogTitle>
					</DialogHeader>
					<form onSubmit={onSubmit} className="space-y-4">
						<Input placeholder="Name" {...form.register('name')} />
						<Input placeholder="Slug" {...form.register('slug')} />
						<Input placeholder="Description" {...form.register('description')} />
						<Select
							value={form.watch('type')}
							onValueChange={(val) => form.setValue('type', val as any)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="zone">Zone</SelectItem>
								<SelectItem value="category">Category</SelectItem>
								<SelectItem value="forum">Forum</SelectItem>
							</SelectContent>
						</Select>
						<Input
							type="number"
							placeholder="Parent ID (optional)"
							{...form.register('parentId', { valueAsNumber: true })}
						/>
						<Input
							type="number"
							placeholder="Position"
							{...form.register('position', { valueAsNumber: true })}
						/>
						{form.watch('type') === 'forum' && (
							<div className="space-y-4 mt-4">
								<h4 className="text-sm font-semibold">Access Control</h4>
								<AdminAccessSelector
									label="Can View"
									selectedIds={accessControl.canView}
									onChange={(ids) => setAccessControl((prev) => ({ ...prev, canView: ids }))}
								/>
								<AdminAccessSelector
									label="Can Post"
									selectedIds={accessControl.canPost}
									onChange={(ids) => setAccessControl((prev) => ({ ...prev, canPost: ids }))}
								/>
								<AdminAccessSelector
									label="Can Tip"
									selectedIds={accessControl.canTip}
									onChange={(ids) => setAccessControl((prev) => ({ ...prev, canTip: ids }))}
								/>

								<h4 className="text-sm font-semibold pt-2">Styling</h4>
								<AdminToggle
									label="Unlocked Styling"
									description="Allow custom fonts, embeds, and visuals in this forum"
									checked={unlockedStyling}
									onChange={setUnlockedStyling}
								/>
							</div>
						)}
						<Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
							{editingEntity ? 'Save' : 'Create'}
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</AdminPageShell>
	);
}
