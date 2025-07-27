/**
 * Shared brand configuration types that can be used across the monorepo
 */

/**
 * RuntimeBrandConfig represents the static BrandConfig enriched with runtime metadata.
 */
export type RuntimeBrandConfig = {
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
	// Extend with actual brand config properties as needed
	colors?: Record<string, any>;
	animation?: Record<string, any>;
	typography?: Record<string, any>;
	cards?: Record<string, any>;
	spacing?: Record<string, any>;
};

/**
 * Payload for partial updates to brand configuration sections.
 */
export interface BrandConfigUpdate {
	colors?: Partial<RuntimeBrandConfig['colors']>;
	animation?: Partial<RuntimeBrandConfig['animation']>;
	typography?: Partial<RuntimeBrandConfig['typography']>;
	cards?: Partial<RuntimeBrandConfig['cards']>;
	spacing?: Partial<RuntimeBrandConfig['spacing']>;
} 