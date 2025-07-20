import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RainAnalyticsCard from './RainAnalyticsCard.tsx';
import TippingAnalyticsCard from './TippingAnalyticsCard.tsx';

interface EngagementAnalyticsDashboardProps {
	className?: string;
}

/**
 * Unified dashboard for engagement analytics
 *
 * Displays both Rain and Tipping analytics in a single component
 * for a comprehensive view of token-based user interactions
 */
const EngagementAnalyticsDashboard: React.FC<EngagementAnalyticsDashboardProps> = ({
	className
}) => {
	return (
		<div className={`space-y-6 ${className}`}>
			<Card>
				<CardHeader>
					<CardTitle>Engagement Analytics</CardTitle>
					<CardDescription>
						Comprehensive analytics for token-based user interactions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-6 md:grid-cols-2">
						<TippingAnalyticsCard className="w-full" />
						<RainAnalyticsCard className="w-full" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default EngagementAnalyticsDashboard;
