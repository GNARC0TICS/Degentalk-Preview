export type XPTrack = {
	id: string;
	label: string;
	gradient: string;
};

export const xpTracks: XPTrack[] = [
	{
		id: 'degen',
		label: 'Degen XP',
		gradient: 'conic-gradient(from 90deg, #7f5af0, #2cb67d, #7f5af0)'
	},
	{
		id: 'clout',
		label: 'Clout',
		gradient: 'conic-gradient(from 90deg, #ff8906, #f25f4c, #ff8906)'
	}
];
