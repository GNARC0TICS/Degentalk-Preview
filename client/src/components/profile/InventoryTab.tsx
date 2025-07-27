import React from 'react';
import { useUserInventory } from '@/hooks/useUserInventory';
import type { ProfileData } from '@/types/profile';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge as UIBadge } from '@/components/ui/badge';
import { rarityColorMap } from '@/config/rarity.config';

interface Props {
	profile: ProfileData;
}

const COSMETIC_GROUPS: { key: string; label: string }[] = [
	{ key: 'avatar_frame', label: 'Avatar Frames' },
	{ key: 'user_title', label: 'Titles' },
	{ key: 'badge', label: 'Badges' },
	{ key: 'sticker', label: 'Stickers' },
	{ key: 'username_color', label: 'Username Colors' }
];

export default function InventoryTab({ profile }: Props) {
	const { data: inventory = [], isLoading } = useUserInventory(profile.id);

	// Group items by pluginReward.type if available else category fallback
	const grouped: Record<string, any[]> = {};

	for (const item of inventory) {
		const type = (item.product?.pluginReward?.type ?? item.product?.category ?? 'misc') as string;
		if (!grouped[type]) grouped[type] = [];
		grouped[type].push(item);
	}

	if (isLoading) {
		return (
			<div className="space-y-6">
				<h3 className="text-lg font-semibold text-zinc-200">Inventory</h3>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton key={i} className="h-32 rounded-lg bg-zinc-800/70" />
					))}
				</div>
			</div>
		);
	}

	if (!inventory || inventory.length === 0) {
		return <div className="text-zinc-500 italic">No items in inventory</div>;
	}

	const renderCard = (item: any) => {
		const equipped = item.equipped;
		const rarity = (item.product?.pluginReward?.rarity || 'common').toLowerCase();
		const rarityClasses =
			rarityColorMap[rarity as keyof typeof rarityColorMap] || rarityColorMap.common;

		return (
			<div
				key={item.id}
				className={`relative rounded-lg overflow-hidden border transition-all backdrop-blur-sm bg-zinc-900/70 hover:bg-zinc-900/80 ${
					equipped ? 'border-indigo-500' : 'border-zinc-700/50'
				}`}
			>
				{/* Equipped ribbon */}
				{equipped && (
					<span className="absolute -top-2 -right-8 rotate-45 bg-indigo-600 text-[10px] tracking-wider text-white px-8 py-1 shadow-lg">
						EQUIPPED
					</span>
				)}

				<div className="h-24 bg-zinc-800/70 flex items-center justify-center overflow-hidden">
					{item.product?.imageUrl ? (
						<img
							src={item.product.imageUrl}
							alt={item.product.name}
							className="object-contain h-full w-full"
						/>
					) : (
						<span className="text-zinc-400 text-xs">No Image</span>
					)}
				</div>
				<div className="p-2 space-y-1">
					<div className="text-sm font-medium text-zinc-200 truncate">{item.product?.name}</div>
					<div className="text-xs text-zinc-400 capitalize">
						{item.product?.pluginReward?.type || item.product?.category}
					</div>
					<UIBadge className={`text-[10px] mt-1 ${rarityClasses}`}>{rarity}</UIBadge>
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-8">
			{COSMETIC_GROUPS.map(({ key, label }) => {
				const items = grouped[key] || [];
				if (items.length === 0) return null;

				return (
					<section key={key} className="space-y-4">
						<h4 className="text-md font-semibold text-zinc-100">{label}</h4>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{items.map(renderCard)}
						</div>
					</section>
				);
			})}
		</div>
	);
}
