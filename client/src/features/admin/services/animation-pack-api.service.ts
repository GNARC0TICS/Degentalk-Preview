import { apiRequest } from '@/lib/queryClient';

export interface PackPayload {
	name: string;
	description?: string;
	rarity: 'cope' | 'mid' | 'exit' | 'mythic';
	priceDgt?: number;
	isPublished: boolean;
	contents: number[];
}

export class AnimationPackApiService {
	async createPack(payload: PackPayload) {
		return apiRequest({ url: '/api/admin/animation-packs', method: 'POST', data: payload });
	}
}

export const animationPackApiService = new AnimationPackApiService();
