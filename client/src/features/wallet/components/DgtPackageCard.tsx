import React from 'react';
import type { DgtPackage } from '@/hooks/use-dgt-packages';
import { Button } from '@/components/ui/button';
import { PumpButton } from '@/components/uiverse-clones/buttons';
import { Coins } from 'lucide-react';

interface Props {
	pkg: DgtPackage;
	onBuy: (pkg: DgtPackage) => void;
}

export const DgtPackageCard: React.FC<Props> = ({ pkg, onBuy }) => {
	const hasDiscount = pkg.discountPercentage && pkg.discountPercentage > 0;
	const originalPrice = hasDiscount
		? (pkg.usdPrice / (1 - (pkg.discountPercentage ?? 0) / 100)).toFixed(2)
		: null;

	return (
		<div className="border border-zinc-800 rounded-md bg-zinc-900 p-6 space-y-4">
			<h3 className="text-xl font-semibold text-white">{pkg.name}</h3>
			{pkg.description && <p className="text-zinc-400 text-sm">{pkg.description}</p>}

			<div className="text-3xl font-bold text-white">
				${pkg.usdPrice.toFixed(2)}{' '}
				{originalPrice && (
					<span className="text-zinc-500 text-lg line-through ml-2">${originalPrice}</span>
				)}
			</div>
			{hasDiscount && (
				<div className="text-emerald-400 text-sm">
					Save {pkg.discountPercentage?.toFixed(0)}% ($
					{(Number(originalPrice) - pkg.usdPrice).toFixed(2)})
				</div>
			)}

			<div className="flex items-center text-white space-x-2 pt-2">
				<Coins className="h-5 w-5 text-amber-400" />
				<span className="font-medium">{pkg.dgtAmount.toLocaleString()} DGT</span>
			</div>

			<PumpButton variant="pump" className="w-full mt-4" onClick={() => onBuy(pkg)} pulse>
				Buy Now
			</PumpButton>
		</div>
	);
};
