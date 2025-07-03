export interface InsertXpCloutSettings {
	id?: string;
	xpAmount: number;
	cloutAmount: number;
	description?: string;
}

export interface InsertXpActionSetting {
	id?: string;
	key: string;
	xp: number;
	description?: string;
}
