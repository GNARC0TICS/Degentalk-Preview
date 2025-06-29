export interface InsertXpCloutSettings {
	id?: number;
	xpAmount: number;
	cloutAmount: number;
	description?: string;
}

export interface InsertXpActionSetting {
	id?: number;
	key: string;
	xp: number;
	description?: string;
}
