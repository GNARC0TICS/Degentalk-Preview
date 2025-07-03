import React from 'react';
import { useDgtPackages } from '@/hooks/use-dgt-packages';
import { WalletApiService } from '@/features/wallet/services/wallet-api.service';
import { DgtPackageCard } from './DgtPackageCard';
import { Loader2 } from 'lucide-react';

const walletApi = new WalletApiService();

export const PackagesGrid: React.FC = () => {
	const { data: packages = [], isLoading } = useDgtPackages();

	const handleBuy = async (pkgId: string) => {
		try {
			const { depositUrl } = await walletApi.createPurchaseOrder(pkgId);
			window.location.href = depositUrl;
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('Failed to create purchase order', err);
			alert('Unable to create purchase order. Please try again later.');
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-10">
				<Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{packages.map((pkg) => (
				<DgtPackageCard key={pkg.id} pkg={pkg} onBuy={() => handleBuy(pkg.id)} />
			))}
		</div>
	);
};
