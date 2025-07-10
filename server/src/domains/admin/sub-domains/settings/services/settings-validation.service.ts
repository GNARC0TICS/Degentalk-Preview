/**
 * Settings Validation Service
 *
 * Handles business logic validation for settings operations
 * Focused on data integrity, business rules, and constraint validation
 */

import { logger } from '@core/logger';
import { AdminError, AdminErrorCodes } from '../../../admin.errors';
import { settingsQueryService } from './settings-query.service';
import type { CreateSettingInput, UpdateSettingMetadataInput } from '../settings.validators';

export class SettingsValidationService {
	// Critical settings that cannot be deleted
	private readonly PROTECTED_SETTINGS = [
		'site_name',
		'site_description',
		'maintenance_mode',
		'registration_enabled',
		'api_rate_limit'
	];

	// Settings that require specific value formats
	private readonly VALUE_PATTERNS = {
		email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
		url: /^https?:\/\/.+/,
		number: /^\d+(\.\d+)?$/,
		boolean: /^(true|false)$/i,
		json: (value: string) => {
			try {
				JSON.parse(value);
				return true;
			} catch {
				return false;
			}
		}
	};

	/**
	 * Validate that a setting exists
	 */
	async validateSettingExists(key: string) {
		if (!key || typeof key !== 'string') {
			throw new AdminError('Setting key is required', 400, AdminErrorCodes.INVALID_REQUEST);
		}

		const exists = await settingsQueryService.settingExists(key);
		if (!exists) {
			throw new AdminError(`Setting with key "${key}" not found`, 404, AdminErrorCodes.NOT_FOUND);
		}
	}

	/**
	 * Validate that a setting does not exist (for creation)
	 */
	async validateSettingNotExists(key: string) {
		if (!key || typeof key !== 'string') {
			throw new AdminError('Setting key is required', 400, AdminErrorCodes.INVALID_REQUEST);
		}

		const exists = await settingsQueryService.settingExists(key);
		if (exists) {
			throw new AdminError(
				`Setting with key "${key}" already exists`,
				409,
				AdminErrorCodes.DUPLICATE_ENTRY
			);
		}
	}

	/**
	 * Validate setting value based on its type and constraints
	 */
	async validateSettingValue(key: string, value: any) {
		try {
			// Get the setting to check its type and constraints
			const setting = await settingsQueryService.getSettingByKey(key);

			// Convert value to string for validation
			const stringValue = String(value);

			// Validate based on setting type
			switch (setting.type) {
				case 'boolean':
					if (!this.VALUE_PATTERNS.boolean.test(stringValue)) {
						throw new AdminError(
							'Boolean settings must be "true" or "false"',
							400,
							AdminErrorCodes.VALIDATION_ERROR
						);
					}
					break;

				case 'number':
					if (!this.VALUE_PATTERNS.number.test(stringValue)) {
						throw new AdminError(
							'Number settings must contain valid numeric values',
							400,
							AdminErrorCodes.VALIDATION_ERROR
						);
					}
					break;

				case 'email':
					if (!this.VALUE_PATTERNS.email.test(stringValue)) {
						throw new AdminError(
							'Email settings must contain valid email addresses',
							400,
							AdminErrorCodes.VALIDATION_ERROR
						);
					}
					break;

				case 'url':
					if (!this.VALUE_PATTERNS.url.test(stringValue)) {
						throw new AdminError(
							'URL settings must start with http:// or https://',
							400,
							AdminErrorCodes.VALIDATION_ERROR
						);
					}
					break;

				case 'json':
					if (!this.VALUE_PATTERNS.json(stringValue)) {
						throw new AdminError(
							'JSON settings must contain valid JSON',
							400,
							AdminErrorCodes.VALIDATION_ERROR
						);
					}
					break;

				case 'string':
				default:
					// String validation - check length constraints
					if (stringValue.length > 5000) {
						throw new AdminError(
							'Setting value is too long (max 5000 characters)',
							400,
							AdminErrorCodes.VALIDATION_ERROR
						);
					}
					break;
			}

			// Apply specific business rules for certain settings
			await this.validateBusinessRules(key, stringValue);
		} catch (error) {
			if (error instanceof AdminError) throw error;

			logger.error('SettingsValidationService', 'Error validating setting value', {
				error: error.message,
				key
			});
			throw new AdminError(
				'Failed to validate setting value',
				500,
				AdminErrorCodes.VALIDATION_ERROR
			);
		}
	}

