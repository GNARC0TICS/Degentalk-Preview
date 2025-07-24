import type { BrandConfig } from '@app/config/brand.config';

/**
 * RuntimeBrandConfig represents the static BrandConfig enriched with runtime metadata.
 */
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

/**
 * Payload for partial updates to brand configuration sections.
 */
export interface BrandConfigUpdate {
	colors?: Partial<BrandConfig['colors']>;
	animation?: Partial<BrandConfig['animation']>;
	typography?: Partial<BrandConfig['typography']>;
	cards?: Partial<BrandConfig['cards']>;
	spacing?: Partial<BrandConfig['spacing']>;
}
