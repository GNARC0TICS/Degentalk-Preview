import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { referralsApi } from '../services/referralsApi';
import type { UserReferralStats } from '../services/referralsApi';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for managing user referrals
 */
export function useUserReferrals() {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  // Fetch user referral stats
  const { 
    data: referralStats, 
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['userReferrals'],
    queryFn: () => referralsApi.getUserReferrals(),
    retry: 1
  });

  // Fetch user referral link
  const {
    data: referralLink,
    isLoading: isLoadingLink,
    error: linkError
  } = useQuery({
    queryKey: ['userReferralLink'],
    queryFn: () => referralsApi.getReferralLink(),
    retry: 1
  });

  // Copy referral link to clipboard
  const copyReferralLink = useCallback(async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setIsCopied(true);
      toast({
        title: 'Success',
        description: 'Referral link copied to clipboard',
        variant: 'default'
      });
      
      // Reset copied state after 3 seconds
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy referral link:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy referral link',
        variant: 'destructive'
      });
    }
  }, [referralLink, toast]);

  return {
    referralStats,
    referralLink,
    isLoading: isLoadingStats || isLoadingLink,
    error: statsError || linkError,
    copyReferralLink,
    isCopied,
    refetchStats
  };
} 