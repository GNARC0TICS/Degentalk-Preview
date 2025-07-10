import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApiService, type MediaItem } from '@/features/admin/services/media-api.service';
import {
	animationPackApiService,
	type PackPayload
} from '@/features/admin/services/animation-pack-api.service';
import { AdminPageShell } from '@/features/admin/components/layout/AdminPageShell';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectItem,
	SelectTrigger,
	SelectContent,
	SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const rarityOptions = [
	{ value: 'cope', label: 'Cope' },
	{ value: 'mid', label: 'Mid' },
	{ value: 'exit', label: 'Exit Liquidity' },
	{ value: 'mythic', label: 'Mythic' }
];

export default function PackBuilderPage() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const { data: animations = [] } = useQuery<MediaItem[]>({
		queryKey: ['admin-animations'],
		queryFn: () => mediaApiService.listLottie()
	});

	const [packName, setPackName] = useState('');
	const [description, setDescription] = useState('');
	const [rarity, setRarity] = useState('cope');
	const [price, setPrice] = useState('');
	const [contents, setContents] = useState<MediaItem[]>([]);

	const createMutation = useMutation({
		mutationFn: (payload: PackPayload) => animationPackApiService.createPack(payload),
		onSuccess: () => {
			toast({ title: 'Pack saved' });
			setPackName('');
			setDescription('');
			setPrice('');
			setContents([]);
			queryClient.invalidateQueries({ queryKey: ['animation-packs'] });
		},
		onError: (err: any) =>
			toast({ title: 'Save failed', description: err?.message, variant: 'destructive' })
	});

	const addToPack = (item: MediaItem) => {
		if (contents.find((c) => c.id === item.id)) return;
		setContents([...contents, item]);
	};
	const removeFromPack = (id: string) => setContents(contents.filter((c) => c.id !== id));

	const onSave = () => {
		const payload: PackPayload = {
			name: packName,
			description,
			rarity: rarity as any,
			priceDgt: price ? Number(price) : undefined,
			isPublished: false,
			contents: contents.map((c) => c.id)
		};
		createMutation.mutate(payload);
	};

	const pageActions = (
		<Button onClick={onSave} disabled={!packName || !contents.length || createMutation.isLoading}>
			{createMutation.isLoading ? 'Saving…' : 'Save Pack'}
		</Button>
	);

	return (
		<AdminPageShell title="Pack Builder" pageActions={pageActions}>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Left column: animations list */}
				<div className="md:col-span-1 border border-zinc-800 rounded-md p-4 space-y-4 overflow-y-auto max-h-[70vh]">
					<h3 className="font-semibold">Animations</h3>
					<div className="grid grid-cols-3 gap-3">
						{animations.map((a) => (
							<div
								key={a.id}
								className="border border-zinc-700 rounded-md p-1 hover:border-zinc-500 cursor-pointer"
								onClick={() => addToPack(a)}
								title="Add to pack"
							>
								<DotLottieReact src={a.url} autoplay loop style={{ width: 64, height: 64 }} />
							</div>
						))}
					</div>
				</div>

				{/* Middle column: pack settings */}
				<div className="md:col-span-1 border border-zinc-800 rounded-md p-4 space-y-4">
					<h3 className="font-semibold">Pack Details</h3>
					<div className="space-y-2">
						<Input
							placeholder="Name"
							value={packName}
							onChange={(e) => setPackName(e.target.value)}
						/>
						<Textarea
							placeholder="Description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
						<Select value={rarity} onValueChange={setRarity}>
							<SelectTrigger>
								<SelectValue placeholder="Select rarity" />
							</SelectTrigger>
							<SelectContent>
								{rarityOptions.map((o) => (
									<SelectItem key={o.value} value={o.value}>
										{o.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Input
							placeholder="Price (DGT) optional"
							value={price}
							onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
						/>
					</div>
				</div>

				{/* Right column: contents */}
				<div className="md:col-span-1 border border-zinc-800 rounded-md p-4 space-y-4 overflow-y-auto max-h-[70vh]">
					<h3 className="font-semibold">Pack Contents ({contents.length})</h3>
					{contents.length === 0 && (
						<p className="text-sm text-zinc-400">Select animations to add</p>
					)}
					<div className="grid grid-cols-3 gap-3">
						{contents.map((c) => (
							<div key={c.id} className="relative border border-zinc-700 rounded-md p-1 group">
								<DotLottieReact src={c.url} autoplay loop style={{ width: 64, height: 64 }} />
								<button
									className="absolute -top-1 -right-1 bg-red-600 rounded-full text-xs px-1 opacity-0 group-hover:opacity-100"
									onClick={() => removeFromPack(c.id)}
								>
									×
								</button>
							</div>
						))}
					</div>
				</div>
			</div>
		</AdminPageShell>
	);
}
