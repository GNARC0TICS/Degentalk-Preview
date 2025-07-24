import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@app/utils/queryClient';

// This should align with the DTO from the backend
interface DgtAnalytics {
  totalDgt: number;
  totalCrypto: number;
  dgtInCirculation: number;
  dgtInTreasury: number;
}

export const useDgtAnalytics = () => {
  return useQuery<DgtAnalytics, Error>({
    queryKey: ['dgtAnalytics'],
    queryFn: () => apiRequest('/admin/wallet/dgt/analytics'),
  });
};
