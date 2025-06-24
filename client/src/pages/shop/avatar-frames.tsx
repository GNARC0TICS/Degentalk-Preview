import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { frameRarityConfig } from '@/config/frames.config';
import { FramedAvatar } from '@/components/users/framed-avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loader';
import { Coins, Check, Sparkles } from 'lucide-react';

interface StoreFrame {
	id: number;
	name: string;
	imageUrl: string;
	rarity: keyof typeof frameRarityConfig;
	animated: boolean;
	price: number;
	productId: number;
}

export default function AvatarFramesShopPage() {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [activeEquipped, setActiveEquipped] = useState<number | null>(null);
	const [ownedFrames, setOwnedFrames] = useState<Set<number>>(new Set());

	// Fetch frames for sale
	const {
		data: frames = [],
		isLoading,
		error
	} = useQuery<StoreFrame[]>({
		queryKey: ['shop', 'avatar-frames'],
		queryFn: () => apiRequest({ url: '/api/store/avatar-frames' })
	});

	// Purchase mutation
	const purchaseMutation = useMutation<{ success: boolean }, Error, number>({
		mutationFn: (frameId: number) =>
			apiRequest({ url: `/api/store/avatar-frames/${frameId}/purchase`, method: 'POST' }),
		onSuccess: (_data, frameId) => {
			setOwnedFrames((prev) => new Set(prev).add(frameId));
			toast({ title: 'Purchased', description: 'Frame purchased successfully!' });
		},
		onError: (e) => {
			toast({ title: 'Error', description: e.message, variant: 'destructive' });
		}
	});

	// Equip mutation
	const equipMutation = useMutation<{ success: boolean }, Error, number>({
		mutationFn: (frameId: number) =>
			apiRequest({ url: `/api/users/me/frames/${frameId}/equip`, method: 'POST' }),
		onSuccess: (_data, frameId) => {
			setActiveEquipped(frameId);
			toast({ title: 'Equipped', description: 'Avatar frame equipped!' });
		},
		onError: (e) => {
			toast({ title: 'Error', description: e.message, variant: 'destructive' });
		}
	});

	const handleBuy = (frameId: number) => {
		purchaseMutation.mutate(frameId);
	};

	const handleEquip = (frameId: number) => {
		equipMutation.mutate(frameId);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-60">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (error) {
		return <p className="text-center text-red-500">Failed to load frames.</p>;
	}

	return (
		<div className="container mx-auto py-10">
			<h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
				<Sparkles className="h-6 w-6 text-yellow-400" /> Avatar Frames
			</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{frames.map((frame) => {
					const rarityCfg = frameRarityConfig[frame.rarity];
					const owned = ownedFrames.has(frame.id);
					const equipped = activeEquipped === frame.id;
					return (
						<Card key={frame.id} className="bg-zinc-900 border-zinc-700">
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									{frame.name}
									<Badge style={{ backgroundColor: rarityCfg.borderColor }}>{frame.rarity}</Badge>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex justify-center mb-4">
									<FramedAvatar
										avatarUrl={null}
										frameUrl={frame.imageUrl}
										username={frame.name}
										size="lg"
									/>
								</div>
								<div className="flex items-center justify-center gap-1 text-emerald-400 font-semibold">
									<Coins className="h-4 w-4" /> {frame.price}
								</div>
							</CardContent>
							<CardFooter>
								{owned ? (
									<Button
										className="w-full"
										variant={equipped ? 'secondary' : 'default'}
										disabled={equipped || equipMutation.isPending}
										onClick={() => handleEquip(frame.id)}
									>
										{equipped ? (
											<>
												<Check className="h-4 w-4 mr-1" /> Equipped
											</>
										) : (
											'Equip'
										)}
									</Button>
								) : (
									<Button
										className="w-full"
										disabled={purchaseMutation.isPending}
										onClick={() => handleBuy(frame.id)}
									>
										Buy
									</Button>
								)}
							</CardFooter>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
