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
import { AdminPageShell } from '@/features/admin/components/layout/AdminPageShell';
import { cn } from '@/lib/utils';

// Rarity schema
const RaritySchema = z.object({
	name: z.string().min(2).max(100),
	slug: z.string().min(2).max(100),
	hexColor: z.string().length(7), // #rrggbb
	rarityScore: z.number().int().min(1).max(100),
	isGlow: z.boolean().optional(),
	isAnimated: z.boolean().optional()
});

type Rarity = z.infer<typeof RaritySchema> & { id: string };

export default function AdminRaritiesPage() {
	const queryClient = useQueryClient();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Rarity | null>(null);

	const {
		data: rarities = [],
		isLoading,
		isError
	} = useQuery<Rarity[]>({
		queryKey: ['/admin/shop/rarities'],
		queryFn: async () => {
			const res = await fetch('/api/admin/shop/rarities');
			if (!res.ok) throw new Error('Failed to fetch rarities');
			return res.json();
		}
	});

	const createMutation = useMutation({
		mutationFn: async (data: any) => {
			const res = await fetch('/api/admin/shop/rarities', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			if (!res.ok) throw new Error('Failed to create rarity');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/admin/shop/rarities'] });
			closeDialog();
		}
	});

	const updateMutation = useMutation({
		mutationFn: async ({ id, ...data }: any) => {
			const res = await fetch(`/api/admin/shop/rarities/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			if (!res.ok) throw new Error('Failed to update rarity');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/admin/shop/rarities'] });
			closeDialog();
		}
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/admin/shop/rarities/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Failed to delete rarity');
			return res.json();
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/admin/shop/rarities'] })
	});

	const openCreateDialog = () => {
		setEditing(null);
		setIsDialogOpen(true);
		form.reset({
			name: '',
			slug: '',
			hexColor: '#ffffff',
			rarityScore: 1,
			isGlow: false,
			isAnimated: false
		});
	};

	const openEditDialog = (rarity: Rarity) => {
		setEditing(rarity);
		setIsDialogOpen(true);
		form.reset(rarity);
	};

	const closeDialog = () => setIsDialogOpen(false);

	const form = useForm<z.infer<typeof RaritySchema>>({
		resolver: zodResolver(RaritySchema),
		defaultValues: {
			name: '',
			slug: '',
			hexColor: '#ffffff',
			rarityScore: 1,
			isGlow: false,
			isAnimated: false
		}
	});

	const onSubmit = form.handleSubmit((data) => {
		if (editing) {
			updateMutation.mutate({ id: editing.id, ...data });
		} else {
			createMutation.mutate(data);
		}
	});

	const ColorBadge = ({ color }: { color: string }) => (
		<Badge className="px-3" style={{ backgroundColor: color, color: '#fff' }}>
			{color}
		</Badge>
	);

	const pageActions = (
		<Button onClick={openCreateDialog}>
			<Plus className="h-4 w-4 mr-2" /> New Rarity
		</Button>
	);

	return (
		<AdminPageShell title="Rarities" pageActions={pageActions}>
			{isLoading ? (
				<p>Loading…</p>
			) : isError ? (
				<p className="text-red-500">Failed to load rarities</p>
			) : (
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>Color</TableHead>
								<TableHead>Score</TableHead>
								<TableHead>FX</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rarities.map((r) => (
								<TableRow key={r.id}>
									<TableCell>{r.name}</TableCell>
									<TableCell>{r.slug}</TableCell>
									<TableCell>
										<ColorBadge color={r.hexColor} />
									</TableCell>
									<TableCell>{r.rarityScore}</TableCell>
									<TableCell>
										{r.isGlow && <span>Glow </span>}
										{r.isAnimated && <span>Animated</span>}
									</TableCell>
									<TableCell className="text-right">
										<Button size="sm" variant="ghost" onClick={() => openEditDialog(r)}>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											size="sm"
											variant="destructive"
											className="ml-1"
											onClick={() => deleteMutation.mutate(r.id)}
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
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>{editing ? 'Edit Rarity' : 'New Rarity'}</DialogTitle>
					</DialogHeader>

					<form onSubmit={onSubmit} className="space-y-4">
						<Input placeholder="Name" {...form.register('name')} />
						<Input placeholder="Slug" {...form.register('slug')} />

						<div>
							<label className="text-sm block mb-1">Color</label>
							<Input type="color" {...form.register('hexColor')} />
						</div>

						<Input
							type="number"
							placeholder="Rarity Score (1-100)"
							{...form.register('rarityScore', { valueAsNumber: true })}
						/>

						<div className="flex gap-4">
							<label className="flex items-center gap-2 text-sm">
								<input type="checkbox" {...form.register('isGlow')} /> Glow
							</label>
							<label className="flex items-center gap-2 text-sm">
								<input type="checkbox" {...form.register('isAnimated')} /> Animated
							</label>
						</div>

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
