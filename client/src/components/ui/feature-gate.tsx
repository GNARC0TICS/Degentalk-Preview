import React from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureGates';
import { Lock, AlertCircle, BadgeInfo, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface FeatureGateProps {
	featureId: string;
	children: React.ReactNode;
	fallback?: React.ReactNode;
	showGradientBorder?: boolean;
	redirectLoginTo?: string;
}

/**
 * FeatureGate component
 *
 * Wraps content that requires a certain XP level or badge to access.
 * Shows a locked overlay with info when requirements are not met.
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
	featureId,
	children,
	fallback,
	showGradientBorder = false,
	redirectLoginTo
}) => {
	const [, navigate] = useLocation();
	const { hasAccess, isLoading, reason, unlocksAtLevel, missingBadge } =
		useFeatureAccess(featureId);

	useEffect(() => {
		if (!isLoading && !hasAccess && reason === 'login_required') {
			navigate(`/login?redirect=${redirectLoginTo || window.location.pathname}`);
		}
	}, [isLoading, hasAccess, reason, navigate, redirectLoginTo]);

	// If loading, show a placeholder
	if (isLoading) {
		return (
			<div className="animate-pulse rounded-md bg-zinc-800/50 flex items-center justify-center min-h-[100px]">
				<div className="h-8 w-8 rounded-full bg-zinc-700/50" />
			</div>
		);
	}

	// If user has access, show the actual content
	if (hasAccess) {
		// With optional gradient border for premium features
		if (showGradientBorder) {
			return (
				<div className="p-[1px] rounded-xl relative bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-500">
					<div className="bg-zinc-900 rounded-xl overflow-hidden">{children}</div>
				</div>
			);
		}

		// Normal display
		return <>{children}</>;
	}

	// If fallback is provided, use it instead of lock screen
	if (fallback) {
		return <>{fallback}</>;
	}

	// Otherwise show locked content overlay
	return (
		<div className="relative overflow-hidden rounded-xl">
			{/* Blurred content in background */}
			<div className="filter blur-sm opacity-30 pointer-events-none">{children}</div>

			{/* Lock overlay */}
			<div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
				<motion.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.3 }}
					className="max-w-md"
				>
					{reason === 'login_required' ? (
						<>
							<AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
							<h3 className="text-xl font-bold mb-2">Login Required</h3>
							<p className="text-zinc-400 mb-4">You need to be logged in to access this feature.</p>
							<Button
								onClick={() =>
									navigate(`/login?redirect=${redirectLoginTo || window.location.pathname}`)
								}
								className="bg-gradient-to-r from-amber-600 to-amber-500"
							>
								Login to Continue
							</Button>
						</>
					) : reason === 'level_too_low' ? (
						<>
							<ArrowUpCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
							<h3 className="text-xl font-bold mb-2">Level Up Required</h3>
							<p className="text-zinc-400 mb-4">
								This feature unlocks at Level {unlocksAtLevel}. Keep participating to earn more XP!
							</p>
							<Button
								onClick={() => navigate('/profile/xp')}
								variant="outline"
								className="border-emerald-700 text-emerald-500 hover:bg-emerald-950"
							>
								View Your XP Progress
							</Button>
						</>
					) : reason === 'badge_required' ? (
						<>
							<BadgeInfo className="h-12 w-12 text-blue-500 mx-auto mb-4" />
							<h3 className="text-xl font-bold mb-2">Badge Required</h3>
							<p className="text-zinc-400 mb-4">
								You need the "{missingBadge}" badge to access this feature.
							</p>
							<Button
								onClick={() => navigate('/badges')}
								variant="outline"
								className="border-blue-700 text-blue-500 hover:bg-blue-950"
							>
								View Available Badges
							</Button>
						</>
					) : (
						<>
							<Lock className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
							<h3 className="text-xl font-bold mb-2">Content Locked</h3>
							<p className="text-zinc-400 mb-4">You do not have access to this feature.</p>
						</>
					)}
				</motion.div>
			</div>
		</div>
	);
};

export default FeatureGate;
