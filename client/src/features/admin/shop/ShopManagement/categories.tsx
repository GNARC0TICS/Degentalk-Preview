import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdminPageShell } from '@/features/admin/layout/layout/AdminPageShell';
import { NumericAccessSelector } from '@/features/admin/components/inputs/NumericAccessSelector';
import { cn } from '@/utils/utils';

interface Rarity {
	id: string;
	name: string;
	slug: string;
	hexColor: string;
}

// Cosmetic Category schema
const CategorySchema = z.object({
	name: z.string().min(2).max(100),
	slug: z.string().min(2).max(100),
	description: z.string().max(255).optional().nullable(),
	bgColor: z.string().max(10).optional().nullable(),
	textColor: z.string().max(10).optional().nullable(),
	iconUrl: z.string().url().optional().nullable(),
	allowedRarities: z.array(z.number()).optional(),
	isActive: z.boolean().default(true)
});

type Category = z.infer<typeof CategorySchema> & { id: string };

export default function AdminShopCategoriesPage() {
	const queryClient = useQueryClient();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Category | null>(null);

	// fetch categories
	const {
		data: categories = [],
		isLoading,
		isError
	} = useQuery<Category[]>({
		queryKey: ['/admin/shop/categories'],
		queryFn: async () => {
			const res = await fetch('/api/admin/shop/categories');
			if (!res.ok) throw new Error('Failed to fetch categories');
			return res.json();
		}
	});

	// fetch rarities for allowedRarities multiselect
	const { data: rarities = [] } = useQuery<Rarity[]>({
		queryKey: ['/admin/shop/rarities'],
		queryFn: async () => {
			const res = await fetch('/api/admin/shop/rarities');
			if (!res.ok) throw new Error('Failed to fetch rarities');
			return res.json();
		}
	});

	const createMutation = useMutation({
		mutationFn: async (data: any) => {
			const res = await fetch('/api/admin/shop/categories', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			if (!res.ok) throw new Error('Failed to create category');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/admin/shop/categories'] });
			closeDialog();
		}
	});

	const updateMutation = useMutation({
		mutationFn: async ({ id, ...data }: any) => {
			const res = await fetch(`/api/admin/shop/categories/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			if (!res.ok) throw new Error('Failed to update category');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/admin/shop/categories'] });
			closeDialog();
		}
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/admin/shop/categories/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Failed to delete category');
			return res.json();
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/admin/shop/categories'] })
	});

	const openCreateDialog = () => {
		setEditing(null);
		setIsDialogOpen(true);
		form.reset({
			name: '',
			slug: '',
			description: '',
			bgColor: '#000000',
			textColor: '#ffffff',
			iconUrl: '',
			allowedRarities: [],
			isActive: true
		});
	};

	const openEditDialog = (cat: Category) => {
		setEditing(cat);
		setIsDialogOpen(true);
		form.reset({
			...cat,
			allowedRarities: cat.allowedRarities || []
		} as any);
	};

	const closeDialog = () => setIsDialogOpen(false);

	const form = useForm<z.infer<typeof CategorySchema>>({
		resolver: zodResolver(CategorySchema),
		defaultValues: {
			name: '',
			slug: '',
			description: '',
			bgColor: '#000000',
			textColor: '#ffffff',
			iconUrl: '',
			allowedRarities: [],
			isActive: true
		}
	});

	const onSubmit = form.handleSubmit((data) => {
		if (editing) {
			updateMutation.mutate({ id: editing.id, ...data });
		} else {
			createMutation.mutate(data);
		}
	});

	const ColorPreview = ({ bg, text }: { bg?: string | null; text?: string | null }) => (
		<Badge
			className={cn('border', 'px-2 py-1')}
			style={{ backgroundColor: bg || '#000', color: text || '#fff' }}
		>
			Preview
		</Badge>
	);

	const pageActions = (
		<Button onClick={openCreateDialog}>
			<Plus className="h-4 w-4 mr-2" /> New Category
		</Button>
	);

	return (
		<AdminPageShell title="Cosmetic Categories" pageActions={pageActions}>
			{isLoading ? (
				<p>Loading…</p>
			) : isError ? (
				<p className="text-red-500">Failed to load categories</p>
			) : (
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Colors</TableHead>
								<TableHead>Rarities</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{categories.map((cat) => (
								<TableRow key={cat.id}>
									<TableCell>{cat.name}</TableCell>
									<TableCell>{cat.slug}</TableCell>
									<TableCell className="max-w-xs truncate">{cat.description}</TableCell>
									<TableCell>
										<ColorPreview bg={cat.bgColor} text={cat.textColor} />
									</TableCell>
									<TableCell>
										{(cat.allowedRarities as any[] | undefined)
											?.map((id) => rarities.find((r) => r.id === id)?.name)
											.filter(Boolean)
											.join(', ')}
									</TableCell>
									<TableCell>{cat.isActive ? 'Active' : 'Inactive'}</TableCell>
									<TableCell className="text-right">
										<Button size="sm" variant="ghost" onClick={() => openEditDialog(cat)}>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											size="sm"
											variant="destructive"
											className="ml-1"
											onClick={() => deleteMutation.mutate(cat.id)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-[550px]">
					<DialogHeader>
						<DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle>
					</DialogHeader>

					<form onSubmit={onSubmit} className="space-y-4">
						<Input placeholder="Name" {...form.register('name')} />
						<Input placeholder="Slug" {...form.register('slug')} />
						<Input placeholder="Description" {...form.register('description')} />

						<div className="flex gap-4">
							<div className="flex-1">
								<label className="text-sm block mb-1">Background Color</label>
								<Input type="color" {...form.register('bgColor')} />
							</div>
							<div className="flex-1">
								<label className="text-sm block mb-1">Text Color</label>
								<Input type="color" {...form.register('textColor')} />
							</div>
						</div>

						<Input placeholder="Icon URL" {...form.register('iconUrl')} />

						{/* Allowed rarities selector */}
						<NumericAccessSelector
							label="Allowed Rarities"
							selectedIds={form.watch('allowedRarities') || []}
							onChange={(ids) => form.setValue('allowedRarities', ids)}
							className="mt-2"
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={closeDialog}>
								Cancel
							</Button>
							<Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
								{editing ? 'Save' : 'Create'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</AdminPageShell>
	);
}
