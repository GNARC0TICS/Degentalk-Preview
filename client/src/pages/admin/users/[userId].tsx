import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, XCircle, Gift } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UserInventoryWithProduct, Product } from '@/types/inventory'; // Assuming these types

export default function AdminUserInventoryPage() {
	const params = useParams();
	const userId = params.userId;
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const [selectedItemToGrant, setSelectedItemToGrant] = useState<string | undefined>(undefined);

	// Fetch user inventory
	const {
		data: inventory,
		isLoading: isLoadingInventory,
		refetch: refetchInventory
	} = useQuery<UserInventoryWithProduct[], Error>({
		queryKey: ['userInventory', userId],
		queryFn: () => apiRequest({ url: `/api/admin/user-inventory/${userId}` }),
		enabled: !!userId
	});

	// Fetch all available shop items for granting
	const { data: shopItems, isLoading: isLoadingShopItems } = useQuery<Product[], Error>({
		queryKey: ['allShopItemsForGrant'],
		queryFn: () => apiRequest({ url: '/api/admin/shop-management/products' }) // Assuming this endpoint lists all products
	});

	// Mutation for equipping an item
	const equipMutation = useMutation<any, Error, { inventoryId: number }>({
		mutationFn: ({ inventoryId }) =>
			apiRequest({
				url: `/api/admin/user-inventory/${userId}/equip/${inventoryId}`,
				method: 'POST'
			}),
		onSuccess: () => {
			toast({ title: 'Item equipped', description: 'The item has been successfully equipped.' });
			queryClient.invalidateQueries({ queryKey: ['userInventory', userId] });
		},
		onError: (error) => {
			toast({ title: 'Error equipping item', description: error.message, variant: 'destructive' });
		}
	});

	// Mutation for unequipping an item
	const unequipMutation = useMutation<any, Error, { inventoryId: number }>({
		mutationFn: ({ inventoryId }) =>
			apiRequest({
				url: `/api/admin/user-inventory/${userId}/unequip/${inventoryId}`,
				method: 'POST'
			}),
		onSuccess: () => {
			toast({
				title: 'Item unequipped',
				description: 'The item has been successfully unequipped.'
			});
			queryClient.invalidateQueries({ queryKey: ['userInventory', userId] });
		},
		onError: (error) => {
			toast({
				title: 'Error unequipping item',
				description: error.message,
				variant: 'destructive'
			});
		}
	});

	// Mutation for granting an item
	const grantItemMutation = useMutation<any, Error, { productId: number }>({
		mutationFn: ({ productId }) =>
			apiRequest({
				url: `/api/admin/user-inventory/${userId}/grant`,
				method: 'POST',
				data: { productId, quantity: 1 } // Assuming quantity 1 for cosmetics
			}),
		onSuccess: () => {
			toast({
				title: 'Item granted',
				description: 'The item has been successfully granted to the user.'
			});
			queryClient.invalidateQueries({ queryKey: ['userInventory', userId] });
			setSelectedItemToGrant(undefined);
		},
		onError: (error) => {
			toast({ title: 'Error granting item', description: error.message, variant: 'destructive' });
		}
	});

	const handleGrantItem = () => {
		if (selectedItemToGrant) {
			grantItemMutation.mutate({ productId: parseInt(selectedItemToGrant) });
		}
	};

	if (!userId) {
		return <div className="p-4 text-red-500">User ID is missing.</div>;
	}

	return (
		<div className="p-6">
			<Link
				href="/admin/users"
				className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-4"
			>
				<ArrowLeft className="mr-2 h-4 w-4" /> Back to User List (assuming /admin/users exists)
			</Link>
			<h1 className="text-2xl font-semibold text-white mb-6">
				Manage Inventory for User ID: {userId}
			</h1>

			<div className="mb-8 p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
				<h2 className="text-xl font-semibold text-white mb-4">Grant New Item</h2>
				{isLoadingShopItems ? (
					<p>Loading shop items...</p>
				) : shopItems && shopItems.length > 0 ? (
					<div className="flex items-center space-x-2">
						<Select value={selectedItemToGrant} onValueChange={setSelectedItemToGrant}>
							<SelectTrigger className="bg-zinc-800 border-zinc-700 text-white w-full md:w-1/2">
								<SelectValue placeholder="Select an item to grant..." />
							</SelectTrigger>
							<SelectContent>
								{shopItems.map((item) => (
									<SelectItem key={item.id} value={String(item.id)}>
										{item.name} (ID: {item.id})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button
							onClick={handleGrantItem}
							disabled={!selectedItemToGrant || grantItemMutation.isPending}
							className="bg-emerald-600 hover:bg-emerald-500"
						>
							{grantItemMutation.isPending ? 'Granting...' : <Gift className="mr-2 h-4 w-4" />}
							{grantItemMutation.isPending ? '' : 'Grant Item'}
						</Button>
					</div>
				) : (
					<p>No shop items available to grant or failed to load.</p>
				)}
			</div>

			<div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
				<h2 className="text-xl font-semibold text-white mb-4">User's Current Inventory</h2>
				{isLoadingInventory ? (
					<p>Loading inventory...</p>
				) : inventory && inventory.length > 0 ? (
					<ul className="space-y-3">
						{inventory.map((item) => (
							<li
								key={item.id}
								className={`p-4 rounded-md flex justify-between items-center ${item.equipped ? 'bg-green-900/50 border border-green-700' : 'bg-zinc-800 border border-zinc-700'}`}
							>
								<div>
									<span className="font-semibold text-white">
										{item.product?.name || 'Unknown Item'}
									</span>
									<span className="text-xs text-zinc-400 ml-2">
										(Inv. ID: {item.id}, Prod. ID: {item.productId})
									</span>
									{item.equipped && (
										<CheckCircle className="inline-block ml-2 h-5 w-5 text-green-400" />
									)}
								</div>
								<div>
									{item.equipped ? (
										<Button
											variant="outline"
											size="sm"
											onClick={() => unequipMutation.mutate({ inventoryId: item.id })}
											disabled={
												unequipMutation.isPending &&
												unequipMutation.variables?.inventoryId === item.id
											}
											className="border-red-500 text-red-400 hover:bg-red-600 hover:text-white"
										>
											{unequipMutation.isPending &&
											unequipMutation.variables?.inventoryId === item.id
												? 'Unequipping...'
												: 'Unequip'}
										</Button>
									) : (
										<Button
											variant="outline"
											size="sm"
											onClick={() => equipMutation.mutate({ inventoryId: item.id })}
											disabled={
												equipMutation.isPending && equipMutation.variables?.inventoryId === item.id
											}
											className="border-sky-500 text-sky-400 hover:bg-sky-600 hover:text-white"
										>
											{equipMutation.isPending && equipMutation.variables?.inventoryId === item.id
												? 'Equipping...'
												: 'Equip'}
										</Button>
									)}
								</div>
							</li>
						))}
					</ul>
				) : (
					<p className="text-zinc-400">This user currently has no items in their inventory.</p>
				)}
				<Button onClick={() => refetchInventory()} className="mt-4">
					Refresh Inventory
				</Button>
			</div>
		</div>
	);
}
