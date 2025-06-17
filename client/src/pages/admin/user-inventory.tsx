import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Package, Sparkles, Crown, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserInventoryItem {
	id: number;
	userId: string; // Changed to string
	productId: number;
	quantity: number;
	equipped: boolean;
	productName: string;
	productPluginReward: any;
	acquiredAt: string;
	updatedAt: string;
}

interface Product {
	id: number;
	name: string;
	description?: string;
	pluginReward?: any;
	metadata?: any;
	price: number;
}

export default function AdminUserInventoryPage() {
	const params = useParams<{ userId: string }>();
	const userId = params.userId; // userId is already a string
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [selectedProductId, setSelectedProductId] = useState<string>('');

	// Fetch user's inventory
	const { data: inventory, isLoading: loadingInventory } = useQuery({
		queryKey: ['/api/admin/user-inventory', userId],
		queryFn: () =>
			apiRequest<UserInventoryItem[]>({
				url: `/api/admin/user-inventory/${userId}`
			})
	});

	// Fetch all available products for granting
	const { data: products, isLoading: loadingProducts } = useQuery({
		queryKey: ['/api/admin/shop-management/products'],
		queryFn: () =>
			apiRequest<Product[]>({
				url: '/api/admin/shop-management/products'
			})
	});

	// Fetch user details
	const { data: userData } = useQuery({
		queryKey: ['/api/users', userId],
		queryFn: () =>
			apiRequest<{ username: string }>({
				url: `/api/users/${userId}`
			})
	});

	// Grant item mutation
	const grantMutation = useMutation({
		mutationFn: (productId: number) =>
			apiRequest({
				url: `/api/admin/user-inventory/${userId}/grant`,
				method: 'POST',
				data: { productId }
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/user-inventory', userId] });
			toast({
				title: 'Item granted',
				description: "The item has been added to the user's inventory."
			});
			setSelectedProductId('');
		},
		onError: (error: Error) => {
			toast({
				title: 'Failed to grant item',
				description: error.message || 'An error occurred',
				variant: 'destructive'
			});
		}
	});

	// Equip item mutation
	const equipMutation = useMutation({
		mutationFn: (inventoryItemId: number) =>
			apiRequest({
				url: `/api/admin/user-inventory/${userId}/${inventoryItemId}/equip`,
				method: 'POST'
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/user-inventory', userId] });
			toast({
				title: 'Item equipped',
				description: 'The item has been equipped successfully.'
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Failed to equip item',
				description: error.message || 'An error occurred',
				variant: 'destructive'
			});
		}
	});

	// Unequip item mutation
	const unequipMutation = useMutation({
		mutationFn: (inventoryItemId: number) =>
			apiRequest({
				url: `/api/admin/user-inventory/${userId}/${inventoryItemId}/unequip`,
				method: 'POST'
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/user-inventory', userId] });
			toast({
				title: 'Item unequipped',
				description: 'The item has been unequipped successfully.'
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Failed to unequip item',
				description: error.message || 'An error occurred',
				variant: 'destructive'
			});
		}
	});

	const handleGrantItem = () => {
		if (selectedProductId) {
			grantMutation.mutate(parseInt(selectedProductId));
		}
	};

	const getCosmeticIcon = (type: string) => {
		switch (type) {
			case 'usernameColor':
			case 'userTitle':
				return <Crown className="h-4 w-4" />;
			case 'avatarFrame':
				return <Sparkles className="h-4 w-4" />;
			default:
				return <Package className="h-4 w-4" />;
		}
	};

	const getRarityColor = (rarity: string) => {
		switch (rarity) {
			case 'legendary':
				return 'text-yellow-500 border-yellow-500';
			case 'epic':
				return 'text-purple-500 border-purple-500';
			case 'rare':
				return 'text-blue-500 border-blue-500';
			case 'uncommon':
				return 'text-green-500 border-green-500';
			default:
				return 'text-gray-500 border-gray-500';
		}
	};

	if (loadingInventory || loadingProducts) {
		return (
			<div className="p-4">Loading...</div>
		);
	}

	return (
		<div className="p-6">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<Link href="/admin/users" className="text-zinc-400 hover:text-white">
							<ArrowLeft className="h-5 w-5" />
						</Link>
						<h1 className="text-2xl font-semibold text-white">
							{userData?.username || `User #${userId}`}'s Inventory
						</h1>
					</div>
				</div>

				{/* Grant Item Section */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Gift className="h-5 w-5 text-emerald-500" />
							Grant Item
						</CardTitle>
						<CardDescription>Add a new item to this user's inventory</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex gap-4">
							<Select value={selectedProductId} onValueChange={setSelectedProductId}>
								<SelectTrigger className="flex-1 bg-zinc-800 border-zinc-700">
									<SelectValue placeholder="Select an item to grant" />
								</SelectTrigger>
								<SelectContent>
									{products?.map((product) => {
										const alreadyOwned = inventory?.some((item) => item.productId === product.id);
										return (
											<SelectItem
												key={product.id}
												value={product.id.toString()}
												disabled={alreadyOwned}
											>
												{product.name} {alreadyOwned && '(Already owned)'}
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
							<Button
								onClick={handleGrantItem}
								disabled={!selectedProductId || grantMutation.isPending}
								className="bg-emerald-600 hover:bg-emerald-500"
							>
								Grant Item
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Inventory Grid */}
				<Card>
					<CardHeader>
						<CardTitle>Current Inventory</CardTitle>
						<CardDescription>
							Items owned by this user ({inventory?.length || 0} total)
						</CardDescription>
					</CardHeader>
					<CardContent>
						{inventory && inventory.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{inventory.map((item) => {
									const pluginReward = item.productPluginReward as any;
									const metadata = pluginReward?.metadata || {};
									const rarity = metadata.rarity || 'common';

									return (
										<div
											key={item.id}
											className={cn(
												'p-4 rounded-lg border bg-zinc-900',
												item.equipped ? 'border-emerald-500' : 'border-zinc-700'
											)}
										>
											<div className="flex items-start justify-between mb-3">
												<div>
													<h3 className="font-medium text-white flex items-center gap-2">
														{getCosmeticIcon(pluginReward?.type)}
														{item.productName}
													</h3>
													<Badge variant="outline" className={cn('mt-1', getRarityColor(rarity))}>
														{rarity}
													</Badge>
												</div>
												{item.equipped && <Badge className="bg-emerald-600">Equipped</Badge>}
											</div>

											<div className="text-sm text-zinc-400 mb-3">
												{pluginReward?.description || 'No description'}
											</div>

											<div className="flex gap-2">
												{item.equipped ? (
													<Button
														size="sm"
														variant="outline"
														onClick={() => unequipMutation.mutate(item.id)}
														disabled={unequipMutation.isPending}
														className="flex-1"
													>
														Unequip
													</Button>
												) : (
													<Button
														size="sm"
														onClick={() => equipMutation.mutate(item.id)}
														disabled={equipMutation.isPending}
														className="flex-1 bg-emerald-600 hover:bg-emerald-500"
													>
														Equip
													</Button>
												)}
											</div>

											<div className="text-xs text-zinc-500 mt-2">
												Acquired: {new Date(item.acquiredAt).toLocaleDateString()}
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className="text-center py-8 text-zinc-500">
								This user doesn't have any items yet.
							</div>
						)}
					</CardContent>
				</Card>
			</div>
	);
}
