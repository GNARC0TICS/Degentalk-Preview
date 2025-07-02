import type { AnnouncementId } from './id.types';

export type Announcement = {
	id: AnnouncementId;
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
