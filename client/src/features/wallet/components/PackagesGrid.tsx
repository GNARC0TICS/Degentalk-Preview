import React from 'react';
import { useDgtPackages } from '@/hooks/use-dgt-packages';
import { WalletApiService } from '@/features/wallet/services/wallet-api.service';
import { DgtPackageCard } from './DgtPackageCard';
import { DegenLoader } from '@/components/uiverse-clones/loaders';
import { logger } from "@/lib/logger";

const walletApi = new WalletApiService();

export const PackagesGrid: React.FC = () => {
	const { data: packages = [], isLoading } = useDgtPackages();

	const handleBuy = async (pkgId: string) => {
		try {
			const { depositUrl } = await WalletApiService.createPurchaseOrder(pkgId);
			window.location.href = depositUrl;
		} catch (err) {
			// eslint-disable-next-line no-console
			logger.error('PackagesGrid', 'Failed to create purchase order', err);
			alert('Unable to create purchase order. Please try again later.');
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-10">
				<DegenLoader size="md" text="Loading DGT packages..." />
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
