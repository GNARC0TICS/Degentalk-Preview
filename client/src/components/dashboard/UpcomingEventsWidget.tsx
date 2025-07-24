import React from 'react';
import { CalendarClock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@app/components/ui/card';

interface UpcomingEventsWidgetProps {
	className?: string;
}

export default function UpcomingEventsWidget({ className = '' }: UpcomingEventsWidgetProps) {
	const dummyEvents = [
		{
			id: crypto.randomUUID(),
			title: 'Weekly AMA with Devs',
			date: '2025-06-22T18:00:00Z'
		},
		{
			id: crypto.randomUUID(),
			title: 'DegenShop Flash Sale',
			date: '2025-06-25T12:00:00Z'
		}
	];

	return (
		<Card className={className}>
			<CardHeader>
				<div className="flex items-center">
					<CalendarClock className="h-5 w-5 mr-2 text-primary" />
					<div>
						<CardTitle className="text-lg">Upcoming Events</CardTitle>
						<CardDescription>Don\'t miss out on the latest happenings</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{dummyEvents.map((event) => (
					<div key={event.id} className="flex items-center justify-between">
						<span className="text-sm font-medium text-white truncate">{event.title}</span>
						<span className="text-xs text-zinc-400">
							{new Date(event.date).toLocaleDateString(undefined, {
								month: 'short',
								day: 'numeric'
							})}
						</span>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
