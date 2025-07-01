import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { FramedAvatar } from '@/components/users/framed-avatar';
import { ShoppingBag, Sparkles, Palette, Frame, Crown, Edit } from 'lucide-react';
import { Link } from 'wouter';
import { applyPluginRewards } from '@/lib/utils/applyPluginRewards';
import type { UserInventoryWithProduct } from '@/types/inventory';
import type { InventoryId } from '@db/types';

interface CosmeticControlPanelProps {
	userId: string; // Changed to string
	username: string;
	avatarUrl: string | null;
	inventory: UserInventoryWithProduct[];
	activeFrame?: { id: number; name: string; imageUrl: string; rarity: string } | null; // IDs for frame, title, badge are numbers
	activeTitle?: { id: number; name: string; description: string | null; rarity: string } | null; // IDs for frame, title, badge are numbers
	activeBadge?: {
		id: number; // IDs for frame, title, badge are numbers
		name: string;
		description: string | null;
		iconUrl: string;
		rarity: string;
	} | null;
	onEditProfile?: () => void;
	canEdit?: boolean;
}

export function CosmeticControlPanel({
	userId,
	username,
	avatarUrl,
	inventory,
	activeFrame,
	activeTitle,
	activeBadge,
	onEditProfile,
	canEdit = true
}: CosmeticControlPanelProps) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [previewTab, setPreviewTab] = useState('post');

	// Apply plugin rewards to get current cosmetics
	const cosmetics = applyPluginRewards(inventory);

	// Mutation for equipping/unequipping items
	const toggleEquipMutation = useMutation({
		mutationFn: async ({ inventoryId, equip }: { inventoryId: InventoryId; equip: boolean }) => {
			const endpoint = equip ? 'equip' : 'unequip';
			return apiRequest({
				method: 'POST',
				url: `/api/admin/user-inventory/${inventoryId}/${endpoint}`
			});
		},
		onSuccess: (_, variables) => {
			toast({
				title: variables.equip ? 'Item Equipped' : 'Item Unequipped',
				description: variables.equip
					? 'Your cosmetic has been equipped'
					: 'Your cosmetic has been unequipped',
				variant: 'default'
			});
			queryClient.invalidateQueries({ queryKey: ['profile', username] });
			queryClient.invalidateQueries({ queryKey: ['user-inventory', userId] });
			queryClient.invalidateQueries({ queryKey: ['userCosmeticsInventory', userId] });
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: `Failed to update item: ${error.message}`,
				variant: 'destructive'
			});
		}
	});

	// Find equipped items
	const equippedItems = inventory.filter((item) => item.equipped);

	// Group items by type
	const equippedByType = {
		usernameColor: equippedItems.find(
			(item) => item.product?.pluginReward?.type === 'username_color'
		),
		avatarFrame: equippedItems.find((item) => item.product?.pluginReward?.type === 'avatar_frame'),
		userTitle: equippedItems.find((item) => item.product?.pluginReward?.type === 'user_title'),
		badge: equippedItems.find((item) => item.product?.pluginReward?.type === 'badge')
	};

	const handleUnequip = (inventoryId: InventoryId) => {
		if (!canEdit) return;
		toggleEquipMutation.mutate({ inventoryId, equip: false });
	};

	return (
		<Card className="bg-zinc-900/70 backdrop-blur-sm border-zinc-700/50">
			<CardHeader>
				<div className="flex justify-between items-center">
					<CardTitle className="text-xl flex items-center">
						<Sparkles className="mr-2 h-5 w-5 text-purple-400" />
						Cosmetics Panel
					</CardTitle>
					{onEditProfile && (
						<Button
							variant="outline"
							size="sm"
							onClick={onEditProfile}
							className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
						>
							<Edit className="mr-2 h-4 w-4" />
							Edit Profile
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Currently Equipped Section */}
				<div>
					<h3 className="text-lg font-semibold mb-4 text-purple-300">Currently Equipped</h3>
					<div className="space-y-3">
						{/* Username Color */}
						<div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30 hover:border-purple-500/30 transition-all">
							<div className="flex items-center gap-3">
								<Palette className="h-5 w-5 text-purple-400" />
								<div>
									<p className="text-sm font-medium">Username Color</p>
									{equippedByType.usernameColor ? (
										<p className="text-xs" style={{ color: cosmetics.usernameColor }}>
											{equippedByType.usernameColor.product.name}
										</p>
									) : (
										<p className="text-xs text-zinc-500">Default</p>
									)}
								</div>
							</div>
							{equippedByType.usernameColor && canEdit && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleUnequip(equippedByType.usernameColor!.id)}
									disabled={toggleEquipMutation.isPending}
									className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
								>
									Unequip
								</Button>
							)}
						</div>

						{/* Avatar Frame */}
						<div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30 hover:border-cyan-500/30 transition-all">
							<div className="flex items-center gap-3">
								<Frame className="h-5 w-5 text-cyan-400" />
								<div>
									<p className="text-sm font-medium">Avatar Frame</p>
									{activeFrame ? (
										<p className="text-xs text-zinc-300">{activeFrame.name}</p>
									) : (
										<p className="text-xs text-zinc-500">None</p>
									)}
								</div>
							</div>
							{equippedByType.avatarFrame && canEdit && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleUnequip(equippedByType.avatarFrame!.id)}
									disabled={toggleEquipMutation.isPending}
									className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
								>
									Unequip
								</Button>
							)}
						</div>

						{/* User Title */}
						<div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30 hover:border-violet-500/30 transition-all">
							<div className="flex items-center gap-3">
								<Crown className="h-5 w-5 text-violet-400" />
								<div>
									<p className="text-sm font-medium">User Title</p>
									{activeTitle ? (
										<p
											className={cn(
												'text-xs',
												activeTitle.rarity === 'legendary'
													? 'text-amber-400'
													: activeTitle.rarity === 'epic'
														? 'text-purple-400'
														: activeTitle.rarity === 'rare'
															? 'text-blue-400'
															: 'text-zinc-300'
											)}
										>
											{activeTitle.name}
										</p>
									) : (
										<p className="text-xs text-zinc-500">None</p>
									)}
								</div>
							</div>
							{equippedByType.userTitle && canEdit && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleUnequip(equippedByType.userTitle!.id)}
									disabled={toggleEquipMutation.isPending}
									className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
								>
									Unequip
								</Button>
							)}
						</div>
					</div>
				</div>

				<Separator className="bg-zinc-700/50" />

				{/* Preview Section */}
				<div>
					<h3 className="text-lg font-semibold mb-4 text-emerald-300">Preview</h3>
					<Tabs value={previewTab} onValueChange={setPreviewTab}>
						<TabsList className="grid grid-cols-3 w-full bg-zinc-800/50">
							<TabsTrigger
								value="post"
								className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400"
							>
								Forum Post
							</TabsTrigger>
							<TabsTrigger
								value="shoutbox"
								className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400"
							>
								Shoutbox
							</TabsTrigger>
							<TabsTrigger
								value="profile"
								className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400"
							>
								Profile Card
							</TabsTrigger>
						</TabsList>

						<TabsContent value="post" className="mt-4">
							<PostPreview
								username={username}
								avatarUrl={avatarUrl}
								frameUrl={cosmetics.avatarFrameUrl}
								usernameColor={cosmetics.usernameColor}
								userTitle={activeTitle?.name}
								message="This is how I look in forum posts! 🎨"
							/>
						</TabsContent>

						<TabsContent value="shoutbox" className="mt-4">
							<ShoutboxPreview
								username={username}
								usernameColor={cosmetics.usernameColor}
								message="Degening hard today 🧪"
							/>
						</TabsContent>

						<TabsContent value="profile" className="mt-4">
							<ProfileCardPreview
								username={username}
								avatarUrl={avatarUrl}
								frameUrl={cosmetics.avatarFrameUrl}
								usernameColor={cosmetics.usernameColor}
								userTitle={activeTitle?.name}
							/>
						</TabsContent>
					</Tabs>
				</div>

				{/* Shop Link */}
				<div className="text-center pt-4">
					<Link href="/shop">
						<Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0 shadow-lg">
							<ShoppingBag className="mr-2 h-4 w-4" />
							Want more? Shop Cosmetics
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}

