import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

interface Package {
	id: string;
	name: string;
	description: string;
	dgt_amount: number;
	usd_price: string;
	image_url?: string;
	discount_percentage?: number;
	is_featured?: boolean;
}

interface PurchaseOptions {
	packageId: string;
	onSuccess?: (data: any) => void;
	onError?: (error: any) => void;
}

/**
 * A hook for managing DGT token purchases
 * This includes functionality for:
 * - Fetching available packages
 * - Creating payment intents via Stripe
 * - A development mode that bypasses Stripe for testing
 */
export function useDgtPurchase() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

	/**
	 * Fetch all available DGT packages
	 */
	const fetchPackages = async () => {
		setIsLoading(true);
		try {
			const response = await apiRequest('GET', '/api/dgt-purchase/packages');

			if (!response.ok) {
				throw new Error('Failed to fetch DGT packages');
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching DGT packages:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to load DGT packages. Please try again later.'
			});
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Mutation for creating a payment intent
	// NOTE: Stripe integration is currently paused, this is commented out until launch
	const { mutate: createPaymentIntent, isLoading: isCreatingIntent } = useMutation({
		mutationFn: async ({ packageId }: PurchaseOptions) => {
			// In production, this would call the Stripe API
			// For now, we're just going to simulate this without making actual API calls
			console.log('Creating payment intent for package', packageId);

			/*
      // STRIPE INTEGRATION - UNCOMMENT BEFORE LAUNCH
      const response = await axios.post('/api/dgt-purchase/create-payment-intent', {
        packageId
      });
      return response.data;
      */

			// Return mock data
			return {
				clientSecret: `mock_client_secret_${Date.now()}`,
				amount: 1000,
				currency: 'usd'
			};
		},
		onSuccess: (data) => {
			// In production, we would set the client secret from the response
			// setClientSecret(data.clientSecret);

			// For now, just set a mock client secret
			setClientSecret(`mock_${Date.now()}`);

			toast({
				title: 'Ready for payment',
				description: 'Payment form is ready.'
			});
		},
		onError: (error, variables) => {
			console.error('Failed to create payment intent:', error);

			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to initialize payment. Please try again.'
			});

			if (variables.onError) {
				variables.onError(error);
			}
		}
	});

	// Development mode purchase (bypasses payment processing)
	const { mutate: devModePurchase, isLoading: isDevPurchasing } = useMutation({
		mutationFn: async ({ packageId }: PurchaseOptions) => {
			const response = await axios.post('/api/dgt-purchase/dev-purchase', {
				packageId
			});
			return response.data;
		},
		onSuccess: (_, variables) => {
			toast({
				title: 'Purchase Successful',
				description: 'Your DGT tokens have been added to your account.'
			});

			// Invalidate queries to refresh wallet balance
			queryClient.invalidateQueries({ queryKey: ['wallet'] });

			if (variables.onSuccess) {
				variables.onSuccess(variables.data);
			}
		},
		onError: (error) => {
			console.error('Failed to process dev purchase:', error);

			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to process purchase. Please try again.'
			});
		}
	});

	// Mock function for confirming a payment with Stripe
	const confirmPayment = async () => {
		try {
			// In production, this would use Stripe.js to confirm the payment
			// This is just a placeholder

			toast({
				title: 'Payment Processing',
				description: 'Please wait while we process your payment...'
			});

			// Simulate payment processing delay
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Invalidate queries to refresh wallet balance
			queryClient.invalidateQueries({ queryKey: ['wallet'] });

			return { success: true };
		} catch (error) {
			console.error('Payment confirmation error:', error);

			toast({
				variant: 'destructive',
				title: 'Payment Failed',
				description: 'Your payment could not be processed. Please try again.'
			});

			return { success: false, error };
		}
	};

	return {
		fetchPackages,
		createPaymentIntent,
		devModePurchase,
		confirmPayment,
		clientSecret,
		selectedPackage,
		isLoading: isCreatingIntent || isDevPurchasing,
		clearClientSecret: () => setClientSecret(null)
	};
}
