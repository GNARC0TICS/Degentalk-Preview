import React, { useState, useEffect } from 'react';
// Assuming admin-layout.tsx is in pages/admin/
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient'; // As per api-client-pattern.mdc
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import type { Product } from '@schema'; // Assuming Product type can be imported

// Helper to format pluginReward for display
const formatPluginReward = (reward: any) => {
	if (!reward) return 'N/A';
	if (typeof reward === 'string') {
		try {
			reward = JSON.parse(reward);
		} catch (e) {
			return reward; // Show raw string if not valid JSON
		}
	}
	return JSON.stringify(reward, null, 2);
};

export default function AdminShopItemsPage() {
	const queryClient = useQueryClient();

	const {
		data: products,
		isLoading,
		isError,
		error
	} = useQuery<Product[], Error>({
		queryKey: ['adminShopItems'],
		queryFn: async () => {
			return apiRequest<Product[]>({ url: '/api/admin/shop-management/items' });
		}
	});

	const deleteMutation = useMutation<any, Error, number>({
		mutationFn: (productId) => {
			return apiRequest({ url: `/api/admin/shop-management/items/${productId}`, method: 'DELETE' });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['adminShopItems'] });
			// TODO: Add toast notification for success
		},
		onError: (error) => {
			// TODO: Add toast notification for error
			console.error('Error deleting product:', error);
		}
	});

	const handleDelete = (productId: number) => {
		if (window.confirm('Are you sure you want to archive this item?')) {
			deleteMutation.mutate(productId);
		}
	};

	if (isLoading) return <div className="p-4">Loading shop items...</div>;
	if (isError) return <div className="p-4 text-red-500">Error loading items: {error?.message}</div>;

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-semibold text-white">Shop Items Management</h1>
				<Link href="/admin/shop/edit/new">
					<Button className="bg-emerald-600 hover:bg-emerald-500">
						<PlusCircle className="mr-2 h-4 w-4" /> Add New Item
					</Button>
				</Link>
			</div>

			<div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-md">
				<table className="min-w-full divide-y divide-zinc-700">
					<thead className="bg-zinc-800">
						<tr>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider"
							>
								ID
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider"
							>
								Name
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider"
							>
								Price (DGT)
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider"
							>
								Stock
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider"
							>
								Status
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider"
							>
								Plugin Reward
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider"
							>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-zinc-900 divide-y divide-zinc-800">
						{products?.map((product) => (
							<tr key={product.id}>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">{product.id}</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
									{product.name}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
									{product.price}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
									{product.stockLimit === null ? 'Unlimited' : product.stock}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm">
									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'published' && !product.isDeleted ? 'bg-green-800 text-green-300' : 'bg-red-800 text-red-300'}
                                     ${product.isDeleted ? 'bg-yellow-800 text-yellow-300' : ''}
                    `}
									>
										{product.isDeleted ? 'Archived' : product.status}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500">
									<pre className="max-w-xs overflow-x-auto bg-zinc-800 p-1 rounded text-[10px]">
										{formatPluginReward(product.pluginReward)}
									</pre>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<Link href={`/admin/shop/edit/${product.id}`}>
										<Button
											variant="ghost"
											size="sm"
											className="text-blue-400 hover:text-blue-300 mr-2"
										>
											<Edit className="h-4 w-4" />
										</Button>
									</Link>
									<Button
										variant="ghost"
										size="sm"
										className="text-red-400 hover:text-red-300"
										onClick={() => handleDelete(product.id!)}
										disabled={deleteMutation.isPending}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</td>
							</tr>
						))}
						{products?.length === 0 && (
							<tr>
								<td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-500">
									No shop items found. Add some!
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
