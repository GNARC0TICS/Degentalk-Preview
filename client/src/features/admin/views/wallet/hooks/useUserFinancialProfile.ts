import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/utils/queryClient'; // Assuming apiRequest is in the new utils directory
import type { UserId } from '@shared/types/ids';

// Define the expected shape of the user's financial profile
// This should align with the DTO from the backend
interface UserFinancialProfile {
  userId: UserId;
  dgtBalance: number;
  cryptoBalance: number;
  transactionHistory: any[]; // Replace 'any' with a proper transaction type
}

export const useUserFinancialProfile = (userId: UserId | null) => {
  return useQuery<UserFinancialProfile, Error>({
    queryKey: ['userFinancialProfile', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      // The endpoint URL should match the one defined in the admin wallet routes
      return apiRequest(`/admin/wallet/user-profile/${userId}`)
    },
    enabled: !!userId, // Only run the query if the userId is not null
  });
};
