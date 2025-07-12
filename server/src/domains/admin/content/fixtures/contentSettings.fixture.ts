export const contentSettingsFixture = {
	domain: 'content',
	settings: {
		forums: {
			allowForumCreation: true,
			maxForumsPerCategory: 50,
			autoModeration: false
		},
		announcements: {
			maxActiveAnnouncements: 5,
			defaultDuration: 7, // days
			allowMarkdown: true
		},
		reports: {
			autoCloseAfterDays: 30,
			requireModeratorAction: true,
			emailNotifications: true
		},
		permissions: {
			read: ['admin', 'moderator'],
			write: ['admin', 'moderator'],
			manage: ['admin']
		}
	}
};