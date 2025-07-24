import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@app/utils/queryClient';

interface DgtPackage {
  id: string;
  name: string;
  dgtAmount: number;
  price: number;
}

export const useDgtPackages = () => {
  return useQuery<DgtPackage[], Error>({
    queryKey: ['dgtPackages'],
    queryFn: () => apiRequest('/admin/shop/dgt-packages'), // Assuming this endpoint exists
  });
};
