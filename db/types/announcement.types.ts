import type { AnnouncementId } from '@shared/types/ids';

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
