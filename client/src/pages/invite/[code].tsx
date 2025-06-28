import React, { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Wide } from '@/layout/primitives/Wide';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth.tsx';
import { CheckCircle, UserPlus, AlertCircle, Gift } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralValidation {
	isValid: boolean;
	referrerUsername?: string;
	code: string;
	alreadyUsed?: boolean;
	expired?: boolean;
	maxUsesReached?: boolean;
}

export default function InvitePage() {
	const [match, params] = useRoute('/invite/:code');
	const [, setLocation] = useLocation();
	const { user } = useAuth();
	const code = params?.code;

	const [validation, setValidation] = useState<ReferralValidation | null>(null);
	const [isValidating, setIsValidating] = useState(true);

	// Validate referral code on component mount
	useEffect(() => {
		if (!code) {
			setIsValidating(false);
			return;
		}

		const validateCode = async () => {
			try {
				const res = await apiRequest({
					url: `/api/referrals/validate/${code}`,
					method: 'GET'
				});
				const data = await res.json();
				setValidation(data);
			} catch (error) {
				setValidation({
					isValid: false,
					code: code
				});
				toast.error('Failed to validate referral code');
			} finally {
				setIsValidating(false);
			}
		};

		validateCode();
	}, [code]);

	// Apply referral code
	const applyReferralMutation = useMutation({
		mutationFn: async () => {
			const res = await apiRequest({
				url: `/api/referrals/apply`,
				method: 'POST',
				data: { code }
			});
			return res.json();
		},
		onSuccess: () => {
			toast.success('Referral code applied successfully!');
			// Redirect to home or dashboard
			setLocation('/');
		},
		onError: (error: any) => {
			const message = error?.message || 'Failed to apply referral code';
			toast.error(message);
		}
	});

	if (!match || !code) {
		return (
			<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
				<Card className="max-w-md mx-auto">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertCircle className="h-5 w-5 text-red-500" />
							Invalid Invite Link
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-zinc-400 mb-4">
							This invite link appears to be invalid or malformed.
						</p>
						<Button asChild>
							<a href="/">Go to Home</a>
						</Button>
					</CardContent>
				</Card>
			</Wide>
		);
	}

	if (isValidating) {
		return (
			<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
				<Card className="max-w-md mx-auto">
					<CardHeader>
						<CardTitle>Validating Invite...</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
							<span className="text-zinc-400">Checking referral code...</span>
						</div>
					</CardContent>
				</Card>
			</Wide>
		);
	}

	if (!validation?.isValid) {
		return (
			<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
				<Card className="max-w-md mx-auto">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertCircle className="h-5 w-5 text-red-500" />
							Invalid Referral Code
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{validation?.expired && (
							<Alert>
								<AlertDescription>
									This referral code has expired and can no longer be used.
								</AlertDescription>
							</Alert>
						)}

						{validation?.maxUsesReached && (
							<Alert>
								<AlertDescription>
									This referral code has reached its maximum number of uses.
								</AlertDescription>
							</Alert>
						)}

						{validation?.alreadyUsed && (
							<Alert>
								<AlertDescription>You have already used this referral code.</AlertDescription>
							</Alert>
						)}

						{!validation?.expired && !validation?.maxUsesReached && !validation?.alreadyUsed && (
							<Alert>
								<AlertDescription>
									This referral code is not valid or does not exist.
								</AlertDescription>
							</Alert>
						)}

						<div className="flex gap-2">
							<Button asChild variant="outline">
								<a href="/">Go to Home</a>
							</Button>
							{!user && (
								<Button asChild>
									<a href="/auth">Sign Up</a>
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			</Wide>
		);
	}

	// If user is not logged in, redirect to auth with referral code
	if (!user) {
		return (
			<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
				<Card className="max-w-md mx-auto">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserPlus className="h-5 w-5 text-emerald-500" />
							Join Degentalk
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="text-center">
							<div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
								<Gift className="h-8 w-8 text-emerald-500" />
							</div>
							<h3 className="font-semibold mb-2">{validation.referrerUsername} invited you!</h3>
							<p className="text-zinc-400 text-sm mb-4">
								Join Degentalk and you'll both earn rewards when you sign up using this referral
								code.
							</p>
						</div>

						<Alert>
							<Gift className="h-4 w-4" />
							<AlertDescription>
								By signing up with this referral, you'll get bonus DGT tokens and help{' '}
								{validation.referrerUsername} earn rewards too!
							</AlertDescription>
						</Alert>

						<Button asChild className="w-full">
							<a href={`/auth?ref=${code}`}>Sign Up & Apply Referral</a>
						</Button>

						<div className="text-center">
							<span className="text-sm text-zinc-500">
								Already have an account?{' '}
								<a href={`/auth?ref=${code}`} className="text-emerald-400 hover:text-emerald-300">
									Log in
								</a>
							</span>
						</div>
					</CardContent>
				</Card>
			</Wide>
		);
	}

	// User is logged in, show option to apply referral
	return (
		<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
			<Card className="max-w-md mx-auto">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserPlus className="h-5 w-5 text-emerald-500" />
						Apply Referral Code
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="text-center">
						<div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
							<Gift className="h-8 w-8 text-emerald-500" />
						</div>
						<h3 className="font-semibold mb-2">Referral from {validation.referrerUsername}</h3>
						<p className="text-zinc-400 text-sm mb-4">
							Apply this referral code to your account and start earning rewards together!
						</p>
					</div>

					<Alert>
						<Gift className="h-4 w-4" />
						<AlertDescription>
							Applying this referral will link your account with {validation.referrerUsername} and
							unlock bonus rewards for both of you!
						</AlertDescription>
					</Alert>

					<div className="space-y-2">
						<Button
							onClick={() => applyReferralMutation.mutate()}
							disabled={applyReferralMutation.isPending}
							className="w-full"
						>
							{applyReferralMutation.isPending ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Applying...
								</>
							) : (
								<>
									<CheckCircle className="h-4 w-4 mr-2" />
									Apply Referral Code
								</>
							)}
						</Button>

						<Button variant="outline" asChild className="w-full">
							<a href="/">Skip for Now</a>
						</Button>
					</div>

					<div className="text-center">
						<span className="text-xs text-zinc-500">
							Code: <code className="bg-zinc-800 px-1 rounded">{code}</code>
						</span>
					</div>
				</CardContent>
			</Card>
		</Wide>
	);
}