// Preview Components
function PostPreview({ username, avatarUrl, frameUrl, usernameColor, userTitle, message }: any) {
	return (
		<div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/30">
			<div className="flex gap-3">
				<FramedAvatar avatarUrl={avatarUrl} frameUrl={frameUrl} username={username} size="sm" />
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<span className="font-semibold" style={{ color: usernameColor || '#ffffff' }}>
							{username}
						</span>
						{userTitle && (
							<Badge
								variant="secondary"
								className="text-xs bg-purple-900/50 text-purple-300 border-purple-500/30"
							>
								{userTitle}
							</Badge>
						)}
					</div>
					<p className="text-sm text-zinc-300">{message}</p>
				</div>
			</div>
		</div>
	);
}

function ShoutboxPreview({ username, usernameColor, message }: any) {
	return (
		<div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/30">
			<div className="flex items-center gap-2">
				<span className="font-medium text-sm" style={{ color: usernameColor || '#ffffff' }}>
					{username}:
				</span>
				<span className="text-sm text-zinc-300">{message}</span>
			</div>
		</div>
	);
}

function ProfileCardPreview({ username, avatarUrl, frameUrl, usernameColor, userTitle }: any) {
	return (
		<div className="bg-zinc-800/50 rounded-lg p-6 text-center border border-zinc-700/30">
			<FramedAvatar
				avatarUrl={avatarUrl}
				frameUrl={frameUrl}
				username={username}
				size="lg"
				className="mx-auto mb-3"
			/>
			<h3 className="text-xl font-bold mb-1" style={{ color: usernameColor || '#ffffff' }}>
				{username}
			</h3>
			{userTitle && (
				<Badge
					variant="secondary"
					className="text-sm bg-purple-900/50 text-purple-300 border-purple-500/30"
				>
					{userTitle}
				</Badge>
			)}
		</div>
	);
}
