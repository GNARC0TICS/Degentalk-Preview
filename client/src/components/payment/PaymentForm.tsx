import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useToast } from '@app/hooks/use-toast';
import { DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@app/components/ui/button';
import { Checkbox } from '@app/components/ui/checkbox';
import { Label } from '@app/components/ui/label';
import { Dialog, DialogContent, DialogTitle } from '@app/components/ui/dialog';
import { logger } from '@app/lib/logger';

interface Package {
	id?: string;
	name?: string;
	description?: string;
	dgt_amount?: number;
	usd_price?: string;
}

interface PaymentFormProps {
	packageDetail?: Package;
	returnUrl: string;
}

/**
 * A payment form component that uses Stripe Elements
 * Must be a child of StripeElementsWrapper
 */
export const PaymentForm: React.FC<PaymentFormProps> = ({ packageDetail, returnUrl }) => {
	const stripe = useStripe();
	const elements = useElements();
	const { toast } = useToast();
	const [isProcessing, setIsProcessing] = useState(false);
	const [savePaymentMethod, setSavePaymentMethod] = useState(false);

	// Format the amount for display
	const formattedAmount = packageDetail?.usd_price
		? `$${parseFloat(packageDetail.usd_price).toFixed(2)}`
		: 'Unknown amount';

	// Format the DGT amount for display
	const formattedDgtAmount = packageDetail?.dgt_amount
		? packageDetail.dgt_amount.toLocaleString()
		: 'Unknown';

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate stripe and elements are loaded
		if (!stripe || !elements) {
			toast({
				variant: 'destructive',
				title: 'Payment Error',
				description: 'Payment processing is not ready. Please try again later.'
			});
			return;
		}

		setIsProcessing(true);

		try {
			// Submit the form
			const confirmParams: any = {
				return_url: returnUrl
			};
			
			if (savePaymentMethod) {
				confirmParams.payment_method_options = {
					card: {
						setup_future_usage: 'off_session'
					}
				};
			}
			
			const { error } = await stripe.confirmPayment({
				elements,
				confirmParams
			});

			// Handle errors from Stripe
			if (error) {
				logger.error('PaymentForm', 'Payment confirmation error:', error);
				toast({
					variant: 'destructive',
					title: 'Payment Failed',
					description: error.message || 'There was an error processing your payment.'
				});
			}
			// On successful payment, the page will redirect to the returnUrl
		} catch (err) {
			logger.error('PaymentForm', 'Payment submission error:', err);
			toast({
				variant: 'destructive',
				title: 'Payment Error',
				description: 'An unexpected error occurred. Please try again later.'
			});
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<Dialog open>
			{' '}
			{/* Added Dialog */}
			<DialogContent className="sm:max-w-[425px]">
				<DialogTitle>Payment Details</DialogTitle> {/* Added DialogTitle */}
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Package info (if provided) */}
					{packageDetail && (
						<div className="mb-6 p-4 bg-primary/10 rounded-lg">
							<h4 className="font-medium mb-2">{packageDetail.name}</h4>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Price:</span>
								<span className="font-medium">{formattedAmount}</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">DGT Amount:</span>
								<span className="font-medium">{formattedDgtAmount} DGT</span>
							</div>
						</div>
					)}

					{/* Payment Element from Stripe */}
					<PaymentElement />

					{/* Save payment method for future use */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="save-payment-method"
							checked={savePaymentMethod}
							onCheckedChange={(checked) => {
								if (typeof checked === 'boolean') {
									setSavePaymentMethod(checked);
								}
							}}
						/>
						<Label htmlFor="save-payment-method" className="text-sm cursor-pointer">
							Save my payment information for future purchases
						</Label>
					</div>

					{/* Submit button */}
					<Button type="submit" className="w-full" disabled={!stripe || isProcessing}>
						{isProcessing ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Processing...
							</>
						) : (
							<>
								<DollarSign className="mr-2 h-4 w-4" />
								Pay {formattedAmount}
							</>
						)}
					</Button>

					{/* Payment security note */}
					<p className="text-xs text-muted-foreground text-center">
						All payments are secure and encrypted. By completing this purchase, you agree to our
						Terms of Service.
					</p>
				</form>
			</DialogContent>
		</Dialog>
	);
};
