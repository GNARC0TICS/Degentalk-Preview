import React, { useState } from 'react';
import type { ShopItem } from '@/hooks/use-shop-items';
import { useShopItemOwnership } from '@/hooks/use-shop-ownership';
import { useAuth } from '@/hooks/use-auth';
import {
	BadgeCheck,
	Lock,
	ShoppingCart,
	Coins,
	DollarSign,
	Check,
	Clock,
	AlertTriangle,
	Star,
	LogIn
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loader';
import { logger } from '@/lib/logger';

interface ShopItemCardProps {
	item: ShopItem;
	onPurchaseClick: (item: ShopItem) => Promise<void>;
}

export function ShopItemCard({ item, onPurchaseClick }: ShopItemCardProps) {
	const { user } = useAuth();
	const { toast } = useToast();
	const isAuthenticated = !!user;
	const [isPurchasing, setIsPurchasing] = useState(false);

	// Check if user owns this item
	const {
		isOwned,
		isLoading: ownershipLoading,
		isAuthenticated: ownershipAuth
	} = useShopItemOwnership(item.id);

	// Determine rarity color classes
	const rarityClasses = {
		common: 'border-zinc-700 hover:border-zinc-600',
		rare: 'border-blue-900/50 hover:border-blue-800',
		legendary: 'border-amber-900/50 hover:border-amber-800/80'
	}[item.rarity];

	// If item is locked, show XP requirement
	const isLocked = item.isLocked && item.requiredXP;

	// Availability status checks
	const now = new Date();
	const isAvailableFromFuture = item.availableFrom && new Date(item.availableFrom) > now;
	const isAvailableUntilPast = item.availableUntil && new Date(item.availableUntil) < now;
	const isSoldOut = typeof item.stockLimit === 'number' && item.stockLimit <= 0;
	const isFeatured = item.isFeatured || (item.featuredUntil && new Date(item.featuredUntil) > now);
	const hasPromotion = item.promotionLabel && item.promotionLabel.length > 0;

	// Handle login prompt
	const handleLoginPrompt = () => {
		toast({
			title: 'Login Required',
			description: 'You need to login or create an account to purchase items',
			variant: 'default'
		});
	};

	// Handle purchase with loading state
	const handlePurchaseClick = async () => {
		setIsPurchasing(true);
		try {
			await onPurchaseClick(item);
			// Success toast or state update would likely happen in the parent component's mutation handler
		} catch (error) {
			// Error toast is likely handled by the mutation hook in the parent
			logger.error('ShopItemCard', 'Purchase failed:', error);
		} finally {
			setIsPurchasing(false);
		}
	};

	return (
		<Card
			className={`bg-zinc-900 ${rarityClasses} transition-all duration-200 hover:shadow-lg hover:shadow-emerald-900/10 overflow-hidden flex flex-col`}
		>
			<div className="pt-4 px-4 relative">
				{/* Item Image or Placeholder */}
				<div className="w-full aspect-square bg-black/50 rounded-md overflow-hidden mb-4 flex items-center justify-center">
					{item.imageUrl ? (
						<img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
					) : (
						<ShoppingCart className="h-12 w-12 text-zinc-700" />
					)}
				</div>

				{/* Rarity Badge */}
				<Badge
					className={`
            absolute top-6 right-6 uppercase text-[10px]
            ${item.rarity === 'common' ? 'bg-zinc-800 hover:bg-zinc-700' : ''}
            ${item.rarity === 'rare' ? 'bg-blue-900 hover:bg-blue-800' : ''}
            ${item.rarity === 'legendary' ? 'bg-amber-900 hover:bg-amber-800' : ''}
          `}
				>
					{item.rarity}
				</Badge>

				{/* Owned Status */}
				{isOwned && (
					<div className="absolute top-6 left-6">
						<Badge className="bg-emerald-900 hover:bg-emerald-800 flex items-center gap-1 text-[10px]">
							<Check className="h-3 w-3" />
							{item.isEquipped ? 'EQUIPPED' : 'OWNED'}
						</Badge>
					</div>
				)}

				{/* Locked Status */}
				{isLocked && (
					<div className="absolute top-[calc(50%-24px)] left-[calc(50%-24px)]">
						<div className="w-12 h-12 rounded-full bg-black/80 flex items-center justify-center">
							<Lock className="h-6 w-6 text-zinc-400" />
						</div>
					</div>
				)}

				{/* Item Name and Description */}
				<h3 className="font-bold text-lg mb-1 truncate">{item.name}</h3>
				<p className="text-zinc-400 text-sm mb-3 line-clamp-2">{item.description}</p>
			</div>

			<CardContent className="pb-2 pt-0 px-4">
				{/* Item Pricing */}
				<div className="flex items-center gap-4">
					<div className="flex items-center text-emerald-500 font-medium">
						<Coins className="h-4 w-4 mr-1" />
						<span>{item.priceDGT}</span>
					</div>
					{typeof item.priceUSDT === 'number' && (
						<div className="text-blue-500 text-xs flex items-center">
							<DollarSign className="h-3 w-3 mr-0.5" />
							{item.priceUSDT.toFixed(2)}
						</div>
					)}
				</div>
			</CardContent>

			<CardFooter className="px-4 pb-4 mt-auto">
				{isLocked ? (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="w-full">
									<Button
										variant="outline"
										className="w-full bg-zinc-800 border-zinc-700 hover:bg-zinc-700 cursor-not-allowed opacity-80"
										disabled
									>
										<Lock className="h-4 w-4 mr-2" />
										<span className="truncate">
											Requires {item.requiredXP?.toLocaleString()} XP
										</span>
									</Button>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Earn more XP to unlock this item</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				) : isOwned ? (
					<Button
						variant="outline"
						className="w-full bg-zinc-800 border-zinc-700"
						disabled={item.isEquipped}
					>
						{item.isEquipped ? (
							<>
								<BadgeCheck className="h-4 w-4 mr-2 text-emerald-500" />
								Equipped
							</>
						) : (
							'Equip'
						)}
					</Button>
				) : !isAuthenticated ? (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									onClick={handleLoginPrompt}
									className="w-full bg-zinc-800 hover:bg-zinc-700 border-zinc-700 transition-all"
								>
									<LogIn className="h-4 w-4 mr-2" />
									Sign in to purchase
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>You need to login to purchase items</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				) : (
					<Button
						onClick={handlePurchaseClick}
						disabled={isPurchasing}
						className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition-all"
					>
						{isPurchasing ? (
							<LoadingSpinner size="sm" className="mr-2" color="zinc" />
						) : (
							<ShoppingCart className="h-4 w-4 mr-2" />
						)}
						{isPurchasing ? 'Processing...' : 'Purchase'}
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
