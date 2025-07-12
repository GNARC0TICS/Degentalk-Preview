export const usersSettingsFixture = {
	domain: 'users',
	settings: {
		pagination: {
			defaultLimit: 25,
			maxLimit: 100
		},
		userActions: {
			allowBulkOperations: true,
			allowRoleChanges: true,
			requireApprovalForBan: false
		},
		search: {
			minSearchLength: 3,
			maxResults: 20,
			includeInactiveUsers: false
		},
		permissions: {
			read: ['admin', 'moderator'],
			write: ['admin'],
			ban: ['admin']
		}
	}
};