// Shared constants for the application

export const CONTENT_STATUS_CONFIG = {
	draft: { color: 'gray', label: 'Draft', visibleTo: 'author' },
	pending_review: { color: 'orange', label: 'Pending Review', visibleTo: 'mods' },
	published: { color: 'green', label: 'Published', visibleTo: 'all' },
	rejected: { color: 'red', label: 'Rejected', visibleTo: 'author+mods' },
	archived: { color: 'gray', label: 'Archived', visibleTo: 'mods+admins' }
} as const;

export type ContentStatusKey = keyof typeof CONTENT_STATUS_CONFIG;

// Add other shared constants below as needed
