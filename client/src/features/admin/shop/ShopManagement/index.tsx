import React, { useState, useEffect } from 'react';
// Assuming admin-layout.tsx is in pages/admin/
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { apiRequest } from '@/utils/queryClient'; // As per api-client-pattern.mdc
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { AdminPageShell } from '@/features/admin/components/layout/AdminPageShell';
import { AdminDataTable } from '@/features/admin/components/common/AdminDataTable';
import type { ColumnDef } from '@/features/admin/components/layout/EntityTable';
import { Badge } from '@/components/ui/badge';
import type { UserId } from '@shared/types/ids';

// Local Product shape (minimal) – avoids server schema coupling
interface Product {
	id: UserId; // Using UserId as required by AdminDataTable
	name: string;
	price: number;
	stock: number;
	stockLimit: number | null;
	status: 'draft' | 'published' | string;
	isDeleted?: boolean;
	pluginReward?: any;
}

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
		},
		onError: (error) => {
			console.error('Error deleting product:', error);
		}
	});

	const handleDelete = (productId: string) => {
		if (window.confirm('Are you sure you want to archive this item?')) {
			deleteMutation.mutate(productId);
		}
	};

	const getStatusBadge = (product: Product) => {
		if (product.isDeleted) {
			return <Badge variant="destructive">Archived</Badge>;
		}
		return product.status === 'published' ? (
			<Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
		) : (
			<Badge variant="outline">Draft</Badge>
		);
	};

	const columns: ColumnDef<Product>[] = [
		{ key: 'id', header: 'ID', render: (product) => product.id },
		{
			key: 'name',
			header: 'Name',
			render: (product) => <span className="font-medium">{product.name}</span>
		},
		{ key: 'price', header: 'Price (DGT)', render: (product) => product.price },
		{
			key: 'stock',
			header: 'Stock',
			render: (product) => (product.stockLimit === null ? 'Unlimited' : product.stock)
		},
		{ key: 'status', header: 'Status', render: (product) => getStatusBadge(product) },
		{
			key: 'pluginReward',
			header: 'Plugin Reward',
			render: (product) => (
				<pre className="max-w-xs overflow-x-auto bg-admin-surface p-2 rounded text-xs text-admin-text-secondary">
					{formatPluginReward(product.pluginReward)}
				</pre>
			)
		}
	];

	const renderActions = (product: Product) => (
		<div className="flex gap-2">
			<Link href={`/admin/shop/edit/${product.id}`}>
				<Button variant="outline" size="sm">
					<Edit className="h-4 w-4 mr-1" /> Edit
				</Button>
			</Link>
			<Button
				variant="destructive"
				size="sm"
				onClick={() => handleDelete(product.id!)}
				disabled={deleteMutation.isPending}
			>
				<Trash2 className="h-4 w-4 mr-1" /> Archive
			</Button>
		</div>
	);

	const pageActions = (
		<Link href="/admin/shop/edit/new">
			<Button>
				<PlusCircle className="mr-2 h-4 w-4" /> Add New Item
			</Button>
		</Link>
	);

	return (
		<AdminPageShell title="Shop Items Management" pageActions={pageActions}>
			<AdminDataTable
				columns={columns}
				data={products || []}
				isLoading={isLoading}
				error={error}
				renderActions={renderActions}
				emptyStateMessage="No shop items found. Click 'Add New Item' to get started."
			/>
		</AdminPageShell>
	);
}
