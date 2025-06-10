import React, { useEffect, useState } from 'react';
import {
	AlertCircle,
	TrendingUp,
	Flame,
	Award,
	Megaphone,
	Info,
	Bell,
	Star,
	Zap,
	BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'wouter';

type Announcement = {
	id: number;
	content: string;
	icon?: string;
	type: string;
	createdAt: string;
	expiresAt?: string;
	priority: number;
	visibleTo?: string[];
	tickerMode?: boolean;
	link?: string;
	bgColor?: string;
	textColor?: string;
};

const getIconComponent = (iconName?: string, type: string = 'info', textColor?: string) => {
	const baseIconClasses = 'w-4 h-4';

	const getTypeStyle = (type: string, textColor?: string) => {
		if (textColor) return `text-[${textColor}]`;

		switch (type) {
			case 'alert':
				return 'text-red-400';
			case 'update':
				return 'text-cyan-400';
			case 'hot':
				return 'text-orange-400';
			case 'achievement':
				return 'text-yellow-400';
			case 'info':
				return 'text-emerald-400';
			case 'event':
				return 'text-purple-400';
			default:
				return 'text-emerald-400';
		}
	};

	const iconClasses = `${baseIconClasses} ${getTypeStyle(type, textColor)}`;

	switch (iconName) {
		case 'megaphone':
			return <Megaphone className={iconClasses} />;
		case 'alert':
			return <AlertCircle className={iconClasses} />;
		case 'bell':
			return <Bell className={iconClasses} />;
		case 'trending':
			return <TrendingUp className={iconClasses} />;
		case 'flame':
			return <Flame className={iconClasses} />;
		case 'award':
			return <Award className={iconClasses} />;
		case 'star':
			return <Star className={iconClasses} />;
		case 'zap':
			return <Zap className={iconClasses} />;
		case 'chart':
			return <BarChart3 className={iconClasses} />;
		default:
			if (type === 'alert') return <AlertCircle className={iconClasses} />;
			if (type === 'update') return <TrendingUp className={iconClasses} />;
			if (type === 'hot') return <Flame className={iconClasses} />;
			if (type === 'achievement') return <Award className={iconClasses} />;
			if (type === 'event') return <Star className={iconClasses} />;
			return <Megaphone className={iconClasses} />;
	}
};

export function AnnouncementTicker() {
	const {
		data: announcements,
		isLoading,
		error
	} = useQuery({
		queryKey: ['/api/announcements'],
		queryFn: async () => {
			const { data } = await axios.get<Announcement[]>('/api/announcements', {
				params: { ticker: 'true' } // Only fetch announcements for the ticker
			});
			return data || []; // Ensure we always return an array even if API returns null/undefined
		},
		staleTime: 5 * 60 * 1000
	});

	const [fallbackAnnouncements] = useState<Announcement[]>([
		{
			id: 0,
			type: 'info',
			content: 'Welcome to Degentalk! The community-powered crypto forum',
			createdAt: new Date().toISOString(),
			priority: 0,
			tickerMode: true
		}
	]);

	// Ensure displayAnnouncements is always an array
	const displayAnnouncements =
		Array.isArray(announcements) && announcements.length > 0
			? announcements
			: fallbackAnnouncements;

	const [isHovered, setIsHovered] = useState(false);

	// Don't show the ticker if there are no announcements
	if (!displayAnnouncements || displayAnnouncements.length === 0) {
		return null;
	}

	return (
		<div
			className="bg-zinc-900/80 border-y border-zinc-800 h-10 relative"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className="h-full flex items-center">
				{/* Static icon container */}
				<div className="absolute left-0 top-0 h-full flex items-center px-4 bg-zinc-900/80 z-10">
					<span className="flex-shrink-0">
						<Megaphone className="w-4 h-4 text-emerald-400" />
					</span>
				</div>

				{/* Left fade overlay */}
				<div className="absolute inset-y-0 left-12 w-12 bg-gradient-to-r from-zinc-900/80 to-transparent z-[5]" />

				{/* Right fade overlay */}
				<div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-zinc-900/60 to-transparent z-[5]" />

				{/* Scrolling text container */}
				<div className="ticker-track ml-12 w-full overflow-hidden">
					<div className={`ticker-content ${isHovered ? 'paused' : ''}`}>
						{displayAnnouncements.map((announcement, index) => {
							// Prepare custom styles
							const customStyle: React.CSSProperties = {};

							if (announcement.bgColor) {
								customStyle.backgroundColor = announcement.bgColor;
							}

							if (announcement.textColor) {
								customStyle.color = announcement.textColor;
							}

							const AnnouncementContent = () => (
								<span
									className="inline-flex items-center px-8 text-sm text-gray-100 whitespace-nowrap h-10"
									style={customStyle}
								>
									<span className="ml-2">{announcement.content}</span>
								</span>
							);

							// If announcement has a link, wrap it in a Link component
							return announcement.link ? (
								<Link
									key={`ann-link-${announcement.id}-${index}`}
									to={announcement.link}
									className="hover:underline"
								>
									<AnnouncementContent />
								</Link>
							) : (
								<span key={`ann-${announcement.id}-${index}`}>
									<AnnouncementContent />
								</span>
							);
						})}

						{/* Duplicate announcements for seamless loop */}
						{displayAnnouncements.map((announcement, index) => {
							// Prepare custom styles
							const customStyle: React.CSSProperties = {};

							if (announcement.bgColor) {
								customStyle.backgroundColor = announcement.bgColor;
							}

							if (announcement.textColor) {
								customStyle.color = announcement.textColor;
							}

							const AnnouncementContent = () => (
								<span
									className="inline-flex items-center px-8 text-sm text-gray-100 whitespace-nowrap h-10"
									style={customStyle}
								>
									<span className="ml-2">{announcement.content}</span>
								</span>
							);

							// If announcement has a link, wrap it in a Link component
							return announcement.link ? (
								<Link
									key={`ann-dup-link-${announcement.id}-${index}`}
									to={announcement.link}
									className="hover:underline"
								>
									<AnnouncementContent />
								</Link>
							) : (
								<span key={`ann-dup-${announcement.id}-${index}`}>
									<AnnouncementContent />
								</span>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
