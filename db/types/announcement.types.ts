export type Announcement = {
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
