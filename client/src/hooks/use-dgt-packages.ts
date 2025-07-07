import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { PackageId } from '@shared/types/ids';

export interface DgtPackage {
	id: PackageId;
	name: string;
	description?: string;
	dgtAmount: number;
	usdPrice: number;
	discountPercentage?: number | null;
	isFeatured: boolean;
}

export function useDgtPackages() {
	return useQuery<DgtPackage[]>({
		queryKey: ['dgtPackages'],
		queryFn: async () => {
			const res = await apiRequest<DgtPackage[]>({ url: '/api/wallet/packages', method: 'GET' });
			return res;
		}
	});
}
