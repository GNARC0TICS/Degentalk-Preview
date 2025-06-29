import type { BrandConfig } from '@/config/brand.config';

export type RuntimeBrandConfig = BrandConfig & {
	id?: string;
	name?: string;
	version?: string;
	environment?: 'dev' | 'staging' | 'prod';
	isActive?: boolean;
	metadata?: {
		lastModified?: Date;
		modifiedBy?: string;
		changeLog?: string[];
	};
};

export interface BrandConfigUpdate {
	colors?: Partial<BrandConfig['colors']>;
	animation?: Partial<BrandConfig['animation']>;
	typography?: Partial<BrandConfig['typography']>;
	cards?: Partial<BrandConfig['cards']>;
	spacing?: Partial<BrandConfig['spacing']>;
}
