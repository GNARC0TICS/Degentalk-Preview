import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Home, ChevronLeft, Wallet, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Wide } from '@/layout/primitives';
import useSearchParams from '@/hooks/useSearchParams';

export default function PurchaseSuccessPage() {
	const navigate = useNavigate();
	const searchParams = useSearchParams();
	const [purchaseDetails, setPurchaseDetails] = useState<{
		amount?: number;
		dgtAmount?: number;
	}>({});

	// Trigger confetti effect when the component mounts
	useEffect(() => {
		if (!searchParams) return;
		// Parse URL parameters to get purchase details
		const amount = searchParams.get('amount');
		const dgtAmount = searchParams.get('dgt_amount');

		if (amount) {
			setPurchaseDetails({
				amount: parseFloat(amount),
				dgtAmount: dgtAmount ? parseInt(dgtAmount, 10) : undefined
			});
		}

		// Trigger confetti
		triggerConfetti();

		// Clean up confetti after component unmounts
		return () => {
			confetti.reset();
		};
	}, [searchParams]);

	// Function to trigger the confetti effect
	const triggerConfetti = () => {
		const duration = 3000;
		const end = Date.now() + duration;

		// Initial burst
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444']
		});

		// Continuous confetti for the duration
		const interval = setInterval(() => {
			if (Date.now() > end) {
				clearInterval(interval);
				return;
			}

			confetti({
				particleCount: 2,
				angle: Math.random() * 360,
				spread: 50,
				origin: {
					x: Math.random(),
					y: Math.random() - 0.2
				},
				colors: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444']
			});
		}, 200);
	};

	return (
		<Wide className="px-4 py-8">
			{/* Navigation */}
			<div className="mb-6">
				<Link to="/shop">
					<Button variant="ghost" className="flex items-center text-zinc-400 hover:text-white">
						<ChevronLeft className="h-4 w-4 mr-1" />
						Back to Shop
					</Button>
				</Link>
			</div>

			<div className="max-w-md mx-auto text-center">
				{/* Success Icon */}
				<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-900/30 flex items-center justify-center">
					<Check className="h-10 w-10 text-green-500" />
				</div>

				{/* Success Message */}
				<h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>

				<p className="text-muted-foreground mb-8">
					{purchaseDetails.dgtAmount ? (
						<>
							<span className="text-white font-medium">
								{purchaseDetails.dgtAmount.toLocaleString()} DGT
							</span>{' '}
							tokens have been added to your wallet
						</>
					) : (
						<>
							Your purchase was completed successfully and DGT tokens have been added to your wallet
						</>
					)}
				</p>

				{/* Action Buttons */}
				<div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-8">
					<Button
						variant="outline"
						className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600"
						onClick={() => navigate('/wallet')}
					>
						<Wallet className="h-4 w-4 mr-2 text-emerald-500" />
						View Wallet
					</Button>

					<Button
						variant="outline"
						className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600"
						onClick={() => navigate('/shop')}
					>
						<ShoppingCart className="h-4 w-4 mr-2 text-primary" />
						Continue Shopping
					</Button>
				</div>

				<Button variant="default" className="px-8" onClick={() => navigate('/')}>
					<Home className="h-4 w-4 mr-2" />
					Return to Home
				</Button>
			</div>
		</Wide>
	);
}