	/**
	 * Validate new setting creation data
	 */
	async validateNewSettingData(data: CreateSettingInput) {
		const { key, name, value, type } = data;

		// Validate key format
		if (!/^[a-z0-9_]+$/.test(key)) {
			throw new AdminError(
				'Setting key must contain only lowercase letters, numbers, and underscores',
				400,
				AdminErrorCodes.VALIDATION_ERROR
			);
		}

		// Validate key length
		if (key.length < 3 || key.length > 100) {
			throw new AdminError(
				'Setting key must be between 3 and 100 characters',
				400,
				AdminErrorCodes.VALIDATION_ERROR
			);
		}

		// Validate name
		if (!name || name.trim().length < 3) {
			throw new AdminError(
				'Setting name must be at least 3 characters',
				400,
				AdminErrorCodes.VALIDATION_ERROR
			);
		}

		// Validate type
		const validTypes = ['string', 'number', 'boolean', 'email', 'url', 'json'];
		if (type && !validTypes.includes(type)) {
			throw new AdminError(
				`Setting type must be one of: ${validTypes.join(', ')}`,
				400,
				AdminErrorCodes.VALIDATION_ERROR
			);
		}

		// Validate value against type
		if (type && value !== undefined) {
			await this.validateValueForType(value, type);
		}
	}

	/**
	 * Validate setting metadata update
	 */
	async validateSettingMetadata(data: UpdateSettingMetadataInput) {
		// Validate name if provided
		if (data.name !== undefined) {
			if (!data.name || data.name.trim().length < 3) {
				throw new AdminError(
					'Setting name must be at least 3 characters',
					400,
					AdminErrorCodes.VALIDATION_ERROR
				);
			}
		}

		// Validate type if provided
		if (data.type !== undefined) {
			const validTypes = ['string', 'number', 'boolean', 'email', 'url', 'json'];
			if (!validTypes.includes(data.type)) {
				throw new AdminError(
					`Setting type must be one of: ${validTypes.join(', ')}`,
					400,
					AdminErrorCodes.VALIDATION_ERROR
				);
			}
		}

		// Validate description length
		if (data.description !== undefined && data.description.length > 1000) {
			throw new AdminError(
				'Setting description cannot exceed 1000 characters',
				400,
				AdminErrorCodes.VALIDATION_ERROR
			);
		}
	}

	/**
	 * Validate that a setting can be deleted
	 */
	async validateSettingCanBeDeleted(key: string) {
		// Check if setting exists
		await this.validateSettingExists(key);

		// Check if setting is protected
		if (this.PROTECTED_SETTINGS.includes(key)) {
			throw new AdminError(
				`Setting "${key}" is protected and cannot be deleted`,
				403,
				AdminErrorCodes.FORBIDDEN
			);
		}

		// Additional business logic checks could go here
		// e.g., check if setting is referenced by other systems
	}

	/**
	 * Apply business rules for specific settings
	 */
	private async validateBusinessRules(key: string, value: string) {
		switch (key) {
			case 'api_rate_limit':
				const rateLimit = parseInt(value);
				if (rateLimit < 10 || rateLimit > 10000) {
					throw new AdminError(
						'API rate limit must be between 10 and 10000',
						400,
						AdminErrorCodes.VALIDATION_ERROR
					);
				}
				break;

			case 'max_upload_size':
				const uploadSize = parseInt(value);
				if (uploadSize < 1 || uploadSize > 100) {
					throw new AdminError(
						'Max upload size must be between 1MB and 100MB',
						400,
						AdminErrorCodes.VALIDATION_ERROR
					);
				}
				break;

			case 'session_timeout':
				const timeout = parseInt(value);
				if (timeout < 300 || timeout > 86400) {
					throw new AdminError(
						'Session timeout must be between 5 minutes and 24 hours',
						400,
						AdminErrorCodes.VALIDATION_ERROR
					);
				}
				break;

			// Add more business rules as needed
		}
	}

	/**
	 * Validate value against a specific type
	 */
	private async validateValueForType(value: any, type: string) {
		const stringValue = String(value);

		switch (type) {
			case 'boolean':
				if (!this.VALUE_PATTERNS.boolean.test(stringValue)) {
					throw new AdminError(
						'Boolean value must be "true" or "false"',
						400,
						AdminErrorCodes.VALIDATION_ERROR
					);
				}
				break;

			case 'number':
				if (!this.VALUE_PATTERNS.number.test(stringValue)) {
					throw new AdminError(
						'Number value must be a valid number',
						400,
						AdminErrorCodes.VALIDATION_ERROR
					);
				}
				break;

			case 'email':
				if (!this.VALUE_PATTERNS.email.test(stringValue)) {
					throw new AdminError(
						'Email value must be a valid email address',
						400,
						AdminErrorCodes.VALIDATION_ERROR
					);
				}
				break;

			case 'url':
				if (!this.VALUE_PATTERNS.url.test(stringValue)) {
					throw new AdminError(
						'URL value must start with http:// or https://',
						400,
						AdminErrorCodes.VALIDATION_ERROR
					);
				}
				break;

			case 'json':
				if (!this.VALUE_PATTERNS.json(stringValue)) {
					throw new AdminError(
						'JSON value must be valid JSON',
						400,
						AdminErrorCodes.VALIDATION_ERROR
					);
				}
				break;
		}
	}
}

// Export singleton instance
export const settingsValidationService = new SettingsValidationService();
