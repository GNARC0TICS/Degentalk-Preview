/**
 * Settings Services Barrel Export
 *
 * Centralized exports for all settings-related services
 * Provides clean imports and service discovery
 */

// Individual specialized services
export { SettingsQueryService, settingsQueryService } from './settings-query.service';
export { SettingsCommandService, settingsCommandService } from './settings-command.service';
export {
	SettingsValidationService,
	settingsValidationService
} from './settings-validation.service';
export { SettingsGroupService, settingsGroupService } from './settings-group.service';

// Main orchestrator service
export { AdminSettingsService, adminSettingsService } from '../settings.service.refactored';

// Type exports
export type { ToggleFeatureFlagInput } from './settings-command.service';

/**
 * Service Dependencies Map
 *
 * This shows the dependency relationships between services:
 *
 * AdminSettingsService (Orchestrator)
 * ├── SettingsQueryService (no dependencies)
 * ├── SettingsCommandService
 * │   ├── → SettingsQueryService
 * │   └── → SettingsValidationService
 * ├── SettingsValidationService
 * │   └── → SettingsQueryService
 * └── SettingsGroupService (no dependencies)
 *
 * Benefits of this architecture:
 * - Single Responsibility: Each service has one clear purpose
 * - Loose Coupling: Services are independent and composable
 * - Easy Testing: Mock individual services for unit tests
 * - Clear Dependencies: No circular dependencies
 * - Maintainable: Changes to one service don't affect others
 */
